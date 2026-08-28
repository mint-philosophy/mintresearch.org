import assert from 'node:assert/strict';
import fs from 'node:fs';

const wrapperPath = 'public/should-we-build-agi/index.html';
const deckPath = 'public/should-we-build-agi/deck.html';
const cssPath = 'public/should-we-build-agi/deck.css';
const deckScriptPath = 'public/should-we-build-agi/deck.js';
const pretextPath = 'public/should-we-build-agi/pretext-layout.js';

for (const path of [wrapperPath, deckPath, cssPath, deckScriptPath, pretextPath]) {
  assert.ok(fs.existsSync(path), `${path} must exist`);
}

const wrapper = fs.readFileSync(wrapperPath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const deckScript = fs.readFileSync(deckScriptPath, 'utf8');
const pretext = fs.readFileSync(pretextPath, 'utf8');
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const nav = fs.readFileSync('public/assets/mint-site-nav.v1.js', 'utf8');

for (const [name, html] of [['wrapper', wrapper], ['deck', deck]]) {
  assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">/, `${name} must be noindex`);
}

assert.equal((deck.match(/<section class="slide\b/g) || []).length, 16, 'deck must contain 16 slides');
assert.equal((deck.match(/aria-label="Slide \d+ of 16:/g) || []).length, 16, 'every slide needs an accessible label');
assert.match(deck, /What justifies overriding the presumption in favour of liberty\?/, 'first justificatory hurdle must be present');
assert.match(deck, /what justifies imposing AGI’s costs and risks on others\?/, 'second justificatory hurdle must be present');
assert.match(deck, /Against building AGI/, 'ledger must include the against column');
assert.match(deck, /For building AGI/, 'ledger must include the for column');
assert.match(css, /\.ledger-table th, \.ledger-table td \{ border-right: 2px solid var\(--rule\); \}/, 'ledger must visibly divide columns');

assert.match(pretext, /@chenglou\/pretext@0\.0\.8/, 'Pretext must use a pinned package version');
assert.match(pretext, /prepareWithSegments/, 'Pretext must use the rich preparation path');
assert.match(pretext, /layoutWithLines/, 'Pretext must perform explicit line layout');
assert.match(pretext, /document\.fonts\.ready/, 'Pretext must wait for web fonts');
assert.match(pretext, /document\.documentElement\.dataset\.pretextStatus/, 'Pretext state must use a root status attribute');
assert.doesNotMatch(pretext, /document\.documentElement\.dataset\.pretext\s*=/, 'root must not match the text-layout selector');
assert.doesNotMatch(pretext, /Pretext ·/, 'layout diagnostics must not be visible to participants');
assert.match(css, /\.pretext-state \{[\s\S]*clip: rect\(0 0 0 0\);/, 'layout status must remain visually hidden');
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.liberty-spectrum \{ min-height: 54%; grid-template-columns: 52px minmax\(0, 1fr\);/, 'the vertical liberty spectrum must survive the stacked layout');
assert.doesNotMatch(css, /\.spectrum-rail \{ display: none; \}/, 'the vertical liberty spectrum must remain visible at narrow widths');
assert.doesNotMatch(css, /\.liberty-table li:nth-child\([^)]*\)::before/, 'spectrum labels must stay on the vertical rail, not flatten into rows');
assert.equal((deck.match(/<td aria-label="Blank"><\/td>/g) || []).length, 8, 'ledger must expose eight blank cells without overflow-prone hidden text');
assert.match(deckScript, /touchstart/, 'deck must support touch navigation');
assert.match(deckScript, /ArrowRight/, 'deck must support keyboard navigation');
assert.match(css, /@media \(max-width: 900px\)/, 'deck must include tablet layout');
assert.match(css, /@media \(max-width: 600px\)/, 'deck must include phone layout');
assert.match(css, /prefers-reduced-motion/, 'deck must respect reduced motion');

assert.ok(!sitemap.includes('/should-we-build-agi/'), 'unindexed route must not enter the sitemap');
assert.ok(!nav.includes('/should-we-build-agi/'), 'unindexed route must not enter primary navigation');

console.log('Should We Build AGI microsite contract passed.');
