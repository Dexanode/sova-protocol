# Phase 1.2 persistent indexer and query API

## Persistent index

`npm run indexer:sync` stores registry events and projections in
`indexer-data/whitechain-sepolia.sqlite`. Sync starts from the last confirmed
checkpoint minus a 20-block reorg window, deletes events in that window,
refetches logs in 5,000-block chunks, then transactionally rebuilds schema,
issuer, and attestation projections.

The first testnet sync stored four lifecycle events. A second incremental sync
fetched only the rewind window, retained all four events, and produced no
duplicates.

## Query API

`npm run api:start` binds to `127.0.0.1:3000` by default. Configuration:

- `HOST` and `PORT` control the listener;
- `WHITECHAIN_SEPOLIA_RPC_URL` overrides authoritative RPC;
- `SOVA_INDEX_DATABASE` overrides the SQLite path.

Endpoints include health/checkpoint, schema reads, attestation reads, subject
discovery, and disclosure verification. Subject discovery comes from SQLite,
but every returned attestation is refreshed through the registry before the API
responds. Responses use `Cache-Control: no-store`; disclosure payloads and salts
are never logged or persisted by the service.

The API is currently a single-process testnet reference implementation. It has
no authentication, public rate limiter, TLS termination, multi-instance writer
coordination, or production SLO. Keep the default loopback binding until those
controls are supplied by deployment infrastructure.

Node's built-in SQLite module is used to avoid a native third-party dependency.
It remains marked experimental by the current Node runtime, so Node version
changes require the complete persistence regression suite.
