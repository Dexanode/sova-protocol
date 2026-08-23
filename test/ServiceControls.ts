import { expect } from "chai";
import {
  FixedWindowRateLimiter,
  ServiceMetrics,
  requestId,
  withTimeout,
} from "../src/api/ServiceControls.js";

describe("ServiceControls", function () {
  it("enforces and resets a fixed request window", function () {
    let now = 1_000;
    const limiter = new FixedWindowRateLimiter(2, 1_000, () => now);
    expect(limiter.consume("client")).to.include({ allowed: true, remaining: 1 });
    expect(limiter.consume("client")).to.include({ allowed: true, remaining: 0 });
    expect(limiter.consume("client")).to.include({ allowed: false, remaining: 0 });
    now = 2_000;
    expect(limiter.consume("client")).to.include({ allowed: true, remaining: 1 });
  });

  it("renders bounded operational metrics", function () {
    const metrics = new ServiceMetrics();
    metrics.record(200, 12);
    metrics.record(503, 8);
    metrics.record(429, 2);
    const output = metrics.render(95, 100);
    expect(output).to.include("sova_api_requests_total 3");
    expect(output).to.include("sova_api_errors_total 1");
    expect(output).to.include("sova_api_rate_limited_total 1");
    expect(output).to.include("sova_index_lag_blocks 5");
  });

  it("accepts only safe caller request IDs", function () {
    expect(requestId("trace_123")).to.equal("trace_123");
    expect(requestId("bad value")).to.match(/^[0-9a-f-]{36}$/);
  });

  it("fails closed when an upstream call exceeds its budget", async function () {
    let message = "";
    try {
      await withTimeout(new Promise(() => undefined), 5);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).to.equal("UPSTREAM_TIMEOUT");
  });
});
