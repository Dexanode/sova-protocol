import { expect } from "chai";
import { AbiCoder, hexlify, randomBytes } from "ethers";
import {
  type ConsumerPolicy,
  RejectionReason,
  evaluateAttestation,
} from "../src/ConsumerPolicy.js";
import {
  AttestationStatus,
  SOVA_REGISTRY_ADDRESS,
  SOVA_SCHEMA_ID,
  computeDataHash,
} from "../src/SovaReadClient.js";

const ISSUER = "0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28";
const NOW = 1_800_000_000n;

describe("ConsumerPolicy", function () {
  const payload = AbiCoder.defaultAbiCoder().encode(["uint8"], [1]);
  const salt = hexlify(randomBytes(32));
  const dataHash = computeDataHash(SOVA_SCHEMA_ID, payload, salt);
  const policy: ConsumerPolicy = {
    chainId: 1874n,
    registryAddress: SOVA_REGISTRY_ADDRESS,
    schemaId: SOVA_SCHEMA_ID,
    acceptedIssuers: [ISSUER],
    maxAgeSeconds: 86_400n,
    requireDisclosure: true,
  };
  const attestation = {
    schemaId: SOVA_SCHEMA_ID,
    dataHash,
    issuer: ISSUER,
    issuedAt: NOW - 60n,
    expiresAt: NOW + 3_600n,
    status: AttestationStatus.ACTIVE,
    usable: true,
  };
  const context = { chainId: 1874n, registryAddress: SOVA_REGISTRY_ADDRESS, now: NOW };

  it("accepts only a fresh active claim with a valid disclosure", function () {
    expect(evaluateAttestation(attestation, policy, context, { encodedPayload: payload, salt }))
      .to.deep.equal({ accepted: true, reasons: [] });
  });

  it("fails closed on lifecycle, issuer, freshness, and disclosure violations", function () {
    const decision = evaluateAttestation(
      {
        ...attestation,
        issuer: "0x0000000000000000000000000000000000000001",
        issuedAt: NOW - 100_000n,
        expiresAt: NOW,
        status: AttestationStatus.REVOKED,
        usable: false,
      },
      policy,
      context,
      { encodedPayload: payload, salt: hexlify(randomBytes(32)) },
    );
    expect(decision.accepted).to.equal(false);
    expect(decision.reasons).to.include.members([
      RejectionReason.UNTRUSTED_ISSUER,
      RejectionReason.INACTIVE,
      RejectionReason.NOT_USABLE,
      RejectionReason.TOO_OLD,
      RejectionReason.EXPIRED,
      RejectionReason.DISCLOSURE_MISMATCH,
    ]);
  });

  it("rejects the wrong chain and registry domain", function () {
    const decision = evaluateAttestation(attestation, policy, {
      chainId: 1n,
      registryAddress: "0x0000000000000000000000000000000000000001",
      now: NOW,
    }, { encodedPayload: payload, salt });
    expect(decision.reasons).to.include.members([
      RejectionReason.WRONG_CHAIN,
      RejectionReason.WRONG_REGISTRY,
    ]);
  });
});
