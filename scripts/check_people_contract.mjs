import assert from "node:assert/strict";
import fs from "node:fs";

const CSV_PATH = "public/assets/people/latest-people.csv";
const LOADER_PATH = "public/assets/people/people-loader.js";
const HOMEPAGE_PATH = "public/index.html";
const SECTIONS = ["Team", "Affiliate", "Alumni"];
const REQUIRED_HEADERS = [
  "Name",
  "Site: Public?",
  "Site: id",
  "Site: Section",
  "Site: Sort Order",
  "Site: Role",
  "Site: Discipline",
  "Site: Affiliation",
  "Site: Bio",
  "Site: headshot link",
  "Site: Link 1 Label",
  "Site: Link 1 URL",
  "Site: Link 2 Label",
  "Site: Link 2 URL",
  "Site: Link 3 Label",
  "Site: Link 3 URL",
];

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
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
  const records = rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
    );
  return { headers, records };
}

const csv = fs.readFileSync(CSV_PATH, "utf8");
const loader = fs.readFileSync(LOADER_PATH, "utf8");
const homepage = fs.readFileSync(HOMEPAGE_PATH, "utf8");
const { headers, records } = parseCsv(csv);

for (const header of REQUIRED_HEADERS) {
  assert.ok(headers.includes(header), `people CSV is missing required header: ${header}`);
}

const visible = records.filter(
  (row) =>
    row["Site: Public?"].trim().toLowerCase() === "yes" &&
    SECTIONS.includes(row["Site: Section"].trim()),
);
assert.ok(visible.length > 0, "people CSV has no public homepage rows");

const seth = visible.find((row) => row["Site: id"].trim() === "seth-lazar");
assert.ok(seth, "people CSV is missing Seth Lazar's public record");
assert.equal(
  seth["Site: Affiliation"].trim(),
  "Johns Hopkins University",
  "Seth Lazar's public affiliation must identify Johns Hopkins University only",
);
assert.match(
  seth["Site: Bio"],
  /principal investigator of MINT Lab/i,
  "Seth Lazar's public bio must identify his current MINT role",
);
assert.doesNotMatch(
  seth["Site: Bio"],
  /Australian National University|\bANU\b|founding director/i,
  "Seth Lazar's public bio contains a stale current-role claim",
);

const ids = new Set();
const counts = {};
for (const section of SECTIONS) {
  const rows = visible.filter((row) => row["Site: Section"].trim() === section);
  assert.ok(rows.length > 0, `people CSV has no visible ${section} rows`);
  counts[section] = rows.length;

  const orders = new Set();
  for (const row of rows) {
    assert.ok(row.Name.trim(), `${section} row has no Name`);
    const order = Number(row["Site: Sort Order"]);
    assert.ok(
      Number.isFinite(order) && order > 0,
      `${row.Name} has an invalid Site: Sort Order`,
    );
    assert.ok(!orders.has(order), `${section} has duplicate sort order ${order}`);
    orders.add(order);

    const id = row["Site: id"].trim();
    if (id) {
      assert.ok(!ids.has(id), `people CSV has duplicate Site: id ${id}`);
      ids.add(id);
    }
  }
}

assert.match(
  loader,
  /const CSV_URL = "\/assets\/people\/latest-people\.csv";/,
  "people loader must read the canonical CSV",
);
assert.match(homepage, /data-people-runtime/, "homepage is missing the People runtime mount");
assert.match(
  homepage,
  /\/assets\/people\/people-loader\.js/,
  "homepage is missing the People loader",
);
assert.doesNotMatch(
  homepage,
  /id="personData"/,
  "homepage still contains the old embedded People JSON",
);

console.log(
  `People contract OK: ${visible.length} public rows (${counts.Team} Team, ${counts.Affiliate} Affiliate, ${counts.Alumni} Alumni).`,
);
