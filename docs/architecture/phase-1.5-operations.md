# Phase 1.5 testnet observability and API hardening

Phase 1.5 keeps the read service loopback-first while adding enough controls to
operate a bounded testnet pilot and detect unsafe degradation.

## Controls

- Every response carries a caller-safe or generated `X-Request-Id`.
- One structured JSON completion log records method, path, status, duration,
  and request ID. Bodies, query strings, salts, disclosure payloads, and keys
  are never logged.
- `/metrics` exposes bounded process counters and confirmed-index lag in
  Prometheus text format. It has no address, subject, or attestation labels.
- `/health` fails with `503` when RPC is unavailable, SQLite integrity fails,
  the checkpoint is absent, or lag exceeds `SOVA_MAX_INDEX_LAG_BLOCKS`.
- `/v1/*` has a per-process, per-socket-address fixed-window limiter. The
  default is 60 requests per minute and rejected requests return `429` plus
  `Retry-After`.
- Registry reads have an eight-second default upstream budget. Node HTTP
  header, request, keep-alive, and graceful-shutdown bounds are explicit.
- `npm run ops:check` independently verifies chain ID, deployed registry code,
  active schema, SQLite integrity, checkpoint presence, and index lag.

Configuration:

- `SOVA_RPC_TIMEOUT_MS` (default `8000`)
- `SOVA_RATE_LIMIT_PER_MINUTE` (default `60`)
- `SOVA_MAX_INDEX_LAG_BLOCKS` (default `100`)
- existing `HOST`, `PORT`, `WHITECHAIN_SEPOLIA_RPC_URL`, and
  `SOVA_INDEX_DATABASE`

## Operational boundary

These controls are a single-process testnet baseline. The in-memory limiter is
not shared across replicas, `X-Forwarded-For` is intentionally not trusted,
metrics are unauthenticated on the same loopback listener, and TLS is not
terminated by this process. A public deployment still requires a reviewed
reverse proxy, shared abuse controls, authenticated administrative access,
durable centralized telemetry, alert routing, and an explicit SLO.

This phase does not close the independent contract-audit production gate.
