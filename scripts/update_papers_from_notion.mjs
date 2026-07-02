import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  ACTIVE_CSV,
  LEGACY_REQUIRED_COLUMNS,
  PAPER_COLUMNS,
  compareRows,
  parseCsv,
  rowLabel,
  serializeCsv,
  validateIncomingRows,
  visibleRows,
} from "./papers_csv_utils.mjs";

const ENV_PATH = ".env";
const NOTION_VERSION = "2026-03-11";
const NOTION_BASE_URL = process.env.NOTION_API_BASE_URL || "https://api.notion.com/v1";
const REQUEST_SPACING_MS = Number(process.env.NOTION_REQUEST_SPACING_MS || "350");
const MAX_RATE_LIMIT_RETRIES = 5;

let lastRequestAt = 0;

function usageError(message) {
  console.error(message);
  process.exit(1);
}

async function loadEnv() {
  let text = "";
  try {
    text = await readFile(ENV_PATH, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    // No .env — fall back to process.env below (daemon / CI usage).
  }

  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) continue;
    const key = trimmed.slice(0, equalsAt).trim();
    let value = trimmed.slice(equalsAt + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  // Process environment fills anything the .env file does not define, so
  // daemons and CI can inject credentials without a file on disk.
  for (const key of ["NOTION_API_KEY", "NOTION_PAPERS_VIEW_ID"]) {
    if (!env[key] && process.env[key]) env[key] = process.env[key];
  }

  const missing = ["NOTION_API_KEY", "NOTION_PAPERS_VIEW_ID"].filter((key) => !env[key]);
  if (missing.length) {
    usageError(
      [
        `Missing required value${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
        "",
        "Provide them in .env or as environment variables, or use the CSV fallback documented in README.md:",
        'npm.cmd run import:papers -- "C:\\path\\to\\notion-export.csv"',
      ].join("\n"),
    );
  }

  return env;
}

async function notionRequest({ method = "GET", path, body, token }) {
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    await waitForRequestSlot();
    const response = await fetch(`${NOTION_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") || "1");
      const waitMs = Math.max(1, retryAfter) * 1000;
      console.warn(`Notion rate limit reached. Waiting ${Math.round(waitMs / 1000)}s before retrying.`);
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      const detail = await response.text();
      const hint =
        response.status === 401 || response.status === 403 || response.status === 404
          ? "\nCheck NOTION_API_KEY, NOTION_PAPERS_VIEW_ID, and whether the integration has access to the original Notion database/view."
          : "";
      throw new Error(`Notion request failed (${response.status}) for ${method} ${path}.${hint}\n${detail}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  throw new Error("Notion rate limit retry budget exhausted.");
}

async function waitForRequestSlot() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < REQUEST_SPACING_MS) await sleep(REQUEST_SPACING_MS - elapsed);
  lastRequestAt = Date.now();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchNotionRows({ token, viewId }) {
  let queryId = "";
  try {
    const query = await notionRequest({
      method: "POST",
      path: `/views/${encodeURIComponent(viewId)}/queries`,
      body: { page_size: 100 },
      token,
    });
    queryId = query.id;
    if (!queryId) throw new Error("Notion did not return a view query id.");

    const pageIds = query.results.map((page) => page.id).filter(Boolean);
    let cursor = query.has_more ? query.next_cursor : null;
    while (cursor) {
      const params = new URLSearchParams({ page_size: "100" });
      params.set("start_cursor", cursor);
      const results = await notionRequest({
        path: `/views/${encodeURIComponent(viewId)}/queries/${encodeURIComponent(queryId)}?${params}`,
        token,
      });
      pageIds.push(...results.results.map((page) => page.id).filter(Boolean));
      cursor = results.has_more ? results.next_cursor : null;
    }

    const rows = [];
    for (const [index, pageId] of pageIds.entries()) {
      process.stdout.write(`Fetching Notion page ${index + 1}/${pageIds.length}\r`);
      const page = await notionRequest({
        path: `/pages/${encodeURIComponent(pageId)}`,
        token,
      });
      rows.push(pageToCsvRow(page));
    }
    if (pageIds.length) process.stdout.write("\n");

    return rows;
  } finally {
    if (queryId) {
      await notionRequest({
        method: "DELETE",
        path: `/views/${encodeURIComponent(viewId)}/queries/${encodeURIComponent(queryId)}`,
        token,
      }).catch((error) => {
        console.warn(`Could not delete temporary Notion query: ${error.message}`);
      });
    }
  }
}

function pageToCsvRow(page) {
  const properties = page.properties || {};
  return Object.fromEntries(
    PAPER_COLUMNS.map((column) => [column, propertyToCsvValue(properties[column])]),
  );
}

function propertyToCsvValue(property) {
  if (!property) return "";

  switch (property.type) {
    case "title":
      return richTextToPlain(property.title);
    case "rich_text":
      return richTextToPlain(property.rich_text);
    case "url":
      return property.url || "";
    case "select":
      return property.select?.name || "";
    case "status":
      return property.status?.name || "";
    case "checkbox":
      return property.checkbox ? "Yes" : "No";
    case "date":
      return dateToCsv(property.date?.start);
    case "multi_select":
      return property.multi_select?.map((item) => item.name).join(", ") || "";
    case "people":
      return property.people?.map((person) => person.name || person.id).join(", ") || "";
    case "formula":
      return formulaToCsvValue(property.formula);
    case "number":
      return property.number == null ? "" : String(property.number);
    case "email":
      return property.email || "";
    case "phone_number":
      return property.phone_number || "";
    default:
      return "";
  }
}

function formulaToCsvValue(formula) {
  if (!formula) return "";
  switch (formula.type) {
    case "string":
      return formula.string || "";
    case "number":
      return formula.number == null ? "" : String(formula.number);
    case "boolean":
      return formula.boolean ? "Yes" : "No";
    case "date":
      return dateToCsv(formula.date?.start);
    default:
      return "";
  }
}

function richTextToPlain(values = []) {
  return values.map((value) => value.plain_text || "").join("");
}

function dateToCsv(value) {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function printChanges(diff) {
  for (const [label, rows] of [
    ["Added", diff.added],
    ["Removed", diff.removed],
  ]) {
    console.log(`${label}: ${rows.length}`);
    for (const row of rows) console.log(`- ${rowLabel(row)}`);
  }

  console.log(`Changed: ${diff.changed.length}`);
  for (const change of diff.changed) {
    console.log(`- ${rowLabel(change.row)} (changed: ${change.fields.join(", ")})`);
  }
}

async function confirmUpdate() {
  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question("Update the site CSV with these Notion rows? (y/n) ")).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

async function main() {
  const autoYes = process.argv.includes("--yes");
  const maxRemovalsArg = process.argv.find((arg) => arg.startsWith("--max-removals="));
  const maxRemovals = maxRemovalsArg ? Number(maxRemovalsArg.split("=")[1]) : 3;

  const env = await loadEnv();
  const currentRows = parseCsv(await readFile(ACTIVE_CSV, "utf8"), LEGACY_REQUIRED_COLUMNS);
  const notionRows = await fetchNotionRows({
    token: env.NOTION_API_KEY,
    viewId: env.NOTION_PAPERS_VIEW_ID,
  });
  const visibleCount = validateIncomingRows(currentRows, notionRows);
  const diff = compareRows(currentRows, notionRows);
  const changeCount = diff.added.length + diff.removed.length + diff.changed.length;

  console.log(`Fetched Notion rows: ${notionRows.length}`);
  console.log(`Visible papers after update: ${visibleCount}`);
  printChanges(diff);

  if (!changeCount) {
    console.log("No CSV updates found.");
    return;
  }

  if (autoYes) {
    // Unattended mode: refuse suspicious updates rather than asking.
    // A collapsed Notion view or auth hiccup must never wipe the live CSV.
    if (!notionRows.length || !visibleCount) {
      usageError("Refusing unattended update: Notion returned no rows / no visible papers.");
    }
    if (notionRows.length < Math.floor(currentRows.length / 2)) {
      usageError(
        `Refusing unattended update: Notion returned ${notionRows.length} rows ` +
          `but the CSV has ${currentRows.length}. Run interactively to confirm.`,
      );
    }
    if (diff.removed.length > maxRemovals) {
      usageError(
        `Refusing unattended update: ${diff.removed.length} rows would be removed ` +
          `(limit ${maxRemovals}). Run interactively to confirm, or raise --max-removals=N.`,
      );
    }
  } else if (!(await confirmUpdate())) {
    console.log("Cancelled. The site CSV was not changed.");
    return;
  }

  await writeFile(ACTIVE_CSV, serializeCsv(notionRows), "utf8");
  console.log(`Updated ${ACTIVE_CSV}.`);
  console.log(`Visible papers: ${visibleRows(notionRows).length}.`);
}

try {
  await main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
