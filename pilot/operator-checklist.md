# Operator checklist

## Open

- [ ] Record an approved start/end window no longer than 14 days.
- [ ] Confirm no more than 12 invited participants.
- [ ] Run `npm run indexer:sync` and `npm run ops:check` successfully.
- [ ] Confirm dashboard and API remain testnet-labelled and loopback/reviewed-proxy only.
- [ ] Prepare synthetic attestation/disclosure fixtures and pseudonymous session IDs.
- [ ] Explain prohibited data, voluntary participation, stop conditions, and retention.

## Every session

- [ ] Confirm chain ID, registry, health, and index lag before starting.
- [ ] Use no production wallet or real financial decision.
- [ ] Store feedback only in ignored `pilot-feedback/`.
- [ ] Stop and follow the incident runbook if an incident is suspected.

## Close

- [ ] Generate the aggregate with `npm run pilot:report`.
- [ ] Review raw incident flags separately; do not publish raw feedback.
- [ ] Evaluate every exit criterion and record pass, iterate, or stop.
- [ ] Delete raw feedback under the recorded retention policy.
- [ ] Do not describe a passing pilot as production readiness or audit closure.
