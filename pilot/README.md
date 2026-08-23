# SOVA bounded external pilot v1

This package is the Phase 1.6 testnet pilot contract between operators and
participants. It is not a production launch package.

External execution is currently deferred. Phase 1.7 uses the separate
synthetic API campaign in `api-campaign-v1.canonical.json`; synthetic scenarios
must not be counted as independent participant feedback.

## Bounds

- Whitechain Sepolia only (`chainId=1874`).
- At most 12 invited participants over at most 14 calendar days.
- Synthetic data and test wallets only.
- No lending, underwriting, eligibility, pricing, or other real financial
  decision may rely on a pilot result.
- No private keys, keystore passwords, real identity data, salts, or private
  disclosure payloads may be submitted as feedback.
- A participant may stop at any time. Any suspected security or privacy issue
  stops the affected session and enters the incident process.

The machine-readable scope is `pilot-v1.canonical.json`. Participants follow
`participant-guide.md`; operators use `operator-checklist.md` and assess the
result against `exit-criteria.md`.

## Feedback workflow

1. Copy `examples/feedback.example.json` into the ignored `pilot-feedback/` directory.
2. Replace the synthetic values with a pseudonymous session ID and task results.
3. Keep comments free of personal, wallet-secret, or disclosure data.
4. Run `npm run pilot:report`.
5. Review the aggregate report in ignored `pilot-data/phase-1.6-report.json`.

The aggregate deliberately excludes session IDs and free-form comments. Raw
feedback remains local and must be deleted under the operator's retention
policy after the pilot decision is recorded.
