# Whitechain Sepolia pilot issuer authorization

Date: 2026-08-19

| Field | Value |
| --- | --- |
| Issuer | `0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28` |
| Schema ID | `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526` |
| Metadata hash | `0xb48301daf6d5a7d68bfd93b0d0f63032d521ae6777d878d3319b3fe230afbbc7` |
| Operation ID | `0xf44cbc74b7e7e87f1a6415f8db2a4917c77ac70ad14126ff7ddddf072cd3999d` |
| Authorization state | `ACTIVE` (`1`) |
| Authorization epoch | `1` |
| Valid from | `0` (immediate) |
| Valid until | `1789692176` |

## Governance execution

| Action | Transaction | Block | Status |
| --- | --- | --- | --- |
| Propose | `0x73b7bc26bb8b5c17dbc2ea1746f9fa0864fd265fdbfbab64102426060e4cea2d` | `5504088` | Success |
| Approve | `0x1dbe227a8a5d88391941ca05298c7ef7d260166b8a514ea73eacaf1d7954a212` | `5504913` | Success |
| Execute | `0x5368512a9436232055130c69d2c77a7a2b216d37bd59cd70ddf9c4d0d35a07a8` | `5505487` | Success |

- [Proposal transaction](https://explorer.testnet.whitechain.io/tx/0x73b7bc26bb8b5c17dbc2ea1746f9fa0864fd265fdbfbab64102426060e4cea2d)
- [Approval transaction](https://explorer.testnet.whitechain.io/tx/0x1dbe227a8a5d88391941ca05298c7ef7d260166b8a514ea73eacaf1d7954a212)
- [Execution transaction](https://explorer.testnet.whitechain.io/tx/0x5368512a9436232055130c69d2c77a7a2b216d37bd59cd70ddf9c4d0d35a07a8)

Direct RPC reads confirmed the operation executed with two approvals and the
issuer authorization is active at epoch 1. This issuer is testnet-only.
