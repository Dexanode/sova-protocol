# Phase 1.7 API campaign result

- Decision: `PASS`
- Generated: `2026-08-23T02:57:35.419Z`
- Environment: Whitechain Sepolia (`1874`)
- Fixture: `0x2bc2f60ae0fbd643015653010057be9f6f3ae1585aa8dc514c415b54c57f1bc1`
- Scenarios: `22/22` passed
- Failed scenarios: `0`
- Observed p95: `345.9 ms`
- p95 budget: `5,000 ms`

Passed coverage:

- readiness and index/database health;
- restrictive security headers and request IDs;
- ACTIVE/usable attestation and active schema reads;
- accepted default consumer policy;
- fail-closed `DISCLOSURE_REQUIRED` policy;
- correct `404` for a missing attestation;
- subject discovery containing the campaign fixture;
- correct `400 INVALID_JSON` handling;
- Prometheus metrics exposure;
- twelve repeated ACTIVE registry reads.

The full local timing report remains in ignored `pilot-data/`. This committed
summary contains no key, signature, salt, disclosure, session identifier, or
free-form participant feedback.

This is synthetic API evidence only. External usability validation and the
independent production audit remain deferred.
