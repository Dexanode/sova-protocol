# SOVA testnet operator runbook v0.1

## Scope

This runbook covers the Whitechain Sepolia registry, its fixed 2-of-3 timelock
governance, the pilot issuer, the event indexer, and read-only verification.
It is not a production or mainnet runbook.

## Canonical deployment

- Chain ID: `1874`
- Governance: `0x43e6335B0930Ed35934d16eDe1be4c688E88c020`
- Registry: `0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf`
- Schema: `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526`
- Pilot issuer: `0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28`
- Governance policy: fixed 2-of-3 signers, 300-second minimum delay

Operators must verify chain ID, target, calldata, salt, and operation ID before
approving any governance action. Private keys and keystore passwords must never
be pasted into chat, source files, issues, or logs.

## Routine checks

```powershell
npm run typecheck
npm run lint:sol
npm test -- --no-compile
npm run schema:status
npm run issuer:status
npm run pilot:status
npm run indexer:sync
npm run ops:check
```

For security-sensitive decisions, read `getAttestationStatus` or `isUsable`
directly from the registry. The indexer is discovery infrastructure, not the
source of truth.

Run `indexer:sync` before `ops:check`. A successful check requires the expected
chain ID, deployed registry bytecode, active canonical schema, a healthy SQLite
database, and index lag within the configured 100-block default. Treat any
failed check as a testnet service-readiness failure; do not bypass it by raising
the lag budget without recording and reviewing the reason.

The API emits structured request completion logs and serves `/metrics` and
`/health` on its loopback listener. Alert candidates for a hosted pilot are
readiness `503`, increasing `sova_api_errors_total`, rate-limit bursts, and
index lag approaching the configured maximum. Logs must never be augmented
with request bodies, salts, private disclosures, or credentials.

## Governance procedure

1. Generate and independently review deterministic calldata.
2. Confirm the target is the deployed registry and value is zero unless a
   reviewed operation explicitly requires otherwise.
3. Signer 1 proposes; record transaction hash, block, operation ID, and readyAt.
4. A different signer reviews the same payload and approves.
5. Wait until chain time reaches readyAt.
6. An authorized signer executes the exact proposed target/data/value/salt.
7. Verify emitted events and direct post-state reads.
8. Add immutable evidence to `docs/deployments/`.

Never retry `propose` after it succeeds. A `TimelockNotReady` error during gas
estimation sends no transaction; wait and retry only `execute`.

## Issuance and revocation

- Confirm schema is active and issuer authorization is ACTIVE at the expected
  epoch before issuance.
- Use at least 128 bits of random salt and never publish real disclosure data.
- Confirm issuedAt is within five minutes of chain time and validity stays
  within the schema cap.
- Record the attestation ID and transaction hash.
- Revocation is irreversible. Verify the exact attestation ID before signing.

## Indexer recovery

`npm run indexer:sync` rebuilds the confirmed projection from registry block
`5489891` in 5,000-block chunks and excludes the newest six blocks. Delete or
move the local `indexer-data/` output only when a clean rebuild is intended; it
contains public event data and is not authoritative.
