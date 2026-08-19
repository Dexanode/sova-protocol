# SOVA consumer policy v0.1

Status: frozen for Phase 1 testnet integration

SOVA does not decide whether a user is creditworthy and does not expose a
universal reputation score. Each consumer publishes an explicit acceptance
policy and evaluates current registry state at decision time.

## Required policy fields

- expected chain ID and registry address;
- accepted immutable schema ID;
- explicit issuer allowlist;
- maximum claim age;
- whether salted payload disclosure is required.

## Fail-closed validation

A claim is accepted only when every check succeeds: chain, registry, schema,
issuer, ACTIVE lifecycle status, `isUsable`, freshness, expiration, and optional
disclosure commitment. Unknown statuses and unavailable direct RPC reads are
rejections, not soft warnings.

The SDK returns machine-readable rejection reasons. Applications may explain
those reasons to users, but must not silently weaken the policy or convert them
into a protocol-wide numeric score.

## Pilot boundary

Phase 1 remains testnet-only. The independent contract audit is deferred but is
a hard gate before production/mainnet use or real financial decisions.
