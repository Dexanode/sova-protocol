# Phase 0.8 read path

Phase 0.8 adds two non-authoritative read layers over the registry:

1. `SovaReadClient` performs direct contract reads and locally verifies salted
   payload disclosures.
2. `indexer-sync` rebuilds a confirmed event projection from the registry
   deployment block.

The contract remains the source of truth. Indexed lifecycle state must never be
accepted without a current `getAttestationStatus` or `isUsable` read when a
decision is security-sensitive. The indexer waits six blocks and rebuilds from
deployment on each run, making the initial implementation deterministic and
simple to recover. Incremental checkpoints and a database can be introduced
after the event projection is validated.

Phase 1.2 replaces the JSON projection with an incremental SQLite index. Each
sync rewinds 20 blocks, deletes potentially reorganized events, refetches in
5,000-block chunks, and transactionally rebuilds projections. The generated
`indexer-data/` directory is local and excluded from Git.
