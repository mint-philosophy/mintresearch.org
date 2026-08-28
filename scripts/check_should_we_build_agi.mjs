import assert from 'node:assert/strict';
import fs from 'node:fs';

const wrapperPath = 'public/should-we-build-agi/index.html';
const deckPath = 'public/should-we-build-agi/deck.html';
const cssPath = 'public/should-we-build-agi/deck.css';
const deckScriptPath = 'public/should-we-build-agi/deck.js';
const pretextPath = 'public/should-we-build-agi/pretext-layout.js';
const editorPath = 'public/should-we-build-agi/inline-editor.js';

for (const path of [wrapperPath, deckPath, cssPath, deckScriptPath, pretextPath, editorPath]) {
  assert.ok(fs.existsSync(path), `${path} must exist`);
}

const wrapper = fs.readFileSync(wrapperPath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const deckScript = fs.readFileSync(deckScriptPath, 'utf8');
const pretext = fs.readFileSync(pretextPath, 'utf8');
const editor = fs.readFileSync(editorPath, 'utf8');
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
assert.match(pretext, /function inlineInsets\(style\)[\s\S]*paddingLeft[\s\S]*paddingRight[\s\S]*borderLeftWidth[\s\S]*borderRightWidth/, 'Pretext must measure the text content box rather than the padded border box');
assert.match(pretext, /getBoundingClientRect\(\)\.width - inlineInsets\(style\)/, 'Pretext line width must exclude inline padding and borders');
assert.match(pretext, /replace\(\/\[ \\t\\r\\n\\f\]\+\/g, ' '\)/, 'Pretext source normalisation must preserve non-breaking spaces');
assert.match(pretext, /document\.documentElement\.dataset\.pretextStatus/, 'Pretext state must use a root status attribute');
assert.match(pretext, /await window\.__agiEditorReady/, 'Pretext must wait until saved text overrides have been applied');
assert.match(pretext, /window\.__agiPretext = \{[\s\S]*suspend\(\)[\s\S]*resume\(\)/, 'Pretext must expose safe editing suspension and resumption');
assert.doesNotMatch(pretext, /document\.documentElement\.dataset\.pretext\s*=/, 'root must not match the text-layout selector');
assert.doesNotMatch(pretext, /Pretext ·/, 'layout diagnostics must not be visible to participants');
assert.match(css, /\.pretext-state \{[\s\S]*clip: rect\(0 0 0 0\);/, 'layout status must remain visually hidden');
assert.match(css, /@media \(max-width: 900px\) and \(orientation: portrait\)[\s\S]*\.liberty-spectrum \{ min-height: 60%; grid-template-columns: 52px minmax\(0, 1fr\);/, 'the vertical liberty spectrum must survive the portrait layout');
assert.doesNotMatch(css, /\.spectrum-rail \{ display: none; \}/, 'the vertical liberty spectrum must remain visible at narrow widths');
assert.doesNotMatch(css, /\.liberty-table li:nth-child\([^)]*\)::before/, 'spectrum labels must stay on the vertical rail, not flatten into rows');
assert.doesNotMatch(css, /@media \(max-width: 900px\) \{/, 'width alone must not force short landscape frames into tall stacked layouts');
assert.match(css, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'short landscape frames need a compact no-scroll layout');
assert.match(css, /\.liberty-table ol \{ min-height: 0; display: grid; grid-template-rows: repeat\(6, minmax\(0, 1fr\)\); \}/, 'compact liberty rows must share the available height');
assert.match(css, /\.liberty-question h2 \{ margin: 28px 0; font-size: 33px;/, 'desktop slide-11 title must use the balanced four-line measure');
assert.match(css, /@media \(max-width: 600px\) and \(orientation: portrait\)[\s\S]*\.liberty-question h2 \{ font-size: 27px; \}[\s\S]*\.liberty-table li \{ display: block; padding: 14px 12px; font-size: 15px; \}/, 'phone slide-11 title and rows must preserve readable phrase-level wrapping');
assert.match(css, /@media \(max-width: 340px\) and \(orientation: portrait\) \{[\s\S]*\.liberty-question h2 \{ font-size: 22px; \}/, 'small-phone slide-11 title must retain the four-line measure');
assert.match(deck, /prohibit building&nbsp;AGI\./, 'the final liberty row must keep building AGI together across narrow layouts');
assert.match(deck, /Human-level AGI—but not superhuman AGI\?/, 'the separate-decision slide heading must distinguish human-level from superhuman AGI');
assert.match(deck, /Yes to human-level; no to superhuman/, 'the separate-decision slide must distinguish human-level from superhuman AGI');
assert.match(deck, /Human-level AGI may be built if specified conditions are met, but superhuman AGI should not be built\./, 'the first option must use the same capability distinction as its label');
assert.doesNotMatch(deck, /Yes to AGI; no to superintelligence/, 'the separate-decision slide must not conflate AGI with human-level capability');
assert.match(deck, /<p data-pretext>How much depends on our choices\? Institutional pessimism is as corrosive of agency as technological pessimism—but it could still be justified\.<\/p>/, 'agency must be a separate paragraph that preserves the institutional-pessimism qualification');
assert.match(css, /\.section-summary p \+ p \{ margin-top: 1em; \}/, 'the separate agency paragraph must remain visibly distinct');
assert.match(deck, /<h2 data-pretext>Mapping the Reasons<\/h2>/, 'the final slide must be titled Mapping the Reasons');
assert.doesNotMatch(deck, /Technological or Institutional Pessimism or Optimism\?/, 'the final slide must not retain its superseded title');
assert.match(deck, /This is implausibly fatalistic\./, 'slide 3 must characterize inevitability as implausibly fatalistic');
assert.doesNotMatch(deck, /“AGI is inevitable” is implausibly deterministic\./, 'slide 3 must not retain the superseded deterministic wording');
assert.match(deck, /Promise must be subject to same level of rigour as peril\./, 'the final accounting must apply the same rigour to promise and peril');
assert.equal((deck.match(/data-reason-dialog="/g) || []).length, 4, 'slide 12 must offer four interactive kinds of reasons');
assert.equal((deck.match(/<dialog class="reason-dialog"/g) || []).length, 4, 'each kind of reason must have an illustrative dialog');
for (const example of ['Existential hope', 'Mass casualty event', 'Democracy', 'Prosperity', 'Justice', 'Rule of law', 'Meaning in life', 'Faith', 'Personal relationships', 'Thick concepts of flourishing']) {
  assert.ok(deck.includes(example), `reason dialogs must preserve the illustrative example: ${example}`);
}
assert.match(deckScript, /data-reason-dialog[\s\S]*showModal\(\)/, 'reason cards must open their associated dialog');
assert.match(deckScript, /reason-dialog-close[\s\S]*dialog\.close\(\)/, 'reason dialogs must expose a close control');
assert.match(deckScript, /querySelector\('\.reason-dialog\[open\]'\)/, 'slide navigation must pause while a reason dialog is open');
assert.match(css, /\.reason-dialog::backdrop/, 'reason dialogs must have a legible modal backdrop');
assert.match(deck, /id="inlineEditorToolbar" hidden/, 'the editor toolbar must remain hidden until the server authorizes the client IP');
assert.match(deck, /id="inlineEditorEdit">Edit</, 'the authorized editor must expose an Edit button');
assert.match(deck, /id="inlineEditorSave" hidden>Save</, 'the authorized editor must expose a Save button only in edit mode');
assert.match(editor, /https:\/\/agi-editor\.mintresearch\.org\/v1\/decks\/should-we-build-agi/, 'the deck must use the server-gated editor endpoint');
assert.match(editor, /contenteditable', 'plaintext-only'/, 'inline editing must accept plain text rather than HTML');
assert.match(editor, /method: 'PUT'/, 'Save must persist through the editor service');
assert.match(editor, /element\.textContent = values\[field\.key\]/, 'saved values must be applied as text, never HTML');
assert.doesNotMatch(editor, /ALLOWED_IPS|CF-Connecting-IP/, 'the client bundle must not contain or attempt to enforce the IP allowlist');
assert.doesNotMatch(editor, /element\.closest\('\[aria-hidden="true"\]'\)/, 'inactive slides must remain represented in the editable field map');
assert.match(css, /html\[data-editor-mode="editing"\] \[data-editor-key\]/, 'edit mode must visibly identify editable text');
assert.match(css, /@media \(max-width: 600px\) and \(orientation: portrait\)[\s\S]*\.ledger-table thead th:first-child \{ width: 40%; \}[\s\S]*\.ledger-table tbody th \{ padding-inline: 10px; font-size: 12px; white-space: nowrap; \}/, 'phone ledger labels must remain inside the first column divider');
assert.match(wrapper, /deck\.html\?v=20260828\.16/, 'wrapper must cache-bust the all-slide inline editor correction');
assert.match(deck, /deck\.css\?v=20260828\.10/, 'deck must cache-bust inline-editor styling');
assert.match(deck, /deck\.js\?v=20260828\.8/, 'deck must cache-bust edit-aware interactions');
assert.match(deck, /inline-editor\.js\?v=20260828\.2/, 'deck must load the all-slide inline editor');
assert.match(deck, /pretext-layout\.js\?v=20260828\.8/, 'deck must cache-bust editor-aware Pretext layout');
assert.equal((css.match(/\.ledger-table \{ min-width: 0;/g) || []).length, 2, 'ledger must fit responsive portrait and short-landscape frames without horizontal scrolling');
assert.equal((deck.match(/<td aria-label="Blank"><\/td>/g) || []).length, 8, 'ledger must expose eight blank cells without overflow-prone hidden text');
assert.match(deckScript, /touchstart/, 'deck must support touch navigation');
assert.match(
  deckScript,
  /addEventListener\('touchstart',[\s\S]*?event\.target instanceof Element && event\.target\.closest\('\.table-scroll, \.ledger-scroll, \[contenteditable="plaintext-only"\], \.inline-editor-toolbar'\)[\s\S]*?\}, \{ passive: true \}\);/,
  'touch navigation must leave scrollable tables and inline editing controls in control of their gestures',
);
assert.match(deckScript, /ArrowRight/, 'deck must support keyboard navigation');
assert.match(css, /@media \(max-width: 900px\)/, 'deck must include tablet layout');
assert.match(css, /@media \(max-width: 600px\)/, 'deck must include phone layout');
assert.match(css, /prefers-reduced-motion/, 'deck must respect reduced motion');

assert.ok(!sitemap.includes('/should-we-build-agi/'), 'unindexed route must not enter the sitemap');
assert.ok(!nav.includes('/should-we-build-agi/'), 'unindexed route must not enter primary navigation');

console.log('Should We Build AGI microsite contract passed.');
