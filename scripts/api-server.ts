import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { JsonRpcProvider, getAddress } from "ethers";
import {
  AttestationStatus,
  SOVA_REGISTRY_ADDRESS,
  SovaReadClient,
  verifyDisclosure,
} from "../src/SovaReadClient.js";
import { RegistryIndex } from "../src/indexer/RegistryIndex.js";
import { evaluateAttestation, type ConsumerPolicy } from "../src/ConsumerPolicy.js";

const PORT = Number(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "127.0.0.1";
const DATABASE = process.env.SOVA_INDEX_DATABASE ?? "indexer-data/whitechain-sepolia.sqlite";
const rpc = process.env.WHITECHAIN_SEPOLIA_RPC_URL ?? "https://rpc.testnet.whitechain.io";
const provider = new JsonRpcProvider(rpc, 1874, { staticNetwork: true });
const client = new SovaReadClient(provider);
const index = new RegistryIndex(DATABASE);
const bytes32Pattern = /^0x[0-9a-fA-F]{64}$/;
const bytesPattern = /^0x(?:[0-9a-fA-F]{2})*$/;
const DASHBOARD_DIRECTORY = "dashboard";

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    ...securityHeaders,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function staticFile(response: ServerResponse, file: string): void {
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
  };
  const body = readFileSync(join(DASHBOARD_DIRECTORY, file));
  response.writeHead(200, {
    ...securityHeaders,
    "content-type": types[extname(file)] ?? "application/octet-stream",
    "cache-control": file.endsWith(".html") ? "no-store" : "public, max-age=300",
  });
  response.end(body);
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
    if (request.method === "GET" && url.pathname === "/") {
      staticFile(response, "index.html");
      return;
    }
    if (request.method === "GET" && url.pathname === "/dashboard.css") {
      staticFile(response, "dashboard.css");
      return;
    }
    if (request.method === "GET" && url.pathname === "/dashboard.js") {
      staticFile(response, "dashboard.js");
      return;
    }
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

    if (request.method === "POST" && url.pathname === "/v1/evaluate") {
      const body = await readJson(request);
      if (typeof body !== "object" || body === null) {
        json(response, 400, { error: "INVALID_REQUEST" });
        return;
      }
      const input = body as Record<string, unknown>;
      const policyInput = input.policy;
      if (
        typeof input.attestationId !== "string" || !bytes32Pattern.test(input.attestationId)
        || typeof policyInput !== "object" || policyInput === null
      ) {
        json(response, 400, { error: "INVALID_REQUEST" });
        return;
      }
      const rawPolicy = policyInput as Record<string, unknown>;
      if (
        typeof rawPolicy.schemaId !== "string" || !bytes32Pattern.test(rawPolicy.schemaId)
        || !Array.isArray(rawPolicy.acceptedIssuers) || rawPolicy.acceptedIssuers.length > 20
        || !rawPolicy.acceptedIssuers.every((issuer) => typeof issuer === "string")
        || typeof rawPolicy.maxAgeSeconds !== "string" || !/^\d+$/.test(rawPolicy.maxAgeSeconds)
        || typeof rawPolicy.requireDisclosure !== "boolean"
      ) {
        json(response, 400, { error: "INVALID_POLICY" });
        return;
      }
      let acceptedIssuers: string[];
      try {
        acceptedIssuers = rawPolicy.acceptedIssuers.map((issuer) => getAddress(issuer as string));
      } catch {
        json(response, 400, { error: "INVALID_ISSUER" });
        return;
      }
      const maxAgeSeconds = BigInt(rawPolicy.maxAgeSeconds);
      if (maxAgeSeconds === 0n || maxAgeSeconds > 365n * 24n * 60n * 60n) {
        json(response, 400, { error: "INVALID_MAX_AGE" });
        return;
      }
      const disclosureInput = input.disclosure;
      const disclosure =
        typeof disclosureInput === "object" && disclosureInput !== null
        && "encodedPayload" in disclosureInput && "salt" in disclosureInput
        && typeof disclosureInput.encodedPayload === "string"
        && bytesPattern.test(disclosureInput.encodedPayload)
        && typeof disclosureInput.salt === "string" && bytes32Pattern.test(disclosureInput.salt)
          ? { encodedPayload: disclosureInput.encodedPayload, salt: disclosureInput.salt }
          : undefined;
      const [attestation, block] = await Promise.all([
        client.getAttestation(input.attestationId),
        provider.getBlock("latest"),
      ]);
      if (block === null) throw new Error("Latest block unavailable");
      const policy: ConsumerPolicy = {
        chainId: 1874n,
        registryAddress: SOVA_REGISTRY_ADDRESS,
        schemaId: rawPolicy.schemaId,
        acceptedIssuers,
        maxAgeSeconds,
        requireDisclosure: rawPolicy.requireDisclosure,
      };
      json(response, 200, evaluateAttestation(attestation, policy, {
        chainId: 1874n,
        registryAddress: SOVA_REGISTRY_ADDRESS,
        now: BigInt(block.timestamp),
      }, disclosure));
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
