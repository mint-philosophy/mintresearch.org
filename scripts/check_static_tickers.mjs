import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const decks = ['definitions', 'philosophy', 'projects', 'should-we-build-agi', 'agi-institutions', 'societal-adaptation'];
const files = decks.map((deck) => `agif-router-worker/site-assets/${deck}/deck.css`);
for (const file of files) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  assert.match(source, /\.ticker-track\s*\{[^}]*animation:\s*none;/s, `${file}: no automatic motion`);
  assert.doesNotMatch(source, /animation:\s*(?:scroll-)?ticker\b/, `${file}: no active ticker animation`);
  assert.match(source, /\.ticker\s*\{[^}]*overflow-x:\s*auto;/s, `${file}: manual horizontal scrolling`);
  assert.match(source, /\.ticker\s*\{[^}]*overflow-y:\s*hidden;/s, `${file}: preserve strip height`);
  assert.match(source, /\.ticker-cycle\[aria-hidden="true"\]\s*\{\s*display:\s*none;/, `${file}: hide duplicate cycle`);
}
console.log('Static chyron contract passed: all six Fellowship decks, manual overflow access, duplicate suppression.');
