# Whitechain Sepolia pilot attestation lifecycle

Date: 2026-08-19

This synthetic pilot validated direct issuance, active-status reads, usability,
and irreversible issuer revocation. No real financial or personal data was used.
The disclosure payload, random salt, and nonce remain in the git-ignored local
pilot record and are intentionally excluded from this public evidence document.

## Attestation

| Field | Value |
| --- | --- |
| Attestation ID | `0x1c4e90ef595a096906f283e98b09da4e92a994f280f48b43f3b00148e49270b0` |
| Issuer | `0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28` |
| Subject ID | `0x6b87de87f71262f5873b1d3ccc9ae09e21fc55f83a4ca3af690e5703de0eb9e7` |
| Schema ID | `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526` |
| Issuer epoch | `1` |
| Issued at | `1787104997` |
| Expires at | `1787709797` |
| Revoked at | `1787105053` |
| Final status | `REVOKED` (`3`) |
| Final usability | `false` |

## Transactions

| Action | Transaction | Block | Status |
| --- | --- | --- | --- |
| Issue | `0x787475ff1ef82351046e73aacdcbfd417c864fc689fdbdce0d5721d4d8aaf687` | `5508634` | Success |
| Revoke | `0x370ae7b1b88d5cf084e6b191f16f03e18ecf260fd925c97c931df2c0d293ccfa` | `5508685` | Success |

- [Issuance transaction](https://explorer.testnet.whitechain.io/tx/0x787475ff1ef82351046e73aacdcbfd417c864fc689fdbdce0d5721d4d8aaf687)
- [Revocation transaction](https://explorer.testnet.whitechain.io/tx/0x370ae7b1b88d5cf084e6b191f16f03e18ecf260fd925c97c931df2c0d293ccfa)

Direct RPC reads observed `ACTIVE` with `isUsable=true` after issuance, then
`REVOKED` with `isUsable=false` after issuer revocation.
