# Dependency review v0.1

Date: 2026-08-19

## Results

- `npm audit --omit=dev`: **0 vulnerabilities**
- `npm audit`: **14 transitive development-tool advisories**
  (`12 low`, `1 moderate`, `1 high`)

The advisories are in the Hardhat/Mocha/Ignition development dependency graph,
including `diff`, `serialize-javascript`, and the ethers-v5 `elliptic` chain
pulled by verification tooling. There are no production npm dependencies in the
current package.

## Decision

Do not run a blind `npm audit fix` during release-candidate freeze. Dependency
changes can alter compiler, deployment, verification, or test behavior and must
pass the complete release gate. Track upstream Hardhat/toolbox releases and
upgrade in a dedicated branch with clean-build, test, bytecode, and verification
comparisons.

This decision does not waive the advisories. CI must not process untrusted patch
or serialized JavaScript inputs through vulnerable development utilities.
