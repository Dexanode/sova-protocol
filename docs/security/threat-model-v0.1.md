# SOVA threat model v0.1

Status: **required baseline for Phase 0.5**

## Assets and security objectives

SOVA protects the integrity and provenance of attestation lifecycle state. The
primary assets are issuer authority, schema semantics, attestation commitments,
revocation state, and consumer ability to distinguish active from invalid
claims.

Availability of offchain evidence and factual truth of issuer claims are
outside the registry's cryptographic guarantees.

## Trust boundaries

- **Governance:** trusted to authorize schemas and issuers, but unable to alter
  an issuer's historical attestation bytes.
- **Issuer:** trusted only for schemas it is explicitly authorized to issue.
- **Relayer:** untrusted transport for signed issuance and revocation messages.
- **Indexer/UI:** untrusted presentation layer; consumers must verify chain data.
- **Evidence store:** untrusted for integrity, which is checked using `dataHash`.
- **Consumer:** owns its acceptance and scoring policy.

## Threats and required mitigations

| Threat | Impact | Required mitigation |
| --- | --- | --- |
| Compromised issuer key | Fraudulent claims | Schema-scoped authority, immediate suspension, permanent revocation, short validity caps |
| Compromised admin | Malicious issuer/schema changes | Multisig, delayed changes, least-privilege roles, complete events, emergency pause limited to issuance |
| Signature replay | Duplicate or cross-domain claims | EIP-712 domain includes chain ID and registry address; per-issuer nonce; one-time attestation ID |
| Cross-chain address confusion | Claims applied to wrong identity | Chain-scoped `subjectId`; no implicit wallet linking |
| Schema semantic mutation | Consumers interpret old data under new rules | Content-addressed immutable schema IDs; new version means new ID |
| Backdated or far-future claim | Bypass freshness policy | Clock-skew bound and schema-specific maximum validity |
| Revocation suppression by UI/indexer | Invalid claim appears active | Onchain revocation state, lifecycle read function, events plus direct RPC verification |
| Low-entropy hash guessing | Disclosure of private facts | Salted commitments with at least 128-bit random salt; prohibit raw/unsalted sensitive facts |
| Evidence substitution | False payload presented for a valid claim | Canonical payload encoding and commitment verification |
| Relayer censorship | Signed claim not submitted | Permissionless relaying and direct issuer submission |
| Relayer tampering | Altered claim | Signature covers every semantic field, nonce, deadline, chain, and registry |
| Duplicate issuance | Confusing or inflated reputation | Unique ID and nonce; consumer deduplication rules per schema |
| Gas griefing/unbounded reads | Denial of service | Constant-cost writes, no unbounded onchain enumeration, event-based indexing |
| Storage collision/upgrade error | Corrupted state | Prefer non-upgradeable v0.1; otherwise explicit storage-layout tests and delayed upgrades |
| Admin pause abuse | Permanent censorship | Pause only new issuance; never block reads or revocations; delayed unpause policy |
| Subject erasure demand | Privacy/legal conflict | Never store plaintext personal data; commitments remain immutable; evidence stores implement their own deletion policy |

## Invariants for implementation tests

Phase 0.5 tests must demonstrate:

1. an attestation ID can be issued at most once;
2. only an authorized issuer can issue for a schema;
3. only the original issuer can revoke its attestation;
4. revocation cannot be undone or overwritten;
5. expired attestations never return `ACTIVE`;
6. suspended/revoked issuers never produce acceptable new attestations;
7. signatures fail on a different chain, registry, nonce, or modified field;
8. schema definitions and IDs cannot be mutated;
9. pausing cannot block revocation or reads;
10. no state-changing path performs unbounded iteration.

## Residual risks

- An authorized issuer can lie or use a flawed methodology.
- Governance can authorize a malicious issuer before the delay is noticed.
- Public metadata can enable correlation even without plaintext evidence.
- Consumers can implement discriminatory, unsafe, or incorrect scoring policies.
- Key compromise between issuance and suspension can create valid-looking claims.
- Chain reorganization can temporarily change indexing results.

These risks must be documented by integrators; the registry cannot eliminate
them through Solidity alone.
