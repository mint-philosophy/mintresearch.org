import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";

const ACTIVE_CSV = "public/assets/papers/latest-paper-deliverables.csv";
const REQUIRED_COLUMNS = [
  "Title/Details",
  "Site: in Papers Section?",
  "Date (D/M/Y)",
  "Site: codename",
];

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missingColumns.length) {
    throw new Error(`Missing required CSV columns: ${missingColumns.join(", ")}`);
  }

  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
    );
}

function visibleRows(rows) {
  return rows.filter((row) => row["Site: in Papers Section?"].trim().toLowerCase() === "yes");
}

function paperLink(row) {
  return (row["Site: Link to Paper"] || row.Link || "").trim();
}

function approvedCodenames(rows) {
  const byTitle = new Map();
  const byLink = new Map();

  for (const row of visibleRows(rows)) {
    const title = row["Title/Details"].trim();
    const codename = row["Site: codename"].trim();
    const link = paperLink(row);

    if (title && codename) byTitle.set(title, codename);
    if (link && codename) byLink.set(link, codename);
  }

  return { byTitle, byLink };
}

function validateIncomingCsv(currentRows, incomingRows) {
  const approved = approvedCodenames(currentRows);
  const incomingVisible = visibleRows(incomingRows);
  const problems = [];
  const seenCodenames = new Map();

  for (const row of incomingVisible) {
    const title = row["Title/Details"].trim();
    const codename = row["Site: codename"].trim();
    const link = paperLink(row);

    if (!title) problems.push("A visible row is missing Title/Details.");
    if (!codename) problems.push(`Visible row is missing Site: codename: ${title || "(untitled)"}`);

    const approvedMatches = new Map();
    const approvedByTitle = approved.byTitle.get(title);
    const approvedByLink = approved.byLink.get(link);
    if (approvedByTitle) approvedMatches.set(approvedByTitle, ["title"]);
    if (approvedByLink) {
      const matchTypes = approvedMatches.get(approvedByLink) || [];
      matchTypes.push("link");
      approvedMatches.set(approvedByLink, matchTypes);
    }

    for (const [approvedCodename, matchTypes] of approvedMatches) {
      if (codename && approvedCodename !== codename) {
        problems.push(
          `${title || link}: approved codename "${approvedCodename}" matched by ${matchTypes.join("/")} changed to "${codename}"`,
        );
      }
    }

    if (codename) {
      const previousTitle = seenCodenames.get(codename);
      if (previousTitle && previousTitle !== title) {
        problems.push(`Duplicate codename "${codename}" used for "${previousTitle}" and "${title}"`);
      }
      seenCodenames.set(codename, title);
    }
  }

  if (problems.length) {
    throw new Error(`CSV import blocked:\n- ${problems.join("\n- ")}`);
  }

  return incomingVisible.length;
}

const incomingPath = process.argv[2];
if (!incomingPath) {
  console.error("Usage: npm run import:papers -- <path-to-notion-export.csv>");
  process.exit(1);
}

const incomingCsvPath = path.resolve(incomingPath);
const currentRows = parseCsv(await readFile(ACTIVE_CSV, "utf8"));
const incomingRows = parseCsv(await readFile(incomingCsvPath, "utf8"));
const visibleCount = validateIncomingCsv(currentRows, incomingRows);

await copyFile(incomingCsvPath, ACTIVE_CSV);
console.log(`Imported ${incomingCsvPath} to ${ACTIVE_CSV}.`);
console.log(`Visible papers: ${visibleCount}.`);
