import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { summarizePilotFeedback, validatePilotFeedback } from "../src/pilot/Feedback.js";
import { assessPilotProgress, type PilotRun } from "../src/pilot/Run.js";

const RUN_FILE = process.env.SOVA_PILOT_RUN_FILE ?? "pilot-data/phase-1.7-run.json";
const FEEDBACK_DIRECTORY = process.env.SOVA_PILOT_FEEDBACK_DIRECTORY ?? "pilot-feedback";
if (!existsSync(RUN_FILE)) throw new Error("Pilot is not open; run npm run pilot:open first");
const run = JSON.parse(readFileSync(RUN_FILE, "utf8")) as PilotRun;
const files = existsSync(FEEDBACK_DIRECTORY)
  ? readdirSync(FEEDBACK_DIRECTORY).filter((file) => file.endsWith(".json")).sort()
  : [];
const feedback = files.map((file) => validatePilotFeedback(
  JSON.parse(readFileSync(join(FEEDBACK_DIRECTORY, file), "utf8")) as unknown,
));
if (new Set(feedback.map((record) => record.sessionId)).size !== feedback.length) {
  throw new Error("Duplicate sessionId across feedback files");
}
const summary = feedback.length === 0 ? undefined : summarizePilotFeedback(feedback);
console.log(JSON.stringify({
  pilotId: run.pilotId,
  openedAt: run.openedAt,
  closesAt: run.closesAt,
  ...assessPilotProgress(run, summary, new Date()),
}, null, 2));
