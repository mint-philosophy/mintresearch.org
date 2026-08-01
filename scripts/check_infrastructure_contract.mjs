import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const guidePath = path.join(root, "public", "guide", "index.html");
const notFoundPath = path.join(root, "public", "404.html");
const snapshotPath = path.join(
  root,
  "public",
  "assets",
  "minty",
  "infra-snapshot.json",
);
const activeAstroRoutes = [
  path.join(root, "src", "pages", "guide.astro"),
  path.join(root, "src", "pages", "404.astro"),
];
const corpusIngestServices = [
  "corpus-intake-local",
  "corpus-intake-slack",
  "corpus-ingest-handoff",
  "corpus-analyze",
  "corpus-db-writer",
  "corpus-tidy",
];

const errors = [];
let snapshot;
for (const route of activeAstroRoutes) {
  if (fs.existsSync(route)) {
    errors.push(`${path.relative(root, route)} must be archived; the route is static`);
  }
}
for (const required of [guidePath, notFoundPath, snapshotPath]) {
  if (!fs.existsSync(required)) {
    errors.push(`Missing required static artifact: ${path.relative(root, required)}`);
  }
}

if (fs.existsSync(snapshotPath)) {
  const snapshotText = fs.readFileSync(snapshotPath, "utf8");
  snapshot = JSON.parse(snapshotText);
  const requiredValues = [
    ["schemaVersion", snapshot.schemaVersion === 1],
    ["generatedAt", snapshot.generatedAt],
    ["fleet.services", snapshot.fleet?.services?.length],
    ["models.daemonDefault", snapshot.models?.daemonDefault],
    ["corpus.paperCount", snapshot.corpus?.paperCount],
    ["newsletter.enabledSubscribers", snapshot.newsletter?.enabledSubscribers],
    ["github.repositoryCount", snapshot.github?.repositoryCount],
  ];
  for (const [name, value] of requiredValues) {
    if (!value) errors.push(`Infrastructure snapshot is missing ${name}`);
  }

  if (
    JSON.stringify(snapshot.architecture?.corpusIngest) !==
    JSON.stringify(corpusIngestServices)
  ) {
    errors.push("Infrastructure snapshot has the wrong corpus-ingestion topology");
  }

  const serviceNames = snapshot.fleet?.services?.map((service) => service.name) ?? [];
  if (new Set(serviceNames).size !== serviceNames.length) {
    errors.push("Infrastructure snapshot contains duplicate service names");
  }

  const sensitivePatterns = [
    ["absolute workspace path", /\/Volumes\/|\/Users\//],
    ["loopback endpoint", /127\.0\.0\.1|localhost/i],
    ["email address", /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/],
    ["credential material", /api[_ -]?key|access[_ -]?token|client[_ -]?secret/i],
  ];
  for (const [name, pattern] of sensitivePatterns) {
    if (pattern.test(snapshotText)) {
      errors.push(`Infrastructure snapshot contains ${name}`);
    }
  }
}

if (fs.existsSync(guidePath)) {
  const guide = fs.readFileSync(guidePath, "utf8");
  for (const required of [
    "/assets/infra-guide.js",
    'id="infraDaemonInventory"',
    'class="infra-byline"',
    "Written by <strong>Minty</strong>",
    'data-infra-field="fleet.loadedTotal"',
    'data-infra-field="models.daemonDefault"',
    "BirdClaw",
    "AT Protocol",
    "Gmail API",
    "Weekly Source Digest",
    "<code>corpus-agent</code>",
  ]) {
    if (!guide.includes(required)) {
      errors.push(`Static guide is missing contract marker: ${required}`);
    }
  }

  const stalePatterns = [
    ["retired weekly digest", /Minty(?:&#39;|&apos;|')s Week in AI/i],
    ["retired live state", /sessions\.db \(SQLite\)|RECENT\.md \(Dynamic\)/i],
    ["obsolete model", /GPT-5\.2|gpt-5\.3-codex-spark/i],
    ["obsolete Ghost host", /Ghost CMS powering mintresearch\.org/i],
    ["generic source rollup", /RSS, arXiv, newsletters, social feeds/i],
    [
      "retired daily-briefing pipeline",
      /where the daily briefing and paper intake\s+services can use them/i,
    ],
  ];
  for (const [name, pattern] of stalePatterns) {
    if (pattern.test(guide)) errors.push(`Static guide still contains ${name}`);
  }

  if (snapshot) {
    const fields = [
      ...guide.matchAll(/data-infra-field="([^"]+)"/g),
    ].map((match) => match[1]);
    for (const field of new Set(fields)) {
      const value = field
        .split(".")
        .reduce((current, key) => current?.[key], snapshot);
      if (value == null || value === "") {
        errors.push(`Static guide references missing snapshot field: ${field}`);
      }
    }
  }
}

if (fs.existsSync(notFoundPath)) {
  const notFound = fs.readFileSync(notFoundPath, "utf8");
  for (const required of [
    "<title>404 — Not Found</title>",
    "/assets/mint-site-nav.v1.js",
    "/assets/mint-banner.js",
    'class="four-oh-four-num"',
  ]) {
    if (!notFound.includes(required)) {
      errors.push(`Static 404 is missing contract marker: ${required}`);
    }
  }
}

for (const pagePath of [guidePath, notFoundPath]) {
  if (!fs.existsSync(pagePath)) continue;
  const page = fs.readFileSync(pagePath, "utf8");
  const assets = [...page.matchAll(/(?:href|src)="(\/_astro\/[^"]+)"/g)].map(
    (match) => match[1],
  );
  for (const asset of new Set(assets)) {
    const publicAsset = path.join(root, "public", asset.slice(1));
    if (!fs.existsSync(publicAsset)) {
      errors.push(
        `${path.relative(root, pagePath)} references non-static asset: ${asset}`,
      );
    }
  }
}

if (errors.length) {
  console.error("Infrastructure contract check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Infrastructure contract check passed.");
