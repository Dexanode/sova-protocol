import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { JsonRpcProvider } from "ethers";
import {
  AttestationStatus,
  SOVA_REGISTRY_ADDRESS,
  SovaReadClient,
  verifyDisclosure,
} from "../src/SovaReadClient.js";
import { RegistryIndex } from "../src/indexer/RegistryIndex.js";

const PORT = Number(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "127.0.0.1";
const DATABASE = process.env.SOVA_INDEX_DATABASE ?? "indexer-data/whitechain-sepolia.sqlite";
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const client = new SovaReadClient(provider);
const index = new RegistryIndex(DATABASE);
const bytes32Pattern = /^0x[0-9a-fA-F]{64}$/;
const bytesPattern = /^0x(?:[0-9a-fA-F]{2})*$/;

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(`${JSON.stringify(body)}\n`);
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 65_536) throw new Error("REQUEST_TOO_LARGE");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function serializeAttestation(attestationId: string, value: Awaited<ReturnType<SovaReadClient["getAttestation"]>>) {
  return {
    attestationId,
    ...value,
    issuedAt: value.issuedAt.toString(),
    expiresAt: value.expiresAt.toString(),
    issuerEpoch: value.issuerEpoch.toString(),
    revokedAt: value.revokedAt.toString(),
    status: AttestationStatus[value.status],
  };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/health") {
      json(response, 200, {
        ok: true,
        chainId: "1874",
        registry: SOVA_REGISTRY_ADDRESS,
        indexedThrough: index.getIndexedThrough() ?? null,
        eventCount: index.countEvents(),
      });
      return;
    }

    const attestationMatch = url.pathname.match(/^\/v1\/attestations\/(0x[0-9a-fA-F]{64})$/);
    if (request.method === "GET" && attestationMatch !== null) {
      const attestationId = attestationMatch[1];
      try {
        json(response, 200, serializeAttestation(attestationId, await client.getAttestation(attestationId)));
      } catch {
        json(response, 404, { error: "ATTESTATION_NOT_FOUND" });
      }
      return;
    }

    const schemaMatch = url.pathname.match(/^\/v1\/schemas\/(0x[0-9a-fA-F]{64})$/);
    if (request.method === "GET" && schemaMatch !== null) {
      const schema = await client.getSchema(schemaMatch[1]);
      if (!schema.exists) {
        json(response, 404, { error: "SCHEMA_NOT_FOUND" });
      } else {
        json(response, 200, { ...schema, maxValidity: schema.maxValidity.toString() });
      }
      return;
    }

    const subjectMatch = url.pathname.match(/^\/v1\/subjects\/(0x[0-9a-fA-F]{64})\/attestations$/);
    if (request.method === "GET" && subjectMatch !== null) {
      const limit = Number(url.searchParams.get("limit") ?? "50");
      const discovered = index.getAttestationsBySubject(subjectMatch[1], limit);
      const attestations = await Promise.all(
        discovered.map(async ({ attestationId }) =>
          serializeAttestation(attestationId, await client.getAttestation(attestationId))),
      );
      json(response, 200, { attestations });
      return;
    }

    if (request.method === "POST" && url.pathname === "/v1/verify-disclosure") {
      const body = await readJson(request);
      if (
        typeof body !== "object" || body === null
        || !("attestationId" in body) || !("encodedPayload" in body) || !("salt" in body)
      ) {
        json(response, 400, { error: "INVALID_REQUEST" });
        return;
      }
      const input = body as Record<string, unknown>;
      if (
        typeof input.attestationId !== "string" || !bytes32Pattern.test(input.attestationId)
        || typeof input.encodedPayload !== "string" || !bytesPattern.test(input.encodedPayload)
        || typeof input.salt !== "string" || !bytes32Pattern.test(input.salt)
      ) {
        json(response, 400, { error: "INVALID_REQUEST" });
        return;
      }
      try {
        const attestation = await client.getAttestation(input.attestationId);
        json(response, 200, {
          matches: verifyDisclosure(
            attestation.dataHash,
            attestation.schemaId,
            input.encodedPayload,
            input.salt,
          ),
        });
      } catch {
        json(response, 404, { error: "ATTESTATION_NOT_FOUND" });
      }
      return;
    }

    json(response, 404, { error: "NOT_FOUND" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    json(response, message === "REQUEST_TOO_LARGE" ? 413 : 503, { error: "SERVICE_UNAVAILABLE" });
  }
});

server.on("close", () => index.close());
server.listen(PORT, HOST, () => {
  console.log(`sova_api=http://${HOST}:${PORT}`);
  console.log(`database=${DATABASE}`);
});
