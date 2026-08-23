# Phase 1.8 testnet integration release v0.1

Status: `ENGINEERING FROZEN — TESTNET ONLY`

Phase 1 ends with the manifest in `release/testnet-integration-v0.1.json`.
The freeze covers the deployed Whitechain Sepolia registry, schema, issuer,
synthetic fixture, read/index path, isolated signing and relay flow, explicit
consumer policy, dashboard, operational controls, and synthetic API campaign.

## Product finding closed

The internal operator test found that first-time readers needed definitions for
Attestation, Issuer, Schema, and Subject. The verifier now displays concise
definitions directly beside those fields and explains common policy rejection
codes in plain language. Protocol identifiers and machine-readable rejection
reasons remain unchanged.

## Freeze gates

- [x] Registry, schema, issuer, and fixture addresses recorded.
- [x] Direct status reads observed the campaign fixture ACTIVE and usable.
- [x] Confirmed index and SQLite integrity checks pass.
- [x] OpenAPI v0.1 and consumer policy v0.1 remain explicit and fail-closed.
- [x] Synthetic API campaign passed all 22 scenarios within its p95 budget.
- [x] TypeScript, Solidity lint, and regression tests pass.
- [x] Dependency audit reports zero known vulnerabilities.
- [x] `npm run release:check` verifies manifest references and honest boundary flags.
- [x] Generated secrets, disclosures, signatures, salts, and raw feedback remain ignored.
- [ ] Independent external usability validation.
- [ ] Independent smart-contract audit and remediation.

Unchecked gates do not block this engineering/testnet freeze, but they do block
production readiness. No mainnet, real-credit, lending, underwriting, or other
financial-decision claim is authorized by this release.

## Change control

Any contract ABI/storage change, schema meaning change, consumer-policy
weakening, new issuer trust rule, or security-control reduction reopens review.
Documentation-only corrections may remain v0.1 when they do not change meaning;
behavioral changes require a new integration release identifier and campaign.

The post-product-change campaign rerun passed `22/22` scenarios with observed
p95 `352.64 ms`; operational readiness passed at chain head `5857768`, index
checkpoint `5857755`, and 13-block lag.
