import assert from "node:assert/strict";
import fs from "node:fs";

const shellPath = "public/corpus-map/index.html";
const mapPath = "public/paper-map/index.html";
const shell = fs.readFileSync(shellPath, "utf8");
const map = fs.readFileSync(mapPath, "utf8");

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

console.log("Corpus map mobile contract OK: compact shell, map toolbar, and bottom sheets present.");
