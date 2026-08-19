# SOVA Pilot Issuer v1

This testnet-only issuer validates the complete SOVA attestation lifecycle. It
must not be treated as a production source of credit information.

- Address: `0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28`
- Network: Whitechain Sepolia (`1874`)
- Schema: `SOVA Onchain Credit Performance v1`
- Authorization: 30-day pilot window
- Policy: synthetic test data only; no real personal or financial information

The immutable metadata commitment is the Keccak-256 hash of the exact bytes in
`issuers/pilot-issuer-v1.canonical.json`. Any change requires a new metadata
document and governance authorization epoch.
