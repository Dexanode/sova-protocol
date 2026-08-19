import { expect } from "chai";
import { RegistryIndex, type IndexedEvent } from "../src/indexer/RegistryIndex.js";

const ZERO = `0x${"0".repeat(64)}`;
const SCHEMA = `0x${"1".repeat(64)}`;
const SUBJECT = `0x${"2".repeat(64)}`;
const ATTESTATION = `0x${"3".repeat(64)}`;
const ISSUER = "0x0000000000000000000000000000000000000001";

describe("RegistryIndex", function () {
  it("persists and rebuilds a subject lifecycle projection", function () {
    const index = new RegistryIndex(":memory:");
    const event = (
      blockNumber: number,
      logIndex: number,
      name: string,
      args: Record<string, string>,
    ): IndexedEvent => ({
      blockNumber,
      blockHash: `0x${String(blockNumber).padStart(64, "0")}`,
      transactionHash: `0x${String(blockNumber * 10 + logIndex).padStart(64, "0")}`,
      logIndex,
      name,
      args,
    });
    index.replaceFromBlock(1, [
      event(1, 0, "SchemaRegistered", { schemaId: SCHEMA, metadataHash: SCHEMA, maxValidity: "100" }),
      event(2, 0, "IssuerAuthorizationSet", {
        schemaId: SCHEMA,
        issuer: ISSUER,
        state: "1",
        validFrom: "0",
        validUntil: "0",
        epoch: "1",
        metadataHash: SCHEMA,
      }),
      event(3, 0, "AttestationIssued", {
        attestationId: ATTESTATION,
        subjectId: SUBJECT,
        schemaId: SCHEMA,
        issuer: ISSUER,
        dataHash: ZERO,
        issuedAt: "10",
        expiresAt: "20",
        issuerEpoch: "1",
      }),
      event(4, 0, "AttestationRevoked", {
        attestationId: ATTESTATION,
        issuer: ISSUER,
        reason: SCHEMA,
        revokedAt: "15",
      }),
    ], 4);

    expect(index.getIndexedThrough()).to.equal(4);
    expect(index.countEvents()).to.equal(4);
    const [attestation] = index.getAttestationsBySubject(SUBJECT);
    expect(attestation?.attestationId).to.equal(ATTESTATION);
    expect(attestation?.revokedAt).to.equal("15");
    expect(attestation?.revocationReason).to.equal(SCHEMA);
    index.close();
  });

  it("rewinds replaced blocks before rebuilding projections", function () {
    const index = new RegistryIndex(":memory:");
    index.replaceFromBlock(1, [], 10);
    index.replaceFromBlock(8, [], 12);
    expect(index.getIndexedThrough()).to.equal(12);
    expect(index.countEvents()).to.equal(0);
    index.close();
  });
});
