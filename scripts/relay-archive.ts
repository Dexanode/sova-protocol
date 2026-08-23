import { existsSync, mkdirSync, renameSync } from "node:fs";

const files = [
  "issuer-data/pending-request.json",
  "issuer-data/pending-disclosure.json",
  "issuer-data/signed-request.json",
] as const;
const existing = files.filter((file) => existsSync(file));
if (existing.length === 0) {
  console.log("archived_files=0");
} else {
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const directory = `issuer-data/archive/${stamp}`;
  mkdirSync(directory, { recursive: true });
  for (const file of existing) {
    const name = file.slice(file.lastIndexOf("/") + 1);
    renameSync(file, `${directory}/${name}`);
  }
  console.log(`archived_files=${existing.length}`);
  console.log(`archive=${directory}`);
}
