# ADR-0002: Use chain-scoped subject identifiers

- Status: Accepted
- Date: 2026-08-19

## Decision

Subject IDs commit to both EVM chain ID and account address. Equal 20-byte
addresses on different chains are distinct unless a separate link attestation
proves and discloses a relationship.

## Rationale

EVM addresses can be reused across chains, but ownership, key state, account
type, and transaction history may differ. Implicit merging creates replay,
privacy, and attribution risks.

## Consequences

- cross-chain reputation aggregation is explicit and consent-aware;
- consumers must handle multiple subject IDs;
- future account-abstraction identifiers can be added without redefining v0.1.
