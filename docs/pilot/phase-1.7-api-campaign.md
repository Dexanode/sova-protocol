# Phase 1.7 synthetic API validation campaign

Status: `PASS`

Phase 1.7 validates the testnet API and dashboard integration with synthetic
onchain data. It does not claim independent external-user validation. The
bounded external pilot package from Phase 1.6 remains available but its
execution is deferred until independent participants exist.

## Live fixture

- Attestation: `0x2bc2f60ae0fbd643015653010057be9f6f3ae1585aa8dc514c415b54c57f1bc1`
- Status at campaign opening: `ACTIVE`, `usable=true`
- Expiry: `2026-09-07T02:31:11Z`
- Synthetic data only

## Campaign contract

`pilot/api-campaign-v1.canonical.json` freezes the required scenarios and a
five-second p95 budget. `npm run api:campaign` exercises readiness, security
headers, current registry reads, schema reads, accepted/rejected policies,
not-found and malformed requests, subject discovery, metrics, and twelve
repeat active-attestation reads.

The generated `pilot-data/phase-1.7-api-campaign.json` is local evidence. A
sanitized result may be committed after review. A pass requires every scenario
to pass and p95 request duration at or below 5,000 ms.

## Internal usability observation

One internal operator completed the dashboard flow successfully. The repeated
second run is classified as a retest and excluded from independent participant
counts. The operator rated clarity 4/5 and understanding confidence 3/5, and
requested short explanations for Attestation, Issuer, Schema, and Subject.
This is a product finding, not external validation.

## Boundary

This campaign validates synthetic API behavior only. It does not close the
independent audit gate, prove production readiness, or establish that unrelated
users understand the interface.

## Result

The campaign ran on `2026-08-23T02:57:35.419Z` after `ops:check` passed at
chain head `5857476`, checkpoint `5857461`, and 15-block lag. All 22 scenarios
passed. Observed p95 duration was `345.9 ms`, below the `5,000 ms` budget.
No synthetic feedback records were counted as external participants.
