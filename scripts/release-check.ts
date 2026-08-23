import { existsSync, readFileSync } from "node:fs";
import { CAMPAIGN_ATTESTATION } from "../src/pilot/ApiCampaign.js";
import { SOVA_REGISTRY_ADDRESS, SOVA_SCHEMA_ID } from "../src/SovaReadClient.js";

const manifest = JSON.parse(
  readFileSync("release/testnet-integration-v0.1.json", "utf8"),
) as Record<string, unknown>;
const reportFile = "pilot-data/phase-1.7-api-campaign.json";
if (!existsSync(reportFile)) throw new Error("Run npm run api:campaign before release:check");
const campaign = JSON.parse(readFileSync(reportFile, "utf8")) as Record<string, unknown>;

const checks = {
  engineeringFrozen: manifest.status === "engineering-frozen",
  testnetChain: manifest.chainId === "1874",
  registry: manifest.registry === SOVA_REGISTRY_ADDRESS,
  schema: manifest.schemaId === SOVA_SCHEMA_ID,
  fixture: manifest.fixtureAttestation === CAMPAIGN_ATTESTATION,
  apiContract: typeof manifest.apiContract === "string" && existsSync(manifest.apiContract),
  campaignContract: typeof manifest.syntheticCampaign === "string"
    && existsSync(manifest.syntheticCampaign),
  campaignPass: campaign.decision === "PASS" && campaign.failed === 0,
  externalValidationHonest: manifest.externalUsabilityValidated === false,
  auditHonest: manifest.independentContractAuditComplete === false,
  productionBoundary: manifest.productionReady === false,
};
const ok = Object.values(checks).every(Boolean);
console.log(JSON.stringify({ ok, release: manifest.release, checks }, null, 2));
if (!ok) process.exitCode = 1;
