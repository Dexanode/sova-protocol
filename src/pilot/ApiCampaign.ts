export const CAMPAIGN_ATTESTATION =
  "0x2bc2f60ae0fbd643015653010057be9f6f3ae1585aa8dc514c415b54c57f1bc1";
export const CAMPAIGN_SCHEMA =
  "0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526";
export const CAMPAIGN_ISSUER = "0x9325B1eba43AD4A3104D191909fFa0DcFabB2B28";
export const CAMPAIGN_SUBJECT =
  "0x6b87de87f71262f5873b1d3ccc9ae09e21fc55f83a4ca3af690e5703de0eb9e7";

export type ApiScenarioResult = {
  name: string;
  passed: boolean;
  status: number;
  durationMs: number;
  failure?: string;
};

export type ApiCampaignReport = {
  version: "1.0";
  campaign: "synthetic-api-validation";
  generatedAt: string;
  baseUrl: string;
  chainId: "1874";
  fixtureAttestation: string;
  scenarios: ApiScenarioResult[];
  total: number;
  passed: number;
  failed: number;
  p95DurationMs: number;
  p95BudgetMs: 5000;
  decision: "PASS" | "FAIL";
};

export function percentileNearestRank(values: readonly number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile <= 0 || percentile > 1) throw new Error("Percentile must be in (0, 1]");
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(percentile * sorted.length) - 1] ?? 0;
}

export function buildCampaignReport(
  baseUrl: string,
  scenarios: ApiScenarioResult[],
  generatedAt = new Date().toISOString(),
): ApiCampaignReport {
  const passed = scenarios.filter((scenario) => scenario.passed).length;
  const p95DurationMs = percentileNearestRank(
    scenarios.map((scenario) => scenario.durationMs),
    0.95,
  );
  return {
    version: "1.0",
    campaign: "synthetic-api-validation",
    generatedAt,
    baseUrl,
    chainId: "1874",
    fixtureAttestation: CAMPAIGN_ATTESTATION,
    scenarios,
    total: scenarios.length,
    passed,
    failed: scenarios.length - passed,
    p95DurationMs,
    p95BudgetMs: 5000,
    decision: passed === scenarios.length && p95DurationMs <= 5000 ? "PASS" : "FAIL",
  };
}
