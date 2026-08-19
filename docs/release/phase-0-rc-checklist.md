# Phase 0 release-candidate checklist

## Engineering

- [x] Frozen registry and reputation specifications
- [x] Threat model and internal security review
- [x] Deterministic production compiler settings and deployment evidence
- [x] Explorer-verified governance and registry source
- [x] Schema activation through delayed 2-of-3 governance
- [x] Pilot issuer authorization through delayed 2-of-3 governance
- [x] Active-to-revoked pilot attestation lifecycle
- [x] Read-only SDK and confirmed event indexer
- [x] Operator and incident-response runbooks
- [x] Repository baseline committed and pushed to private `origin/main`
- [ ] Independent audit completed and report hash recorded
- [ ] Required audit remediations independently verified

## Release gates

```powershell
npm ci
npm run build
npm run typecheck
npm run lint:sol
npm test
npm run indexer:sync
```

Additionally verify that ignored local data, `.env`, keystores, private keys,
passwords, tokens, disclosure payloads, salts, and nonces are absent from the
release commit.

## Verdict rules

- Phase 0 engineering-complete: all engineering work except third-party review
  and repository publication is complete and reproducible.
- Phase 0 complete: every checkbox above is closed.
- Production-ready: requires a separate decision after independent audit; a
  completed Phase 0 testnet checklist alone is insufficient.
