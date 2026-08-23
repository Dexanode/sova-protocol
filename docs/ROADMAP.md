# SOVA delivery roadmap

## Completed

- Phase 0.1 — project definition
- Phase 0.2A–F — Blueprint v0.1
- Phase 0.3A — repository and contract-tooling scaffold
- Phase 0.3B — Whitechain Sepolia network proof deployed and verified
- Phase 0.4 — reputation model, trust boundaries, privacy rules, and threat model frozen
- Phase 0.5A — registry implementation and invariant test suite completed
- Phase 0.5B — security hardening and governance test suite completed
- Phase 0.5C — 2-of-3 testnet governance and registry deployed on Whitechain Sepolia
- Phase 0.6 — explorer verification, audit package, and first schema activation completed
- Phase 0.7 — pilot issuer authorization and full attestation lifecycle validated on testnet
- Phase 0.8 — confirmed event indexer and read-only verification SDK completed
- Phase 0.9 — internal release review, zero-advisory toolchain remediation, runbooks, and private RC baseline completed
- Phase 1.1 — testnet consumer policy evaluator and read API contract frozen
- Phase 1.2 — persistent reorg-aware SQLite indexer and registry-refreshed query API completed
- Phase 1.3 — isolated issuer EIP-712 signing and untrusted relayer submission validated on testnet
- Phase 1.4 — testnet verification dashboard and explicit consumer-policy demo completed
- Phase 1.5 — testnet pilot observability, API hardening, and operational validation completed
- Phase 1.6 — bounded external pilot package, privacy-preserving feedback capture, and exit criteria completed
- Phase 1.7 — synthetic API validation campaign completed with 22/22 scenarios passing

## Next

- Phase 1.8 — address validated API/product findings and freeze the testnet integration release

## Deferred production gate

- Independent contract audit, required remediation, report hash, and final Phase 0 production-readiness freeze
- Independent external usability pilot execution when real participants are available

Deployment is intentionally separated from protocol design: the proof contract
validates the toolchain and network path without prematurely committing SOVA to
an unsafe reputation model.
