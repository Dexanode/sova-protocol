import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  buildCampaignReport,
  CAMPAIGN_ATTESTATION,
  CAMPAIGN_ISSUER,
  CAMPAIGN_SCHEMA,
  CAMPAIGN_SUBJECT,
  type ApiScenarioResult,
} from "../src/pilot/ApiCampaign.js";

const BASE_URL = (process.env.SOVA_API_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const OUTPUT = process.env.SOVA_API_CAMPAIGN_REPORT
  ?? "pilot-data/phase-1.7-api-campaign.json";
const scenarios: ApiScenarioResult[] = [];

async function scenario(
  name: string,
  path: string,
  expectedStatus: number,
  validate: (body: unknown, response: Response) => boolean,
  init?: RequestInit,
): Promise<void> {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { accept: "application/json", ...init?.headers },
    });
    const raw = await response.text();
    let body: unknown = raw;
    try { body = JSON.parse(raw) as unknown; } catch { /* metrics and invalid bodies remain text */ }
    const passed = response.status === expectedStatus && validate(body, response);
    scenarios.push({
      name,
      passed,
      status: response.status,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      ...(passed ? {} : { failure: `expected status ${expectedStatus} and response contract` }),
    });
  } catch {
    scenarios.push({
      name,
      passed: false,
      status: 0,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      failure: "request failed",
    });
  }
}

await scenario("readiness", "/health", 200, (body) => (
  typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true
));
await scenario("security-headers", "/", 200, (_body, response) => (
  response.headers.has("x-request-id")
  && response.headers.get("x-content-type-options") === "nosniff"
  && response.headers.has("content-security-policy")
));
await scenario("active-attestation", `/v1/attestations/${CAMPAIGN_ATTESTATION}`, 200, (body) => {
  const value = body as { status?: unknown; usable?: unknown };
  return value.status === "ACTIVE" && value.usable === true;
});
await scenario("active-schema", `/v1/schemas/${CAMPAIGN_SCHEMA}`, 200, (body) => {
  const value = body as { exists?: unknown; active?: unknown };
  return value.exists === true && value.active === true;
});
await scenario(
  "policy-accepted",
  "/v1/evaluate",
  200,
  (body) => (body as { accepted?: unknown }).accepted === true,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      attestationId: CAMPAIGN_ATTESTATION,
      policy: {
        schemaId: CAMPAIGN_SCHEMA,
        acceptedIssuers: [CAMPAIGN_ISSUER],
        maxAgeSeconds: "2592000",
        requireDisclosure: false,
      },
    }),
  },
);
await scenario(
  "disclosure-required",
  "/v1/evaluate",
  200,
  (body) => {
    const value = body as { accepted?: unknown; reasons?: unknown };
    return value.accepted === false
      && Array.isArray(value.reasons)
      && value.reasons.includes("DISCLOSURE_REQUIRED");
  },
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      attestationId: CAMPAIGN_ATTESTATION,
      policy: {
        schemaId: CAMPAIGN_SCHEMA,
        acceptedIssuers: [CAMPAIGN_ISSUER],
        maxAgeSeconds: "2592000",
        requireDisclosure: true,
      },
    }),
  },
);
await scenario("attestation-not-found", `/v1/attestations/0x${"0".repeat(64)}`, 404, (body) => (
  (body as { error?: unknown }).error === "ATTESTATION_NOT_FOUND"
));
await scenario("subject-discovery", `/v1/subjects/${CAMPAIGN_SUBJECT}/attestations?limit=20`, 200, (body) => {
  const records = (body as { attestations?: unknown }).attestations;
  return Array.isArray(records)
    && records.some((record) => (
      typeof record === "object" && record !== null
      && (record as { attestationId?: unknown }).attestationId === CAMPAIGN_ATTESTATION
    ));
});
await scenario("invalid-json", "/v1/evaluate", 400, (body) => (
  (body as { error?: unknown }).error === "INVALID_JSON"
), { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
await scenario("metrics", "/metrics", 200, (body) => (
  typeof body === "string" && body.includes("sova_api_requests_total")
));

for (let index = 1; index <= 12; index += 1) {
  await scenario(`repeat-active-read-${String(index).padStart(2, "0")}`, `/v1/attestations/${CAMPAIGN_ATTESTATION}`, 200, (body) => (
    (body as { status?: unknown }).status === "ACTIVE"
  ));
}

const report = buildCampaignReport(BASE_URL, scenarios);
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
console.log(`campaign_decision=${report.decision}`);
console.log(`scenarios_passed=${report.passed}/${report.total}`);
console.log(`p95_duration_ms=${report.p95DurationMs}`);
console.log(`output=${OUTPUT}`);
if (report.decision !== "PASS") process.exitCode = 1;
