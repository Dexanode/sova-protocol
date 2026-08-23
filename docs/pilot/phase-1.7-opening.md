# Phase 1.7 bounded pilot opening

Status: `IN_PROGRESS — NOT READY FOR PARTICIPANTS`

The local pilot window was opened on 2026-08-23 at
`2026-08-23T02:26:10.749Z` and closes at `2026-09-06T02:26:10.749Z`.
The scope remains capped at 12 participants and requires at least 8 valid
sessions. Raw run state and participant feedback remain ignored local data.

## Opening checks

- Whitechain Sepolia chain ID `1874` confirmed.
- Registry bytecode and canonical active schema confirmed.
- SQLite quick check passed with 5 stored events.
- Index checkpoint `5855585`, chain head `5855599`, lag 14 blocks.
- Pilot issuer authorization ACTIVE through `2026-09-18T00:42:56Z`.
- Existing relayed fixture ACTIVE and usable at opening.

## Blocking fixture gate

The existing fixture expires at `2026-08-26T02:58:25Z`, before the pilot window
closes. Participants must not be invited until a new synthetic fixture is
issued with validity covering the window and its direct registry status is
confirmed ACTIVE/usable. Phase 1.7 tooling accepts a reviewed
`SOVA_RELAY_VALIDITY_DAYS` value from 1 through the schema maximum of 90 days;
15 days is the intended bounded-pilot value and can be prepared with
`npm run relay:prepare -- 15`. The signer preserves the reviewed pending-request
validity when it refreshes the issuance timestamp.

The fixture refresh requires the issuer keystore and therefore remains an
explicit human signing step. No key, password, salt, or disclosure is recorded
in this evidence file.
