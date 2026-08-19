# Whitechain Sepolia relayed attestation

Date: 2026-08-19

| Field | Value |
| --- | --- |
| Attestation ID | `0x5c295500023335e9e7998c0a0ef635cf5aedf80d381c331838fdf65d3dc4a148` |
| Issuer | `0x9325b1eba43ad4a3104d191909ffa0dcfabb2b28` |
| Relayer | `0xee76b045CA9093e40F2a298B9e218c910614e815` |
| Issued at | `1787108305` |
| Expires at | `1787713105` |
| Transaction | `0x40957f451bd45ccebcd66577303820b2154836e8bbdfaf6d99b579be14efe09a` |
| Block | `5511963` |
| Receipt status | `1` |
| Lifecycle after issuance | `ACTIVE` (`1`) |
| Usable after issuance | `true` |

[View transaction on explorer](https://explorer.testnet.whitechain.io/tx/0x40957f451bd45ccebcd66577303820b2154836e8bbdfaf6d99b579be14efe09a).

The issuer signed an EIP-712 request offchain and a distinct relayer submitted
it. Direct RPC reads confirmed the recovered issuer, active lifecycle, and
usability. Signature, payload, salt, and nonce remain excluded from Git.
