import assert from "node:assert/strict";
import fs from "node:fs";

const shellPath = "public/corpus-map/index.html";
const mapPath = "public/paper-map/index.html";
const summaryPath = "public/paper-map/output/summary.json";
const shell = fs.readFileSync(shellPath, "utf8");
const map = fs.readFileSync(mapPath, "utf8");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

for (const marker of [
  'content: "Corpus Map"',
  "height: 100dvh",
  "overflow: hidden",
  "overflow: clip",
  "position: fixed",
  "#minty-wrap",
  "height: calc(100dvh - 249px - env(safe-area-inset-bottom))",
  "min-height: 320px",
]) {
  assert.ok(shell.includes(marker), `${shellPath} missing mobile shell marker: ${marker}`);
}

for (const marker of [
  "body.is-embedded #stats-display",
  "max-height: min(72dvh, 560px)",
  "setFilterPanelOpen(false)",
  "if (usesMobileLayout) setMode('areas')",
  "window.self !== window.top && usesMobileLayout",
  "Search papers",
  "#paper-panel",
  "paper-panel-close",
  "Click-to-show info panel",
]) {
  assert.ok(map.includes(marker), `${mapPath} missing responsive map marker: ${marker}`);
}

assert.ok(!Object.hasOwn(summary.macro_categories, ""), `${summaryPath} has an empty macro category`);
assert.ok(!Object.hasOwn(summary.cluster_labels, ""), `${summaryPath} has an empty cluster label`);
assert.equal(
  summary.cluster_label_count,
  summary.label_quality.checked_labels,
  `${summaryPath} cluster label count does not match its quality audit`,
);
assert.ok(summary.year_range[0] >= 1900, `${summaryPath} includes an unknown year in its range`);

console.log("Corpus map mobile contract OK: compact shell, map toolbar, and bottom sheets present.");
