import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type IndexedEvent = {
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  logIndex: number;
  name: string;
  args: Record<string, string>;
};

export type IndexedAttestation = {
  attestationId: string;
  subjectId: string;
  schemaId: string;
  issuer: string;
  dataHash: string;
  issuedAt: string;
  expiresAt: string;
  issuerEpoch: string;
  revokedAt: string;
  revocationReason: string;
  issueTransactionHash: string;
  revokeTransactionHash: string | null;
};

export class RegistryIndex {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.#database = new DatabaseSync(path);
    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS events (
        transaction_hash TEXT NOT NULL,
        log_index INTEGER NOT NULL,
        block_number INTEGER NOT NULL,
        block_hash TEXT NOT NULL,
        event_name TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        PRIMARY KEY (transaction_hash, log_index)
      );
      CREATE INDEX IF NOT EXISTS events_block ON events(block_number, log_index);
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS schemas (
        schema_id TEXT PRIMARY KEY,
        metadata_hash TEXT NOT NULL,
        max_validity TEXT NOT NULL,
        active INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS issuers (
        schema_id TEXT NOT NULL,
        issuer TEXT NOT NULL,
        metadata_hash TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        epoch TEXT NOT NULL,
        state TEXT NOT NULL,
        PRIMARY KEY (schema_id, issuer)
      );
      CREATE TABLE IF NOT EXISTS attestations (
        attestation_id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        schema_id TEXT NOT NULL,
        issuer TEXT NOT NULL,
        data_hash TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        issuer_epoch TEXT NOT NULL,
        revoked_at TEXT NOT NULL DEFAULT '0',
        revocation_reason TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000000000000000000000000000',
        issue_transaction_hash TEXT NOT NULL,
        revoke_transaction_hash TEXT
      );
      CREATE INDEX IF NOT EXISTS attestations_subject ON attestations(subject_id, issued_at DESC);
    `);
  }

  close(): void {
    this.#database.close();
  }

  getIndexedThrough(): number | undefined {
    const row = this.#database.prepare("SELECT value FROM metadata WHERE key = 'indexedThrough'")
      .get() as { value: string } | undefined;
    return row === undefined ? undefined : Number(row.value);
  }

  replaceFromBlock(fromBlock: number, events: readonly IndexedEvent[], indexedThrough: number): void {
    this.#database.exec("BEGIN IMMEDIATE");
    try {
      this.#database.prepare("DELETE FROM events WHERE block_number >= ?").run(fromBlock);
      const insert = this.#database.prepare(`
        INSERT OR REPLACE INTO events
          (transaction_hash, log_index, block_number, block_hash, event_name, payload_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const event of events) {
        insert.run(
          event.transactionHash,
          event.logIndex,
          event.blockNumber,
          event.blockHash,
          event.name,
          JSON.stringify(event.args),
        );
      }
      this.#rebuildProjection();
      this.#database.prepare(`
        INSERT INTO metadata(key, value) VALUES ('indexedThrough', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(String(indexedThrough));
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  countEvents(): number {
    const row = this.#database.prepare("SELECT COUNT(*) AS count FROM events").get() as {
      count: number;
    };
    return Number(row.count);
  }

  getAttestationsBySubject(subjectId: string, limit = 50): IndexedAttestation[] {
    return this.#database.prepare(`
      SELECT
        attestation_id AS attestationId,
        subject_id AS subjectId,
        schema_id AS schemaId,
        issuer,
        data_hash AS dataHash,
        issued_at AS issuedAt,
        expires_at AS expiresAt,
        issuer_epoch AS issuerEpoch,
        revoked_at AS revokedAt,
        revocation_reason AS revocationReason,
        issue_transaction_hash AS issueTransactionHash,
        revoke_transaction_hash AS revokeTransactionHash
      FROM attestations WHERE lower(subject_id) = lower(?)
      ORDER BY CAST(issued_at AS INTEGER) DESC LIMIT ?
    `).all(subjectId, Math.min(Math.max(limit, 1), 100)) as unknown as IndexedAttestation[];
  }

  #rebuildProjection(): void {
    this.#database.exec("DELETE FROM schemas; DELETE FROM issuers; DELETE FROM attestations;");
    const rows = this.#database.prepare(`
      SELECT transaction_hash AS transactionHash, event_name AS name, payload_json AS payload
      FROM events ORDER BY block_number, log_index
    `).all() as Array<{ transactionHash: string; name: string; payload: string }>;

    for (const row of rows) {
      const args = JSON.parse(row.payload) as Record<string, string>;
      if (row.name === "SchemaRegistered") {
        this.#database.prepare(`
          INSERT INTO schemas(schema_id, metadata_hash, max_validity, active) VALUES (?, ?, ?, 1)
        `).run(args.schemaId, args.metadataHash, args.maxValidity);
      } else if (row.name === "SchemaActiveSet") {
        this.#database.prepare("UPDATE schemas SET active = ? WHERE schema_id = ?")
          .run(args.active === "true" ? 1 : 0, args.schemaId);
      } else if (row.name === "IssuerAuthorizationSet") {
        this.#database.prepare(`
          INSERT INTO issuers(schema_id, issuer, metadata_hash, valid_from, valid_until, epoch, state)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(schema_id, issuer) DO UPDATE SET
            metadata_hash=excluded.metadata_hash, valid_from=excluded.valid_from,
            valid_until=excluded.valid_until, epoch=excluded.epoch, state=excluded.state
        `).run(
          args.schemaId,
          args.issuer.toLowerCase(),
          args.metadataHash,
          args.validFrom,
          args.validUntil,
          args.epoch,
          args.state,
        );
      } else if (row.name === "AttestationIssued") {
        this.#database.prepare(`
          INSERT INTO attestations(
            attestation_id, subject_id, schema_id, issuer, data_hash, issued_at,
            expires_at, issuer_epoch, issue_transaction_hash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          args.attestationId,
          args.subjectId,
          args.schemaId,
          args.issuer.toLowerCase(),
          args.dataHash,
          args.issuedAt,
          args.expiresAt,
          args.issuerEpoch,
          row.transactionHash,
        );
      } else if (row.name === "AttestationRevoked") {
        this.#database.prepare(`
          UPDATE attestations SET revoked_at=?, revocation_reason=?, revoke_transaction_hash=?
          WHERE attestation_id=?
        `).run(args.revokedAt, args.reason, row.transactionHash, args.attestationId);
      }
    }
  }
}
