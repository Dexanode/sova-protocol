import { AttestationStatus, verifyDisclosure } from "./SovaReadClient.js";

export type ReadAttestation = {
  schemaId: string;
  dataHash: string;
  issuer: string;
  issuedAt: bigint;
  expiresAt: bigint;
  status: AttestationStatus;
  usable: boolean;
};

export type Disclosure = {
  encodedPayload: string;
  salt: string;
};

export type ConsumerPolicy = {
  chainId: bigint;
  registryAddress: string;
  schemaId: string;
  acceptedIssuers: readonly string[];
  maxAgeSeconds: bigint;
  requireDisclosure: boolean;
};

export enum RejectionReason {
  WRONG_CHAIN = "WRONG_CHAIN",
  WRONG_REGISTRY = "WRONG_REGISTRY",
  WRONG_SCHEMA = "WRONG_SCHEMA",
  UNTRUSTED_ISSUER = "UNTRUSTED_ISSUER",
  INACTIVE = "INACTIVE",
  NOT_USABLE = "NOT_USABLE",
  ISSUED_IN_FUTURE = "ISSUED_IN_FUTURE",
  TOO_OLD = "TOO_OLD",
  EXPIRED = "EXPIRED",
  DISCLOSURE_REQUIRED = "DISCLOSURE_REQUIRED",
  DISCLOSURE_MISMATCH = "DISCLOSURE_MISMATCH",
}

export type EvaluationContext = {
  chainId: bigint;
  registryAddress: string;
  now: bigint;
};

export type PolicyDecision = {
  accepted: boolean;
  reasons: RejectionReason[];
};

export function evaluateAttestation(
  attestation: ReadAttestation,
  policy: ConsumerPolicy,
  context: EvaluationContext,
  disclosure?: Disclosure,
): PolicyDecision {
  const reasons: RejectionReason[] = [];
  const equal = (left: string, right: string) => left.toLowerCase() === right.toLowerCase();

  if (context.chainId !== policy.chainId) reasons.push(RejectionReason.WRONG_CHAIN);
  if (!equal(context.registryAddress, policy.registryAddress)) {
    reasons.push(RejectionReason.WRONG_REGISTRY);
  }
  if (!equal(attestation.schemaId, policy.schemaId)) reasons.push(RejectionReason.WRONG_SCHEMA);
  if (!policy.acceptedIssuers.some((issuer) => equal(issuer, attestation.issuer))) {
    reasons.push(RejectionReason.UNTRUSTED_ISSUER);
  }
  if (attestation.status !== AttestationStatus.ACTIVE) reasons.push(RejectionReason.INACTIVE);
  if (!attestation.usable) reasons.push(RejectionReason.NOT_USABLE);
  if (attestation.issuedAt > context.now) {
    reasons.push(RejectionReason.ISSUED_IN_FUTURE);
  } else if (context.now - attestation.issuedAt > policy.maxAgeSeconds) {
    reasons.push(RejectionReason.TOO_OLD);
  }
  if (attestation.expiresAt <= context.now) reasons.push(RejectionReason.EXPIRED);

  if (policy.requireDisclosure && disclosure === undefined) {
    reasons.push(RejectionReason.DISCLOSURE_REQUIRED);
  } else if (
    disclosure !== undefined
    && !verifyDisclosure(
      attestation.dataHash,
      attestation.schemaId,
      disclosure.encodedPayload,
      disclosure.salt,
    )
  ) {
    reasons.push(RejectionReason.DISCLOSURE_MISMATCH);
  }

  return { accepted: reasons.length === 0, reasons };
}
