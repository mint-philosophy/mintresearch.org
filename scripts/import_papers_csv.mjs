import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ACTIVE_CSV,
  LEGACY_REQUIRED_COLUMNS,
  parseCsv,
  serializeCsv,
  validateIncomingRows,
} from "./papers_csv_utils.mjs";

const incomingPath = process.argv[2];
if (!incomingPath) {
  console.error("Usage: npm run import:papers -- <path-to-notion-export.csv>");
  process.exit(1);
}

const incomingCsvPath = path.resolve(incomingPath);
const currentRows = parseCsv(await readFile(ACTIVE_CSV, "utf8"), LEGACY_REQUIRED_COLUMNS);
const incomingRows = parseCsv(await readFile(incomingCsvPath, "utf8"));
const visibleCount = validateIncomingRows(currentRows, incomingRows);

await writeFile(ACTIVE_CSV, serializeCsv(incomingRows), "utf8");
console.log(`Imported ${incomingCsvPath} to ${ACTIVE_CSV}.`);
console.log(`Visible papers: ${visibleCount}.`);
