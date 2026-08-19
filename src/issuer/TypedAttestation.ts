import {
  AbiCoder,
  type TypedDataDomain,
  type TypedDataField,
  getAddress,
  keccak256,
  toUtf8Bytes,
  verifyTypedData,
} from "ethers";
import {
  SOVA_REGISTRY_ADDRESS,
  SOVA_SCHEMA_ID,
  WHITECHAIN_SEPOLIA_CHAIN_ID,
  computeDataHash,
  computeSubjectId,
} from "../SovaReadClient.js";

export const PILOT_ISSUER = "0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28";
export const PILOT_SUBJECT = "0xee76b045CA9093e40F2a298B9e218c910614e815";
export const PILOT_PROTOCOL = "0x9AD126155e6674dd33668b3eaf9Aa2B7c68D1D52";

export const ATTESTATION_TYPES: Record<string, TypedDataField[]> = {
  Attestation: [
    { name: "subjectId", type: "bytes32" },
    { name: "schemaId", type: "bytes32" },
    { name: "dataHash", type: "bytes32" },
    { name: "issuer", type: "address" },
    { name: "issuedAt", type: "uint64" },
    { name: "expiresAt", type: "uint64" },
    { name: "issuerEpoch", type: "uint64" },
    { name: "nonce", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ],
};

export type RelayRequest = {
  domain: {
    name: "SOVA Attestation Registry";
    version: "1";
    chainId: "1874";
    verifyingContract: string;
  };
  input: {
    subjectId: string;
    schemaId: string;
    dataHash: string;
    issuedAt: string;
    expiresAt: string;
    issuerEpoch: string;
    nonce: string;
  };
  issuer: string;
  deadline: string;
  attestationId: string;
};

export type DisclosureRecord = {
  encodedPayload: string;
  salt: string;
};

export type SignedRelayRequest = RelayRequest & { signature: string };

export function typedDataDomain(request: RelayRequest): TypedDataDomain {
  return {
    name: request.domain.name,
    version: request.domain.version,
    chainId: BigInt(request.domain.chainId),
    verifyingContract: request.domain.verifyingContract,
  };
}

export function typedDataValue(request: RelayRequest) {
  return {
    ...request.input,
    issuer: request.issuer,
    deadline: request.deadline,
  };
}

export function recoverRelaySigner(request: SignedRelayRequest): string {
  return verifyTypedData(
    typedDataDomain(request),
    ATTESTATION_TYPES,
    typedDataValue(request),
    request.signature,
  );
}

export function validateRelayRequest(
  request: RelayRequest,
  disclosure: DisclosureRecord,
  chainTimestamp: bigint,
): string[] {
  const errors: string[] = [];
  const equal = (left: string, right: string) => left.toLowerCase() === right.toLowerCase();
  if (request.domain.name !== "SOVA Attestation Registry") errors.push("WRONG_DOMAIN_NAME");
  if (request.domain.version !== "1") errors.push("WRONG_DOMAIN_VERSION");
  if (BigInt(request.domain.chainId) !== WHITECHAIN_SEPOLIA_CHAIN_ID) errors.push("WRONG_CHAIN");
  if (!equal(request.domain.verifyingContract, SOVA_REGISTRY_ADDRESS)) errors.push("WRONG_REGISTRY");
  if (!equal(request.issuer, PILOT_ISSUER)) errors.push("WRONG_ISSUER");
  if (!equal(request.input.schemaId, SOVA_SCHEMA_ID)) errors.push("WRONG_SCHEMA");
  if (BigInt(request.input.issuerEpoch) !== 1n) errors.push("WRONG_ISSUER_EPOCH");
  const expectedSubject = computeSubjectId(WHITECHAIN_SEPOLIA_CHAIN_ID, PILOT_SUBJECT);
  if (!equal(request.input.subjectId, expectedSubject)) errors.push("WRONG_SUBJECT");
  const expectedHash = computeDataHash(
    request.input.schemaId,
    disclosure.encodedPayload,
    disclosure.salt,
  );
  if (!equal(request.input.dataHash, expectedHash)) errors.push("DISCLOSURE_MISMATCH");
  const issuedAt = BigInt(request.input.issuedAt);
  const expiresAt = BigInt(request.input.expiresAt);
  const deadline = BigInt(request.deadline);
  const skew = issuedAt > chainTimestamp ? issuedAt - chainTimestamp : chainTimestamp - issuedAt;
  if (skew > 300n) errors.push("ISSUED_AT_OUTSIDE_CLOCK_SKEW");
  if (expiresAt <= issuedAt || expiresAt - issuedAt > 7_776_000n) errors.push("INVALID_VALIDITY");
  if (deadline < chainTimestamp || deadline > chainTimestamp + 3_600n) errors.push("INVALID_DEADLINE");
  try {
    getAddress(request.issuer);
  } catch {
    errors.push("INVALID_ISSUER_ADDRESS");
  }
  return errors;
}

export function buildSyntheticPayload(issuedAt: bigint, positionRef: string): string {
  return AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address", "bytes32", "bytes32", "uint8", "uint64", "uint64"],
    [
      WHITECHAIN_SEPOLIA_CHAIN_ID,
      PILOT_PROTOCOL,
      keccak256(toUtf8Bytes("SOVA_SYNTHETIC_RELAY_MARKET_V1")),
      positionRef,
      1,
      issuedAt - 86_400n,
      issuedAt - 60n,
    ],
  );
}
