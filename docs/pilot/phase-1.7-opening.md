# Phase 1.7 bounded pilot opening

Status: `IN_PROGRESS — READY FOR PARTICIPANTS`

The local pilot window was opened on 2026-08-23 at
`2026-08-23T02:26:10.749Z` and closes at `2026-09-06T02:26:10.749Z`.
The scope remains capped at 12 participants and requires at least 8 valid
sessions. Raw run state and participant feedback remain ignored local data.

## Opening checks

- Whitechain Sepolia chain ID `1874` confirmed.
- Registry bytecode and canonical active schema confirmed.
- SQLite quick check passed; after fixture issuance the index stores 6 events.
- Post-fixture checkpoint `5855991`, chain head `5856004`, lag 13 blocks.
- Pilot issuer authorization ACTIVE through `2026-09-18T00:42:56Z`.
- Existing relayed fixture ACTIVE and usable at opening.

## Fixture gate closed

Synthetic attestation
`0x2bc2f60ae0fbd643015653010057be9f6f3ae1585aa8dc514c415b54c57f1bc1`
was relayed in block `5855967` by the designated relayer. Direct registry reads
confirmed status `ACTIVE` and `usable=true`. It expires at
`2026-09-07T02:31:11Z`, after the pilot closes, and therefore covers the full
window. The dashboard default now points to this fixture.

Transaction:
`0x6546376c97ec26c98d078e26fe6b5ba40b736e162887375fa0ff0f515975b059`.
No key, password, salt, signature, or disclosure is recorded in this evidence
file.
