# Whitechain Sepolia schema v1 activation

Date: 2026-08-19

## Schema

| Field | Value |
| --- | --- |
| Name | `SOVA Onchain Credit Performance v1` |
| Schema ID | `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526` |
| Metadata hash | `0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526` |
| Maximum validity | `7,776,000 seconds` (90 days) |
| Registry | `0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf` |
| Governance | `0x43e6335B0930Ed35934d16eDe1be4c688E88c020` |
| Operation ID | `0x5fa48b879df29ae4c008ea6abcb5fdd9a577822603f6e6a78867903a61b15295` |
| Timelock ready at | `1787100135` |
| Final state | `exists=true`, `active=true` |

The schema ID is the Keccak-256 hash of the exact 1,125 bytes in
`schemas/onchain-credit-performance-v1.canonical.json`, including its final LF.

## Governance execution

| Action | Signer | Transaction | Block | Status |
| --- | --- | --- | --- | --- |
| Propose | `0xbfc5db81973207cad45f46854724c4969b14018d` | `0xcc2c18c395d8915ad60c2fd13b4f3bca036480f27a5171754cf2c0fe074b3ead` | `5503467` | Success |
| Approve | `0x94a66f5bfd10dfe7187c6202343835141e435859` | `0xef0f8af83576895498a7a6f15191e3d40244a1b9077a7b87759bbfe53a085e32` | `5503552` | Success |
| Execute | `0xbfc5db81973207cad45f46854724c4969b14018d` | `0xbb89be05bd5a9f73280cf5967b21556b1ab5aaf404b9335d644abf6cb863f9aa` | `5503797` | Success |

- [Proposal transaction](https://explorer.testnet.whitechain.io/tx/0xcc2c18c395d8915ad60c2fd13b4f3bca036480f27a5171754cf2c0fe074b3ead)
- [Approval transaction](https://explorer.testnet.whitechain.io/tx/0xef0f8af83576895498a7a6f15191e3d40244a1b9077a7b87759bbfe53a085e32)
- [Execution transaction](https://explorer.testnet.whitechain.io/tx/0xbb89be05bd5a9f73280cf5967b21556b1ab5aaf404b9335d644abf6cb863f9aa)

Direct RPC reads after execution confirmed two approvals, successful execution,
and an existing active schema in the registry.
