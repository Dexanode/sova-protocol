# Dependency review v0.1

Date: 2026-08-19

## Results

- `npm audit --omit=dev`: **0 vulnerabilities**
- `npm audit`: **0 vulnerabilities**

The original toolchain reported 14 transitive advisories. Patched overrides for
`diff` and `serialize-javascript` removed the High and Moderate findings. The
monolithic toolbox was then replaced with the minimal ethers, chai-matchers,
keystore, mocha, and typechain plugins, eliminating the unused Ignition/Verify
ethers-v5 `elliptic` chain. A clean install now audits 299 packages with zero
known vulnerabilities. There are no production npm dependencies.

## Decision

Deployment tooling now uses explicit ethers scripts and the production compiler
profile. The migration passed clean install, clean production build, type-check,
lint, 21 tests, and deployed-runtime bytecode comparison. Future dependency
changes must repeat those gates rather than use a blind `npm audit fix`.
