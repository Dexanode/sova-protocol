# Phase 0.5B security hardening review

Date: 2026-08-19

Scope:

- `contracts/SovaAttestationRegistry.sol`
- `contracts/interfaces/IERC1271.sol`
- EIP-712 issuance and revocation paths
- schema and issuer administration
- attestation lifecycle derivation

This is an engineering security review, not an independent third-party audit.

## Findings

### SOVA-001: Re-authorization could reactivate claims from an older authority period

- Severity: Medium
- Status: Fixed

Issuer authorization previously had no generation identifier. Re-authorizing an
issuer after expiration could make an older, unexpired attestation usable under
the new authorization.

The fix adds a monotonically increasing schema/issuer `epoch`. The epoch is
bound into the EIP-712 message and stored with every attestation. A claim is
usable only while its stored epoch matches the current authorization epoch.
Signatures prepared under an older epoch cannot be submitted after rotation.

### SOVA-002: ERC-1271 path lacked direct test coverage

- Severity: Low
- Status: Fixed

Contract issuers were supported in code but the security suite only exercised
EOA issuers. A mock ERC-1271 issuer now verifies both approved and rejected
signature paths.

### SOVA-003: Static-analysis warnings obscured actionable output

- Severity: Informational
- Status: Fixed

Solhint initially reported 125 documentation and gas-style warnings with no
errors. Non-security style rules were separated from the correctness gate. The
recommended correctness rules now complete with zero findings.

## Verification evidence

- Production Solidity build: passed
- Strict TypeScript check: passed
- Solhint recommended rules: zero findings
- Mocha security suite: 19 passing, including governance threshold and delay
- Runtime bytecode: 10,438 bytes of the 24,576-byte EVM limit
- Compiler: Solidity 0.8.19, EVM Paris

## Deployment status

The registry and a fixed `2-of-3`, five-minute testnet governance executor are
deployed on Whitechain Sepolia. Direct RPC reads confirmed the registry owner,
threshold, delay, and all three signer authorizations. Independent review
remains mandatory before any production deployment.

## Residual risk

- No independent third-party audit has been performed.
- Governance can authorize malicious schemas or issuers.
- An authorized issuer can publish false claims before suspension.
- ERC-1271 security depends on the issuer contract implementation.
- Offchain payload availability and confidentiality remain external concerns.
