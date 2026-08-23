# Phase 1.6 exit criteria

The bounded external pilot may exit as `PASS` only when every hard gate passes.
A pass authorizes planning the next testnet phase, not production deployment.

## Hard gates

- Scope remained at or below 12 participants and 14 days.
- At least 8 valid pseudonymous sessions were collected.
- All sessions used synthetic data and test wallets; no real financial decision occurred.
- Zero unresolved security, privacy, secret-exposure, or incorrect-registry-state incidents.
- `ops:check` passed before each session and no readiness failure was bypassed.
- Each assigned task has at least an 80% completion rate.
- Average clarity rating is at least 4.0/5.
- At least 80% of participants understood the explicit rejection reason.
- Aggregate evidence contains no session IDs, free comments, secrets, salts, or disclosures.

## Decision

- `PASS`: all gates met; preserve the aggregate and decision record.
- `ITERATE`: no unresolved safety incident, but one or more usability/reliability gates missed.
- `STOP`: scope breach, real-decision use, secret/identity exposure, incorrect authoritative
  state, or another unresolved safety incident.

Independent contract audit and remediation remain mandatory before any
production/mainnet use regardless of the pilot result.
