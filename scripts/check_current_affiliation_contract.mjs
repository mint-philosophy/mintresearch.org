import assert from "node:assert/strict";
import fs from "node:fs";

const ACTIVE_FILES = [
  "public/404.html",
  "public/agent-reports/index.html",
  "public/corpus-map/index.html",
  "public/data-dash/index.html",
  "public/guide/index.html",
  "public/index.html",
  "public/newsletter/index.html",
  "src/data/people.ts",
  "src/layouts/BaseLayout.astro",
  "src/pages-archive/index-original.astro",
  "src/pages/RTS/guide.astro",
];

const STALE_CURRENT_ROLE_PATTERNS = [
  /Johns Hopkins and ANU/i,
  /Johns Hopkins University and ANU/i,
  /Professor at Johns Hopkins University School of Government and Policy and the Australian National University/i,
  /He is also Professor of Philosophy at the/i,
  /founding director of MINT Lab/i,
  /seth\.lazar@anu\.edu\.au/i,
];

for (const path of ACTIVE_FILES) {
  const content = fs.readFileSync(path, "utf8");
  for (const pattern of STALE_CURRENT_ROLE_PATTERNS) {
    assert.ok(
      !pattern.test(content),
      `${path} contains stale current-affiliation text: ${pattern}`,
    );
  }
}

const homepage = fs.readFileSync("public/index.html", "utf8");
assert.match(
  homepage,
  /The Machine Intelligence and Normative Theory Lab, Johns Hopkins University/,
  "homepage hero must identify Johns Hopkins University",
);
assert.match(
  homepage,
  /is Professor at the <span class="t-cyan">Johns Hopkins University School of Government and Policy<\/span> and principal investigator of MINT Lab/,
  "homepage bio must state Seth Lazar's current JHU and MINT roles",
);

const guide = fs.readFileSync("public/guide/index.html", "utf8");
assert.match(
  guide,
  /Machine Intelligence &amp; Normative Theory - Johns Hopkins\s+University/,
  "infrastructure guide footer must identify Johns Hopkins University",
);

const cvData = JSON.parse(fs.readFileSync("src/data/cv.json", "utf8"));
const employment = cvData.sections.find((section) => section.id === "employment");
const anuProfessorRole = employment?.entries?.find(
  (item) => item.text === "Professor. School of Philosophy, RSSS, ANU",
);
assert.equal(
  anuProfessorRole?.years,
  "2020-26",
  "archived CV data must show that Seth Lazar's ANU professorship ended in 2026",
);

console.log("Current-affiliation contract OK: public surfaces identify Seth with JHU, not ANU.");
