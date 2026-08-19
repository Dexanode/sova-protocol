# SOVA reputation model v0.1

Status: **frozen for Phase 0.5 implementation**

## 1. Purpose

SOVA is a registry of verifiable claims about onchain activity. It is not a
canonical credit bureau and it does not publish a universal reputation score.
Protocols consume SOVA attestations under their own explicit trust and scoring
policies.

The v0.1 model optimizes for:

- independently verifiable provenance;
- bounded issuer authority;
- cheap revocation and expiry checks;
- cross-chain subject identifiers;
- no plaintext personal or financial evidence onchain;
- deterministic indexing from events.

## 2. Core entities

### Subject

A subject is represented by a chain-scoped identifier:

```text
subjectId = keccak256(abi.encode("SOVA_SUBJECT_V1", chainId, account))
```

This prevents the same 20-byte address on different chains from being silently
treated as the same identity. Linking two subjects requires a separate,
explicit, consented link attestation. SOVA never assumes cross-chain ownership.

### Schema

A schema defines the meaning and encoding of an attestation. Its immutable ID
is derived from canonical schema content:

```text
schemaId = keccak256(canonicalSchemaDocument)
```

Each schema document must define:

- human-readable name and version;
- ABI or canonical JSON payload encoding;
- issuer eligibility policy;
- maximum validity period;
- revocation expectations;
- privacy classification;
- interpretation guidance for consumers.

Changing semantics creates a new `schemaId`; a schema is never edited in place.

### Issuer

An issuer is an EVM account authorized for one or more schemas. Authorization is
schema-scoped and time-bounded. An issuer cannot issue under an unrelated
schema merely because it is trusted elsewhere.

Issuer authorization records contain:

- issuer address;
- schema ID;
- activation and optional expiration time;
- active/suspended/revoked status;
- metadata commitment for public issuer documentation.

### Attestation

An attestation is a signed claim from an issuer about one subject:

```solidity
struct Attestation {
    bytes32 subjectId;
    bytes32 schemaId;
    bytes32 dataHash;
    address issuer;
    uint64 issuedAt;
    uint64 expiresAt;
    uint64 revokedAt;
    bytes32 revocationReason;
}
```

`dataHash` is a commitment to an offchain payload and a high-entropy salt:

```text
dataHash = keccak256(abi.encode(schemaId, canonicalPayload, salt))
```

No URI is required onchain. Evidence availability is a concern between issuer,
subject, and consumer; the chain proves commitment and lifecycle only.

The canonical attestation ID is:

```text
attestationId = keccak256(
  abi.encode("SOVA_ATTESTATION_V1", subjectId, schemaId, issuer, nonce)
)
```

The issuer nonce prevents accidental ID collisions and makes replacement an
explicit new attestation.

## 3. Issuance rules

The registry accepts an attestation only when:

1. the schema exists and is active;
2. the issuer is active for that exact schema;
3. `issuedAt` is within the permitted clock-skew window;
4. `expiresAt > issuedAt`;
5. validity does not exceed the schema maximum;
6. the attestation ID has never been used;
7. the EIP-712 signature is valid when issuance is relayed.

Direct issuance by `msg.sender == issuer` and relayed EIP-712 issuance have
identical validation. Relayers gain no authority and may not alter signed data.

## 4. Lifecycle

An attestation is one of:

- `ACTIVE`: issued, unexpired, unrevoked, and issuer authorization is usable;
- `EXPIRED`: `block.timestamp >= expiresAt`;
- `REVOKED`: the issuer explicitly revoked it;
- `ISSUER_SUSPENDED`: the claim remains in history but must not be accepted
  while its issuer authorization is suspended;
- `ISSUER_INACTIVE`: the issuer authorization is not yet active or has expired;
- `ISSUER_REVOKED`: issuer authorization was permanently revoked.

Status is derived at read time. Historical records are never deleted.

Only the original issuer may revoke an attestation. Governance may suspend or
revoke issuer authorization, but may not rewrite the issuer's claim. A subject
cannot erase an adverse claim; it can publish a dispute attestation through a
dedicated schema. Consumers decide how disputes affect policy.

Revocation is permanent and idempotent. Corrections use revoke-and-reissue.

## 5. Trust model

SOVA separates three decisions:

1. **Registry validity** — signature, authorization, schema, time, and lifecycle
   checks performed by the contract.
2. **Claim truth** — responsibility of the issuer and its published methodology.
3. **Decision policy** — responsibility of the consuming protocol.

The registry MUST NOT return a protocol-wide numeric score. Consumers select:

- accepted schema versions;
- accepted issuers or issuer groups;
- freshness requirements;
- dispute treatment;
- aggregation and risk thresholds.

For v0.1, issuer/schema administration is controlled by a delayed multisig.
Phase 0.5 contracts must expose ownership transfer and role-change events. The
production deployment must not use a single externally owned account as admin.

## 6. Privacy boundary

The following MUST NOT be stored onchain:

- names, email addresses, phone numbers, government identifiers;
- exact balances, positions, transaction histories, or credit limits;
- unsalted hashes of low-entropy facts;
- plaintext evidence URLs containing access tokens;
- encryption keys or decryption material.

Onchain data is public and permanent. Hashing does not make predictable data
private. Payload salts must be generated from at least 128 bits of secure
randomness and shared only with intended verifiers.

Selective disclosure and zero-knowledge proofs may be added later as new
schemas. They do not change the registry lifecycle model.

## 7. Consumer validation checklist

A consumer accepting an attestation must verify:

- expected chain and registry address;
- expected `schemaId` and version;
- accepted issuer and current issuer state;
- active lifecycle status and required freshness;
- payload commitment against the disclosed payload and salt;
- application-specific replay/domain constraints;
- dispute attestations required by its policy.

Reading an attestation from SOVA is not sufficient evidence by itself.

## 8. Explicit non-goals for v0.1

- universal or protocol-owned reputation scores;
- identity recovery or proof of personhood;
- automatic wallet clustering;
- cross-chain message verification;
- storage or availability guarantees for evidence;
- adjudication of whether a claim is factually correct;
- confidential onchain state.
