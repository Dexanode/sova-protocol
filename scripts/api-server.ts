import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { JsonRpcProvider, getAddress, id } from "ethers";
import {
  AttestationStatus,
  SOVA_REGISTRY_ADDRESS,
  SovaReadClient,
  verifyDisclosure,
} from "../src/SovaReadClient.js";
import { RegistryIndex } from "../src/indexer/RegistryIndex.js";
import { evaluateAttestation, type ConsumerPolicy } from "../src/ConsumerPolicy.js";
import {
  FixedWindowRateLimiter,
  ServiceMetrics,
  requestId,
  withTimeout,
} from "../src/api/ServiceControls.js";

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
const ATTESTATION_NOT_FOUND = id("AttestationNotFound()").slice(0, 10);
const RPC_TIMEOUT_MS = Number(process.env.SOVA_RPC_TIMEOUT_MS ?? "8000");
const RATE_LIMIT = Number(process.env.SOVA_RATE_LIMIT_PER_MINUTE ?? "60");
const MAX_INDEX_LAG_BLOCKS = Number(process.env.SOVA_MAX_INDEX_LAG_BLOCKS ?? "100");
const metrics = new ServiceMetrics();
const limiter = new FixedWindowRateLimiter(RATE_LIMIT, 60_000);
let lastChainHead: number | undefined;

for (const [name, value] of [
  ["PORT", PORT],
  ["SOVA_RPC_TIMEOUT_MS", RPC_TIMEOUT_MS],
  ["SOVA_RATE_LIMIT_PER_MINUTE", RATE_LIMIT],
  ["SOVA_MAX_INDEX_LAG_BLOCKS", MAX_INDEX_LAG_BLOCKS],
] as const) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${name}`);
}

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

function text(response: ServerResponse, status: number, body: string): void {
  response.writeHead(status, {
    ...securityHeaders,
    "content-type": "text/plain; version=0.0.4; charset=utf-8",
    "cache-control": "no-store",
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

function hasRevertData(error: unknown, selector: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (typeof record.data === "string" && record.data.startsWith(selector)) return true;
  return hasRevertData(record.error, selector) || hasRevertData(record.info, selector);
}

async function getAttestation(attestationId: string) {
  try {
    return await withTimeout(client.getAttestation(attestationId), RPC_TIMEOUT_MS);
  } catch (error) {
    if (hasRevertData(error, ATTESTATION_NOT_FOUND)) return undefined;
    throw error;
  }
}

const server = createServer(async (request, response) => {
  const startedAt = performance.now();
  const correlationId = requestId(request.headers["x-request-id"]);
  response.setHeader("x-request-id", correlationId);
  metrics.inFlight += 1;
  response.once("finish", () => {
    metrics.inFlight -= 1;
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    metrics.record(response.statusCode, durationMs);
    console.log(JSON.stringify({
      level: response.statusCode >= 500 ? "error" : "info",
      event: "http_request",
      requestId: correlationId,
      method: request.method,
      path: new URL(request.url ?? "/", "http://localhost").pathname,
      status: response.statusCode,
      durationMs,
    }));
  });
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
      const indexedThrough = index.getIndexedThrough();
      let rpcOk = false;
      let chainHead: number | undefined;
      try {
        chainHead = await withTimeout(provider.getBlockNumber(), RPC_TIMEOUT_MS);
        lastChainHead = chainHead;
        rpcOk = true;
      } catch {
        // Readiness fails closed without leaking upstream details.
      }
      const lagBlocks = indexedThrough === undefined || chainHead === undefined
        ? null
        : Math.max(chainHead - indexedThrough, 0);
      const databaseOk = index.integrityCheck();
      const ok = rpcOk && databaseOk && lagBlocks !== null && lagBlocks <= MAX_INDEX_LAG_BLOCKS;
      json(response, ok ? 200 : 503, {
        ok,
        chainId: "1874",
        registry: SOVA_REGISTRY_ADDRESS,
        rpcOk,
        databaseOk,
        indexedThrough: indexedThrough ?? null,
        chainHead: chainHead ?? null,
        indexLagBlocks: lagBlocks,
        maxIndexLagBlocks: MAX_INDEX_LAG_BLOCKS,
        eventCount: index.countEvents(),
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/metrics") {
      text(response, 200, metrics.render(index.getIndexedThrough(), lastChainHead));
      return;
    }

    if (url.pathname.startsWith("/v1/")) {
      const decision = limiter.consume(request.socket.remoteAddress ?? "unknown");
      response.setHeader("x-ratelimit-limit", String(RATE_LIMIT));
      response.setHeader("x-ratelimit-remaining", String(decision.remaining));
      if (!decision.allowed) {
        response.setHeader("retry-after", String(decision.retryAfterSeconds));
        json(response, 429, { error: "RATE_LIMITED" });
        return;
      }
    }

    const attestationMatch = url.pathname.match(/^\/v1\/attestations\/(0x[0-9a-fA-F]{64})$/);
    if (request.method === "GET" && attestationMatch !== null) {
      const attestationId = attestationMatch[1];
      const attestation = await getAttestation(attestationId);
      if (attestation === undefined) {
        json(response, 404, { error: "ATTESTATION_NOT_FOUND" });
      } else {
        json(response, 200, serializeAttestation(attestationId, attestation));
      }
      return;
    }

    const schemaMatch = url.pathname.match(/^\/v1\/schemas\/(0x[0-9a-fA-F]{64})$/);
    if (request.method === "GET" && schemaMatch !== null) {
      const schema = await withTimeout(client.getSchema(schemaMatch[1]), RPC_TIMEOUT_MS);
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
          serializeAttestation(
            attestationId,
            await withTimeout(client.getAttestation(attestationId), RPC_TIMEOUT_MS),
          )),
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
      const attestation = await getAttestation(input.attestationId);
      if (attestation === undefined) {
        json(response, 404, { error: "ATTESTATION_NOT_FOUND" });
      } else {
        json(response, 200, {
          matches: verifyDisclosure(
            attestation.dataHash,
            attestation.schemaId,
            input.encodedPayload,
            input.salt,
          ),
        });
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
      const [attestation, block] = await withTimeout(Promise.all([
        getAttestation(input.attestationId),
        provider.getBlock("latest"),
      ]), RPC_TIMEOUT_MS);
      if (block === null) throw new Error("Latest block unavailable");
      if (attestation === undefined) {
        json(response, 404, { error: "ATTESTATION_NOT_FOUND" });
        return;
      }
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
    if (message === "REQUEST_TOO_LARGE") {
      json(response, 413, { error: "REQUEST_TOO_LARGE" });
    } else if (error instanceof SyntaxError) {
      json(response, 400, { error: "INVALID_JSON" });
    } else {
      json(response, 503, { error: "SERVICE_UNAVAILABLE" });
    }
  }
});

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.on("close", () => index.close());
server.listen(PORT, HOST, () => {
  console.log(`sova_api=http://${HOST}:${PORT}`);
  console.log(`database=${DATABASE}`);
});

function shutdown(signal: string): void {
  console.log(JSON.stringify({ level: "info", event: "shutdown", signal }));
  server.close((error) => {
    if (error !== undefined) {
      console.error(JSON.stringify({ level: "error", event: "shutdown_failed" }));
      process.exitCode = 1;
    }
  });
  setTimeout(() => {
    console.error(JSON.stringify({ level: "error", event: "shutdown_timeout" }));
    process.exit(1);
  }, 10_000).unref();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
