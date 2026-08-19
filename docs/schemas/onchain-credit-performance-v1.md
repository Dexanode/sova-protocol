# SOVA Onchain Credit Performance v1

This is SOVA's first candidate schema. It records the outcome of a completed
onchain credit position without placing exact principal, collateral, balance,
or transaction history onchain.

The canonical schema document is
`schemas/onchain-credit-performance-v1.canonical.json`. Its raw UTF-8 bytes are
hashed with Keccak-256 to produce the immutable `schemaId`. Do not reformat the
canonical file after activation; any semantic or byte-level change requires a
new schema version and ID.

- File size: `1,125` bytes (including the final LF byte)
- Keccak-256 / schema ID: `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526`
- SHA-256: `a020afb0b085dd8e2cbbb6b6857dd9b555477e7802ff943c31bd6debf5e96cd3`

## Outcomes

- `1` — repaid
- `2` — liquidated
- `3` — defaulted

The complete encoded payload is combined with at least 128 bits of random salt
before computing the attestation `dataHash`. Consumers receive the payload and
salt only through an authorized disclosure channel.

## Validity

Maximum attestation validity is 90 days (`7,776,000` seconds). Consumers may
require a shorter freshness window.

## Activation

Activation requires a `registerSchema(schemaId, metadataHash, 7776000)` call
through the deployed `2-of-3` governance executor and its five-minute delay.
The initial proposal should use the schema ID as both `schemaId` and
`metadataHash`, binding the registry entry directly to the canonical document.
Run `npm run prepare:schema-activation` to reproduce the complete unsigned
proposal, approval, and execution calldata. Every signer must independently
verify its chain ID, target, value, schema ID, validity, and salt before signing.

## Whitechain Sepolia status

Activated through the deployed 2-of-3 timelock governance on 2026-08-19.
The operation executed successfully and direct registry reads confirmed
`exists=true` and `active=true`. Full transaction evidence is recorded in
`docs/deployments/whitechain-sepolia-schema-v1.md`.
