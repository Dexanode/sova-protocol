import { expect } from "chai";
import { Wallet, hexlify, randomBytes } from "ethers";
import {
  SOVA_REGISTRY_ADDRESS,
  SOVA_SCHEMA_ID,
  computeDataHash,
  computeSubjectId,
} from "../src/SovaReadClient.js";
import {
  ATTESTATION_TYPES,
  PILOT_ISSUER,
  PILOT_SUBJECT,
  recoverRelaySigner,
  typedDataDomain,
  typedDataValue,
  validateRelayRequest,
  type DisclosureRecord,
  type RelayRequest,
} from "../src/issuer/TypedAttestation.js";

describe("TypedAttestation", function () {
  const now = 1_800_000_000n;
  const disclosure: DisclosureRecord = {
    encodedPayload: "0x1234",
    salt: hexlify(randomBytes(32)),
  };
  const request: RelayRequest = {
    domain: {
      name: "SOVA Attestation Registry",
      version: "1",
      chainId: "1874",
      verifyingContract: SOVA_REGISTRY_ADDRESS,
    },
    input: {
      subjectId: computeSubjectId(1874n, PILOT_SUBJECT),
      schemaId: SOVA_SCHEMA_ID,
      dataHash: computeDataHash(SOVA_SCHEMA_ID, disclosure.encodedPayload, disclosure.salt),
      issuedAt: now.toString(),
      expiresAt: (now + 3_600n).toString(),
      issuerEpoch: "1",
      nonce: hexlify(randomBytes(32)),
    },
    issuer: PILOT_ISSUER,
    deadline: (now + 900n).toString(),
    attestationId: hexlify(randomBytes(32)),
  };

  it("validates an exact request and rejects disclosure tampering", function () {
    expect(validateRelayRequest(request, disclosure, now)).to.deep.equal([]);
    expect(validateRelayRequest(request, { ...disclosure, salt: hexlify(randomBytes(32)) }, now))
      .to.include("DISCLOSURE_MISMATCH");
  });

  it("recovers the isolated EIP-712 signer and detects request tampering", async function () {
    const wallet = Wallet.createRandom();
    const walletRequest = { ...request, issuer: wallet.address };
    const signature = await wallet.signTypedData(
      typedDataDomain(walletRequest),
      ATTESTATION_TYPES,
      typedDataValue(walletRequest),
    );
    expect(recoverRelaySigner({ ...walletRequest, signature })).to.equal(wallet.address);
    const tampered = {
      ...walletRequest,
      input: { ...walletRequest.input, expiresAt: (now + 7_200n).toString() },
      signature,
    };
    expect(recoverRelaySigner(tampered)).not.to.equal(wallet.address);
  });

  it("rejects stale, cross-chain, and wrong-epoch requests before signing", function () {
    const invalid: RelayRequest = {
      ...request,
      domain: { ...request.domain, chainId: "1" as "1874" },
      input: { ...request.input, issuedAt: (now - 301n).toString(), issuerEpoch: "2" },
    };
    expect(validateRelayRequest(invalid, disclosure, now)).to.include.members([
      "WRONG_CHAIN",
      "WRONG_ISSUER_EPOCH",
      "ISSUED_AT_OUTSIDE_CLOCK_SKEW",
    ]);
  });
});
