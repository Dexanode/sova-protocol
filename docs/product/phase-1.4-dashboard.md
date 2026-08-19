# Phase 1.4 testnet verifier dashboard

The dashboard is a same-origin static interface served by `npm run api:start`.
It supports attestation-ID and subject-ID discovery, direct registry lifecycle
reads, provenance display, and explicit consumer-policy evaluation.

## Product rules

- Never display or derive a universal reputation score.
- Clearly separate indexed discovery from current registry state.
- Show issuer, schema, subject, issued/expiry times, status, and usability.
- Policy evaluation must state accepted/rejected and list exact rejection reasons.
- Never request private keys, salts, or disclosure payloads in the public lookup.
- Label the interface testnet-only and audit-deferred.

## Local use

```powershell
npm run indexer:sync
npm run api:start
```

Open `http://127.0.0.1:3000`. The server binds to loopback by default and adds
a restrictive Content Security Policy, `nosniff`, no-referrer behavior, and
`Cache-Control: no-store` for API/HTML responses.

The default example is the active relayed attestation from Phase 1.3. Requiring
a private disclosure without supplying one demonstrates a fail-closed policy
rejection. This reference dashboard is not a production credit decision tool.
