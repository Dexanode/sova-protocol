# Phase 1.3 isolated issuer signing and relay

## Trust boundaries

The Phase 1.3 pilot separates three processes:

1. The preparer creates a synthetic disclosure, random salt/nonce, commitment,
   and unsigned request without access to any signing key.
2. The issuer signer opens only `SOVA_ISSUER_PRIVATE_KEY` through the encrypted
   Hardhat keystore, recomputes and validates the disclosure commitment, refreshes
   chain timestamps, and signs the exact EIP-712 request.
3. The relayer opens the separate deployer/relayer key, recovers the issuer from
   the signature, checks timestamp margin, and submits `attestBySig`.

The issuer key is never available to the preparer, relayer, API, request files,
or disclosure files. The relayer is untrusted and cannot change any signed field.

## Local workflow

```powershell
npm run relay:prepare
npm run issuer:sign-relay
npm run relay:submit
npm run relay:status
```

Prepared, signed, disclosure, and archived request files stay under the ignored
`issuer-data/` directory. Signing refreshes `issuedAt`, seven-day expiry, and a
15-minute signature deadline. Submission refuses requests with more than 240
seconds of clock skew, preserving a 60-second margin under the registry's
five-minute limit.

## Production boundary

This is testnet key isolation, not a production custody system. Production must
replace local keystores with reviewed HSM/KMS or contract-wallet policy, require
authenticated issuance jobs, audit every signing decision, enforce rate limits,
and define key rotation and emergency suspension procedures.
