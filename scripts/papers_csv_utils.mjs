export const ACTIVE_CSV = "public/assets/papers/latest-paper-deliverables.csv";

export const PAPER_COLUMNS = [
  "Title/Details",
  "Site: in Papers Section?",
  "Site: Public?",
  "Date (D/M/Y)",
  "Venue",
  "Link",
  "Site: Link to Paper",
  "Site: Link to Github",
  "Site: Alt Source",
  "Abstract",
  "Site: Blurb",
  "Site: Link to Blog Post",
  "Site: List of Authors",
  "Site: Venue",
  "Site: codename",
  "Status",
];

export const REQUIRED_COLUMNS = [
  "Title/Details",
  "Site: in Papers Section?",
  "Site: Public?",
  "Date (D/M/Y)",
  "Site: codename",
];

export const LEGACY_REQUIRED_COLUMNS = REQUIRED_COLUMNS.filter(
  (column) => column !== "Site: Public?",
);

export function parseCsv(text, requiredColumns = REQUIRED_COLUMNS) {
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
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column));
  if (missingColumns.length) {
    throw new Error(`Missing required CSV columns: ${missingColumns.join(", ")}`);
  }

  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
    );
}

export function serializeCsv(rows, columns = PAPER_COLUMNS) {
  return `${columns.map(escapeCsvField).join(",")}\n${rows
    .map((row) => columns.map((column) => escapeCsvField(row[column] || "")).join(","))
    .join("\n")}\n`;
}

function escapeCsvField(value) {
  const normalized = String(value ?? "");
  if (/[",\r\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function isYes(value) {
  return String(value || "").trim().toLowerCase() === "yes";
}

export function visibleRows(rows) {
  return rows.filter(
    (row) =>
      isYes(row["Site: in Papers Section?"]) &&
      (!("Site: Public?" in row) || isYes(row["Site: Public?"])),
  );
}

export function paperLink(row) {
  return (row["Site: Link to Paper"] || row.Link || "").trim();
}

export function rowLabel(row) {
  const codename = row["Site: codename"]?.trim() || "(no codename)";
  const title = row["Title/Details"]?.trim() || "(untitled)";
  return `${codename} — ${title}`;
}

export function rowMatchKey(row) {
  const codename = row["Site: codename"]?.trim();
  if (codename) return `codename:${codename}`;

  const title = row["Title/Details"]?.trim();
  const link = paperLink(row);
  if (title && link) return `title-link:${title}\n${link}`;
  if (title) return `title:${title}`;
  if (link) return `link:${link}`;
  return "";
}

export function approvedCodenames(rows) {
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

export function validateIncomingRows(currentRows, incomingRows) {
  const approved = approvedCodenames(currentRows);
  const incomingVisible = visibleRows(incomingRows);
  const problems = [];
  const seenCodenames = new Map();

  for (const row of incomingVisible) {
    const title = row["Title/Details"].trim();
    const codename = row["Site: codename"].trim();
    const link = paperLink(row);

    if (!title) problems.push("A visible row is missing Title/Details.");

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

export function compareRows(currentRows, incomingRows) {
  const currentIndex = indexRows(currentRows);
  const added = [];
  const removed = [];
  const changed = [];
  const matchedCurrent = new Set();

  for (const incoming of incomingRows) {
    const current = findMatchingRow(incoming, currentIndex);
    if (!current) {
      added.push(incoming);
      continue;
    }

    matchedCurrent.add(current);
    const fields = changedFields(current, incoming);
    if (fields.length) changed.push({ row: incoming, fields });
  }

  for (const current of currentRows) {
    if (!matchedCurrent.has(current)) removed.push(current);
  }

  return { added, removed, changed };
}

function indexRows(rows) {
  const byCodename = new Map();
  const byTitleLink = new Map();
  const byTitle = new Map();
  const byLink = new Map();

  for (const row of rows) {
    const codename = row["Site: codename"]?.trim();
    const title = row["Title/Details"]?.trim();
    const link = paperLink(row);

    if (codename) byCodename.set(codename, row);
    if (title && link) byTitleLink.set(`${title}\n${link}`, row);
    if (title) byTitle.set(title, row);
    if (link) byLink.set(link, row);
  }

  return { byCodename, byTitleLink, byTitle, byLink };
}

function findMatchingRow(row, index) {
  const codename = row["Site: codename"]?.trim();
  const title = row["Title/Details"]?.trim();
  const link = paperLink(row);

  if (codename && index.byCodename.has(codename)) return index.byCodename.get(codename);
  if (title && link && index.byTitleLink.has(`${title}\n${link}`)) {
    return index.byTitleLink.get(`${title}\n${link}`);
  }
  if (title && index.byTitle.has(title)) return index.byTitle.get(title);
  if (link && index.byLink.has(link)) return index.byLink.get(link);
  return null;
}

function changedFields(current, incoming) {
  return PAPER_COLUMNS.filter(
    (column) => normalizeFieldValue(column, current[column]) !== normalizeFieldValue(column, incoming[column]),
  );
}

function normalizeFieldValue(column, value) {
  const normalized = String(value || "").trim();
  if (column === "Date (D/M/Y)") return normalizeDateValue(normalized);
  if (isPlaceholderLink(normalized)) return "";
  return normalized;
}

function normalizeDateValue(value) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return value;
  const [, day, month, year] = match;
  return `${Number(day)}/${Number(month)}/${year}`;
}

function isPlaceholderLink(value) {
  const normalized = value.toLowerCase();
  return normalized === "no github" || normalized === "no post yet";
}
