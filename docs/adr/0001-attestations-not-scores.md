# ADR-0001: Store attestations, not a universal score

- Status: Accepted
- Date: 2026-08-19

## Decision

SOVA stores issuer-signed, schema-bound attestations and their lifecycle. It
does not calculate or publish a protocol-wide reputation score.

## Rationale

A single score hides issuer assumptions, freshness, domain context, and risk
appetite. Separating evidence from decision policy lets lending, trading, and
other protocols evaluate the same verifiable claims differently without
granting SOVA power to define universal creditworthiness.

## Consequences

- consumers must publish and maintain their own acceptance policies;
- issuer and schema provenance remain inspectable;
- scoring can evolve without migrating registry state;
- SOVA cannot promise plug-and-play risk decisions from one number.
