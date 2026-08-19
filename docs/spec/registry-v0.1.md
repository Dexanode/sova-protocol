# SOVA Attestation Registry v0.1

Status: **implementation candidate; independent audit required before production**

## Contract

`SovaAttestationRegistry` implements the frozen reputation model without
upgradeability or onchain enumeration. All collection views are event-indexed;
state-changing paths have constant complexity.

## Administrative API

- `registerSchema` creates an immutable schema identity and validity cap.
- `setSchemaActive` disables or re-enables acceptance under a schema.
- `authorizeIssuer` grants time-bounded authority for one schema.
- `suspendIssuer` and `reactivateIssuer` manage reversible incidents.
- `revokeIssuer` permanently removes an issuer for one schema.
- `setIssuancePaused` pauses new claims without blocking reads or revocation.
- `transferOwnership` and `acceptOwnership` provide two-step admin rotation.

The production owner must be a delayed multisig. Deploying with a single EOA
does not satisfy the v0.1 governance requirements.

## Attestation API

- `attest` submits a claim directly from an authorized issuer.
- `attestBySig` permissionlessly relays a domain-bound EIP-712 claim.
- `revoke` permanently revokes the caller's claim.
- `revokeBySig` permissionlessly relays an EIP-712 revocation.
- `getAttestation` returns immutable claim fields plus revocation state.
- `getAttestationStatus` derives current schema, issuer, expiry, and revocation status.
- `isUsable` is true only for `ACTIVE` claims.

EOA signatures reject malleable high-`s` values. Contract issuers are supported
through ERC-1271.

## EIP-712 domain

```text
name: SOVA Attestation Registry
version: 1
chainId: current deployment chain
verifyingContract: registry address
```

Both issuance and revocation signatures include a deadline. Issuance also binds
the subject, schema, commitment, issuer, timestamps, nonce, chain, and registry.

## Status values

| Value | Status |
| ---: | --- |
| 0 | `NONE` |
| 1 | `ACTIVE` |
| 2 | `EXPIRED` |
| 3 | `REVOKED` |
| 4 | `ISSUER_SUSPENDED` |
| 5 | `ISSUER_INACTIVE` |
| 6 | `ISSUER_REVOKED` |
| 7 | `SCHEMA_INACTIVE` |

Consumers should use the enum or `isUsable`, not hard-code numeric values.

## Verification completed

- Solidity 0.8.19 production-profile compilation;
- strict TypeScript type-check;
- 19 passing tests across the registry, governance, and network proof;
- EIP-712 tamper and cross-registry replay rejection;
- issuance uniqueness, expiry, authorization, suspension, revocation, pause,
  schema deactivation, clock-skew, validity-cap, and ownership invariants;
- issuer authorization epochs prevent old claims or signatures from surviving
  authority rotation;
- runtime bytecode size: 10,438 bytes, below the 24,576-byte EVM limit.

This verification is not a substitute for an independent smart-contract audit.
