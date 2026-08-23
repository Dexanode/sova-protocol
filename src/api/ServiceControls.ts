import { randomUUID } from "node:crypto";

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Window = { count: number; resetsAt: number };

export class FixedWindowRateLimiter {
  readonly #windows = new Map<string, Window>();

  constructor(
    readonly limit: number,
    readonly windowMs: number,
    readonly now: () => number = Date.now,
  ) {
    if (!Number.isInteger(limit) || limit < 1) throw new Error("Invalid rate limit");
    if (!Number.isInteger(windowMs) || windowMs < 1) throw new Error("Invalid rate-limit window");
  }

  consume(key: string): RateLimitDecision {
    const now = this.now();
    let window = this.#windows.get(key);
    if (window === undefined || now >= window.resetsAt) {
      window = { count: 0, resetsAt: now + this.windowMs };
      this.#windows.set(key, window);
    }
    window.count += 1;
    const allowed = window.count <= this.limit;
    return {
      allowed,
      remaining: Math.max(this.limit - window.count, 0),
      retryAfterSeconds: Math.max(Math.ceil((window.resetsAt - now) / 1_000), 1),
    };
  }
}

export class ServiceMetrics {
  readonly startedAt = Date.now();
  requestsTotal = 0;
  errorsTotal = 0;
  rateLimitedTotal = 0;
  inFlight = 0;
  requestDurationMsTotal = 0;

  record(status: number, durationMs: number): void {
    this.requestsTotal += 1;
    if (status >= 500) this.errorsTotal += 1;
    if (status === 429) this.rateLimitedTotal += 1;
    this.requestDurationMsTotal += durationMs;
  }

  render(indexedThrough: number | undefined, chainHead: number | undefined): string {
    const lag = indexedThrough === undefined || chainHead === undefined
      ? -1
      : Math.max(chainHead - indexedThrough, 0);
    return [
      "# HELP sova_api_up Whether the API process is running.",
      "# TYPE sova_api_up gauge",
      "sova_api_up 1",
      "# TYPE sova_api_requests_total counter",
      `sova_api_requests_total ${this.requestsTotal}`,
      "# TYPE sova_api_errors_total counter",
      `sova_api_errors_total ${this.errorsTotal}`,
      "# TYPE sova_api_rate_limited_total counter",
      `sova_api_rate_limited_total ${this.rateLimitedTotal}`,
      "# TYPE sova_api_requests_in_flight gauge",
      `sova_api_requests_in_flight ${this.inFlight}`,
      "# TYPE sova_api_request_duration_ms_total counter",
      `sova_api_request_duration_ms_total ${this.requestDurationMsTotal}`,
      "# TYPE sova_api_uptime_seconds gauge",
      `sova_api_uptime_seconds ${Math.floor((Date.now() - this.startedAt) / 1_000)}`,
      "# HELP sova_index_lag_blocks Difference between chain head and confirmed index checkpoint; -1 means unknown.",
      "# TYPE sova_index_lag_blocks gauge",
      `sova_index_lag_blocks ${lag}`,
      "",
    ].join("\n");
  }
}

export function requestId(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate !== undefined && /^[A-Za-z0-9._-]{1,64}$/.test(candidate)
    ? candidate
    : randomUUID();
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("UPSTREAM_TIMEOUT")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
