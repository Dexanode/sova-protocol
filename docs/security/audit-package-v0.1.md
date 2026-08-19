# SOVA audit package v0.1

## In-scope contracts

- `contracts/SovaAttestationRegistry.sol`
- `contracts/SovaTimelockMultisig.sol`
- `contracts/interfaces/IERC1271.sol`

`contracts/mocks/MockERC1271Issuer.sol` is test-only and out of production scope.

## Deployed scope

- Chain: Whitechain Sepolia (`1874`)
- Governance: `0x43e6335B0930Ed35934d16eDe1be4c688E88c020`
- Registry: `0x953a4edC84CEBdC113688310F54adce6Dc2c8bCf`
- Compiler: Solidity `0.8.19`
- EVM target: `paris`
- Optimizer: enabled, `1000` runs

Exact compiler inputs are preserved in
`ignition/deployments/chain-1874/build-info/` after deployment. The deployment
journal records constructor arguments, transaction hashes, blocks, and receipts.
Both deployed contracts are source-verified on the Whitechain Sepolia explorer
using those exact Standard JSON compiler inputs.

The Phase 0.9 production-profile rebuild produced registry runtime hash
`0xe27ad1bdcb83dce01ccec1a218e6a0acef65c89d369a36bd38db986ebaa3b15b`,
matching onchain bytecode exactly. Governance artifact hash
`0x3bb4c73236c6f2b1842a565f60a4e2cf9e19ca5fd235890a0c4b3635797dbba8`
matches onchain after normalizing the compiler-declared immutable slots.

## Reproduction

```bash
npm ci
npm run build
npm run typecheck
npm run lint:sol
npm test
```

Expected result: build, type-check, and lint succeed; 19 tests pass.

The first schema candidate is reproducibly hashed and its unsigned governance
payload can be generated with `npm run prepare:schema-activation`. This command
does not access signer keys or submit a transaction.

## Security properties under review

- EIP-712 domain and field completeness;
- EOA signature malleability rejection;
- ERC-1271 behavior and reentrancy assumptions;
- authorization epochs and stale signature rejection;
- schema/issuer lifecycle status precedence;
- irreversible revocation;
- constant-complexity state transitions;
- governance threshold, delay, replay, and external-call behavior;
- admin incident response and signer compromise scenarios;
- privacy limitations of salted commitments.

## Known limitations

- The testnet governance executor is custom and has not received an independent audit.
- Signers, threshold, and delay are immutable.
- A lost 2-of-3 signer quorum permanently freezes administration.
- There is no onchain operation cancellation; signers must avoid approving unsafe proposals.
- The registry does not adjudicate factual truth or guarantee evidence availability.

## Reviewer deliverables requested

- severity-ranked findings with reproducible proof of concept;
- explicit assessment of deployment bytecode versus reviewed source;
- verification of constructor configuration and governance ownership;
- remediation review for all Critical, High, and Medium findings;
- final report hash suitable for permanent publication.
