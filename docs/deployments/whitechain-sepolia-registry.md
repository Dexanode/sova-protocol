# Whitechain Sepolia registry deployment

Date: 2026-08-19

## Governance

| Field | Value |
| --- | --- |
| Contract | `SovaTimelockMultisig` |
| Address | `0x43e6335B0930Ed35934d16eDe1be4c688E88c020` |
| Transaction | `0x84f287f2b39f3f54581743dfaf75a3947e42228cb6dd06508f7b0c961da9e7df` |
| Block | `5489881` |
| Threshold | `2-of-3` |
| Minimum delay | `300 seconds` |
| Runtime bytecode | `3,141 bytes` |
| Source verification | Verified on 2026-08-19 |
| Compiler | `v0.8.19+commit.7dd6d404` |
| Optimizer | Enabled, `1,000` runs |

- [Governance contract](https://explorer.testnet.whitechain.io/address/0x43e6335B0930Ed35934d16eDe1be4c688E88c020)
- [Governance deployment transaction](https://explorer.testnet.whitechain.io/tx/0x84f287f2b39f3f54581743dfaf75a3947e42228cb6dd06508f7b0c961da9e7df)

Configured signers:

```text
0xbfc5db81973207cad45f46854724c4969b14018d
0x94a66f5bfd10dfe7187c6202343835141e435859
0x0ce86cb8f26681e313211ff08d71079908919644
```

Direct RPC reads confirmed all three addresses are authorized signers.

## Registry

| Field | Value |
| --- | --- |
| Contract | `SovaAttestationRegistry` |
| Address | `0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf` |
| Transaction | `0xbca04ab1cbbdd14dc12965881f69b52f4f7a0ece35e8d2806f53b8945ce9e886` |
| Block | `5489891` |
| Owner | `0x43e6335B0930Ed35934d16eDe1be4c688E88c020` |
| Runtime bytecode | `10,438 bytes` |
| Maximum clock skew | `300 seconds` |
| Issuance paused | `false` |
| Source verification | Verified on 2026-08-19 |
| Compiler | `v0.8.19+commit.7dd6d404` |
| Optimizer | Enabled, `1,000` runs |

- [Registry contract](https://explorer.testnet.whitechain.io/address/0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf)
- [Registry deployment transaction](https://explorer.testnet.whitechain.io/tx/0xbca04ab1cbbdd14dc12965881f69b52f4f7a0ece35e8d2806f53b8945ce9e886)

The registry was constructed with the governance contract as its initial owner.
The deployer EOA never held registry administration.

## Scope warning

This is a Whitechain Sepolia testnet deployment. The minimal governance
executor and registry have internal tests and static analysis but have not
received an independent third-party audit. They must not control production
funds or mainnet reputation decisions.
