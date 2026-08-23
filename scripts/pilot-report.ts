import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { summarizePilotFeedback, validatePilotFeedback } from "../src/pilot/Feedback.js";

const INPUT = process.argv[2]
  ?? process.env.SOVA_PILOT_FEEDBACK_DIRECTORY
  ?? "pilot-feedback";
const OUTPUT = process.argv[3]
  ?? process.env.SOVA_PILOT_REPORT_FILE
  ?? "pilot-data/phase-1.6-report.json";

let files: string[];
try {
  files = readdirSync(INPUT).filter((file) => file.endsWith(".json")).sort();
} catch {
  throw new Error(`Feedback directory not found: ${INPUT}`);
}
if (files.length === 0) throw new Error("No feedback JSON files found");

const feedback = files.map((file) => {
  const value = JSON.parse(readFileSync(join(INPUT, file), "utf8")) as unknown;
  return validatePilotFeedback(value);
});
const sessionIds = new Set(feedback.map((record) => record.sessionId));
if (sessionIds.size !== feedback.length) throw new Error("Duplicate sessionId across feedback files");

const summary = summarizePilotFeedback(feedback);
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(summary, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
console.log(`validated_feedback=${feedback.length}`);
console.log(`incident_count=${summary.incidentCount}`);
console.log(`output=${OUTPUT}`);
