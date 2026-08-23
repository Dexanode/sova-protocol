import { expect } from "chai";
import { buildCampaignReport, percentileNearestRank } from "../src/pilot/ApiCampaign.js";

describe("ApiCampaign", function () {
  it("computes a nearest-rank p95 without mutating samples", function () {
    const values = [40, 10, 30, 20];
    expect(percentileNearestRank(values, 0.95)).to.equal(40);
    expect(values).to.deep.equal([40, 10, 30, 20]);
  });

  it("fails the campaign when any scenario fails", function () {
    const report = buildCampaignReport("http://127.0.0.1:3000", [
      { name: "health", passed: true, status: 200, durationMs: 10 },
      { name: "not-found", passed: false, status: 503, durationMs: 20, failure: "expected 404" },
    ], "2026-08-23T00:00:00.000Z");
    expect(report.decision).to.equal("FAIL");
    expect(report.passed).to.equal(1);
    expect(report.failed).to.equal(1);
  });
});
