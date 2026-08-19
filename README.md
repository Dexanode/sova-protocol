# SOVA Protocol

**Verifiable reputation for onchain finance.**

SOVA is an early-stage protocol for portable, verifiable onchain reputation.
The repository is at Phase 0.9 release-candidate preparation after completing a
governed Whitechain Sepolia registry, first schema, pilot issuer and attestation
lifecycle, read-only SDK, and confirmed event indexer.

## Current scope

The deployed testnet scope includes `SovaAttestationRegistry` owned by the fixed
2-of-3 `SovaTimelockMultisig`. The deployment is unaudited and must not control
production funds or mainnet reputation decisions.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A dedicated testnet wallet with test WBT for network deployment

## Local development

```bash
npm install
npm run build
npm test
```

## Testnet read service

Build or incrementally refresh the confirmed SQLite event index, then start the
loopback-only query API:

```bash
npm run indexer:sync
npm run api:start
```

The API contract is documented in `docs/api/openapi-v0.1.yaml`. Indexed data is
for discovery; security-sensitive lifecycle decisions are refreshed directly
from the registry.

## Whitechain Sepolia deployment

Whitechain Sepolia is EVM-compatible. This project uses:

- RPC: `https://rpc.testnet.whitechain.io`
- Chain ID: `1874`
- Currency: `WBT`
- Faucet: `https://faucet.testnet.whitechain.io`
- Explorer: `https://explorer.testnet.whitechain.io`

Store a **testnet-only** deployer key in Hardhat's encrypted keystore (enter the
value only in the local terminal prompt):

```bash
npx hardhat keystore set DEPLOYER_PRIVATE_KEY
```

Fund that wallet with test WBT, then run:

```bash
npm run deploy:whitechain
```

Never paste private keys or access tokens into issues, commits, or chat. If a
credential is exposed, revoke or rotate it before continuing.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the checkpoint and next phases.
The Phase 0.3B onchain evidence is recorded in
[docs/deployments/whitechain-sepolia.md](docs/deployments/whitechain-sepolia.md).
The frozen Phase 0.4 design is documented in
[docs/spec/reputation-model-v0.1.md](docs/spec/reputation-model-v0.1.md) and
[docs/security/threat-model-v0.1.md](docs/security/threat-model-v0.1.md).
The Phase 0.5 registry API and verification status are documented in
[docs/spec/registry-v0.1.md](docs/spec/registry-v0.1.md).
Security hardening findings are recorded in
[docs/security/review-0.5b.md](docs/security/review-0.5b.md).
The governed Whitechain Sepolia registry deployment is recorded in
[docs/deployments/whitechain-sepolia-registry.md](docs/deployments/whitechain-sepolia-registry.md).
Phase 0 release readiness is tracked in
[docs/release/phase-0-rc-checklist.md](docs/release/phase-0-rc-checklist.md).

## License

MIT
