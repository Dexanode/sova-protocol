# SOVA testnet incident response v0.1

## Severity

- Critical: signer quorum compromise, unauthorized registry administration, or
  a defect that accepts forged attestations.
- High: issuer key compromise, incorrect active schema/issuer state, or a broad
  privacy disclosure.
- Medium: indexer inconsistency, unavailable evidence, or isolated bad pilot data.
- Low: documentation, monitoring, or non-security tooling defects.

## First response

1. Preserve transaction hashes, blocks, logs, affected IDs, and UTC timestamps.
2. Stop new issuance operationally. Do not destroy local evidence.
3. For an issuance-path incident, governance should propose
   `setIssuancePaused(true)` using independently reviewed calldata.
4. For one issuer, prefer `suspendIssuer`; use permanent `revokeIssuer` only
   after confirming compromise or policy termination.
5. Existing attestations remain readable and issuer revocation remains possible
   while issuance is paused.
6. Publish a testnet incident note without secrets or private disclosure data.

## Key compromise

- Issuer key: stop using it, suspend authorization, inventory its attestations,
  revoke affected claims where the issuer key remains safely accessible, then
  authorize a new dedicated issuer at a new epoch.
- One governance signer: remaining signers must not approve unexpected payloads.
  The deployed governance signers are immutable; replacing governance requires
  transferring registry ownership through a separately reviewed process.
- Lost 2-of-3 quorum: administration is permanently frozen under this testnet
  executor. Do not attempt an unreviewed workaround.

## Recovery validation

- Confirm chain ID and canonical contract addresses.
- Confirm issuance pause, schema state, issuer state/epoch, and affected claim
  lifecycle through direct RPC reads.
- Rebuild the event index and compare event transaction hashes with explorer.
- Add regression tests before remediation deployment.
- Require independent review for Critical, High, and Medium fixes.
