import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createPilotRun } from "../src/pilot/Run.js";

const OUTPUT = process.env.SOVA_PILOT_RUN_FILE ?? "pilot-data/phase-1.7-run.json";
if (existsSync(OUTPUT)) {
  const existing = JSON.parse(readFileSync(OUTPUT, "utf8")) as { pilotId?: unknown; closesAt?: unknown };
  console.log("pilot_status=ALREADY_OPENED");
  console.log(`pilot_id=${String(existing.pilotId ?? "unknown")}`);
  console.log(`closes_at=${String(existing.closesAt ?? "unknown")}`);
} else {
  const openedAt = new Date();
  const run = createPilotRun(openedAt, `pilot_${randomUUID().replaceAll("-", "").slice(0, 16)}`);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(run, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log("pilot_status=OPENED");
  console.log(`pilot_id=${run.pilotId}`);
  console.log(`opened_at=${run.openedAt}`);
  console.log(`closes_at=${run.closesAt}`);
  console.log(`output=${OUTPUT}`);
}
