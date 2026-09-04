import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const noIndex = /noindex, nofollow, noarchive, nosnippet, noimageindex/;

const [
  day1Wrapper,
  day1Deck,
  day1Css,
  day2Wrapper,
  day2Deck,
  day2Css,
  day2Js,
  day2Pretext,
  day2Editor,
  router,
  routerConfig,
  nav,
  sitemap,
  editorConfig,
] = await Promise.all([
  read('public/should-we-build-agi/index.html'),
  read('public/should-we-build-agi/deck.html'),
  read('public/should-we-build-agi/deck.css'),
  read('public/agi-institutions/index.html'),
  read('public/agi-institutions/deck.html'),
  read('public/agi-institutions/deck.css'),
  read('public/agi-institutions/deck.js'),
  read('public/agi-institutions/pretext-layout.js'),
  read('public/agi-institutions/inline-editor.js'),
  read('agif-router-worker/src/index.js'),
  read('agif-router-worker/wrangler.toml'),
  read('public/assets/mint-site-nav.v1.js'),
  read('public/sitemap.xml'),
  read('agi-editor-worker/wrangler.toml'),
]);

assert.match(day1Wrapper, noIndex, 'Day 1 wrapper must remain noindex');
assert.match(day1Deck, noIndex, 'Day 1 deck must remain noindex');
assert.match(day1Wrapper, /https:\/\/agif1\.mintresearch\.org\//, 'Day 1 canonical must use agif1');
assert.match(day1Deck, /https:\/\/agif1\.mintresearch\.org\//, 'Day 1 standalone deck must use agif1');
assert.match(day1Deck, /pretext-layout\.js/, 'Day 1 must retain its Pretext layout pass');
assert.match(editorConfig, /https:\/\/agif1\.mintresearch\.org/, 'Day 1 editor must allow the canonical origin');
assert.equal((day1Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 1 ticker must contain two seamless cycles');

assert.match(day2Wrapper, noIndex, 'Day 2 wrapper must remain noindex');
assert.match(day2Deck, noIndex, 'Day 2 deck must remain noindex');
assert.match(day2Wrapper, /https:\/\/agif2\.mintresearch\.org\//, 'Day 2 wrapper canonical must use agif2');
assert.match(day2Deck, /https:\/\/agif2\.mintresearch\.org\//, 'Day 2 standalone canonical must use agif2');
assert.equal((day2Deck.match(/<section class="slide\b/g) || []).length, 35, 'Day 2 must expose all 35 Fable slides');
assert.equal((day2Deck.match(/aria-label="Slide \d+ of 35:/g) || []).length, 35, 'every Day 2 slide needs navigation metadata');
assert.doesNotMatch(
  [day2Deck, day2Css, day2Js, day2Pretext, day2Editor].join('\n'),
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close)|nav-notes/,
  'Day 2 public assets must not contain speaker-note data, controls, behavior, or styles',
);
assert.ok((day2Deck.match(/data-pretext/g) || []).length >= 170, 'Day 2 must retain its measured text fields');
assert.match(day2Deck, /pretext-layout\.js/, 'Day 2 must load its Pretext layout pass');
assert.doesNotMatch(day2Deck, /<script[^>]+inline-editor\.js/, 'Day 2 must not call the unregistered editor endpoint');
assert.match(day2Deck, /id="slideCounter">1 \/ 35/, 'Day 2 counter must use the real slide total');
assert.equal((day2Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 2 ticker must contain two seamless cycles');

function slideMarkup(deck, slideNumber, total) {
  const marker = `aria-label="Slide ${slideNumber} of ${total}:`;
  const markerIndex = deck.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Slide ${slideNumber} must exist`);
  const start = deck.lastIndexOf('<section class="slide', markerIndex);
  const next = deck.indexOf('\n    <section class="slide', markerIndex);
  return deck.slice(start, next === -1 ? deck.length : next);
}

for (const slideNumber of [7, 18, 31]) {
  const slide = slideMarkup(day2Deck, slideNumber, 35);
  assert.equal((slide.match(/class="section-index\b/g) || []).length, 1, `Day 2 slide ${slideNumber} must show its section label only on the left`);
}

const day2Slide7 = slideMarkup(day2Deck, 7, 35);
assert.match(day2Slide7, /class="slide slide-single"/, 'Day 2 slide 7 must use the full-width single-panel layout');
assert.equal((day2Slide7.match(/class="split-panel\b/g) || []).length, 1, 'Day 2 slide 7 must contain only its left panel');
assert.doesNotMatch(day2Slide7, /ecological metaphor|invasive species/i, 'Day 2 slide 7 must not retain the following-day metaphor');

for (const [label, css] of [['Day 1', day1Css], ['Day 2', day2Css]]) {
  assert.match(css, /animation:\s*ticker 42s linear infinite;/, `${label} ticker must scroll continuously`);
  assert.match(css, /to\s*\{\s*transform:\s*translateX\(-50%\)/, `${label} ticker must loop over one cycle`);
  assert.doesNotMatch(css, /infinite alternate/, `${label} ticker must not reverse direction`);
}

assert.match(day2Pretext, /@chenglou\/pretext@0\.0\.8/, 'Day 2 must pin the same Pretext release as Day 1');
assert.match(day2Pretext, /prepareWithSegments/, 'Day 2 must prepare measured text');
assert.match(day2Pretext, /layoutWithLines/, 'Day 2 must lay out measured lines');
assert.match(day2Css, /height:\s*100dvh/, 'Day 2 must account for mobile browser chrome');
assert.match(day2Css, /@media \(max-width: 900px\) and \(orientation: portrait\)/, 'Day 2 must have readable portrait layouts');
assert.match(day2Css, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'Day 2 must have short-landscape layouts');
assert.match(day2Css, /prefers-reduced-motion/, 'Day 2 must respect reduced motion');
assert.match(day2Css, /\.table-scroll[^}]*overflow:\s*auto/s, 'Day 2 tables must remain independently scrollable');
assert.match(day2Css, /\.ledger-scroll[^}]*overflow:\s*auto/s, 'Day 2 ledger must remain independently scrollable');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(day2Js.includes(token), `Day 2 navigation must include ${token}`);
}
assert.match(day2Js, /closest\('\.table-scroll, \.ledger-scroll/, 'Day 2 swipe navigation must not claim table gestures');

for (const host of ['agif1.mintresearch.org', 'agif2.mintresearch.org']) {
  assert.ok(router.includes(`'${host}'`), `router must recognize ${host}`);
  assert.ok(routerConfig.includes(`pattern = "${host}"`), `Worker must own ${host}`);
  assert.ok(!nav.includes(host), `${host} must remain outside site navigation`);
  assert.ok(!sitemap.includes(host), `${host} must remain outside the sitemap`);
}
assert.match(router, /X-Robots-Tag/, 'router must add an HTTP noindex directive');
assert.match(router, /request\.method !== 'GET'.*request\.method !== 'HEAD'/s, 'router must reject write methods');
assert.match(router, /\/agi-institutions\/deck\.html/, 'agif2 root must serve the native Day 2 deck');

for (const route of ['/agi-institutions/', '/should-we-build-agi/']) {
  assert.ok(!nav.includes(route), `${route} must remain outside site navigation`);
  assert.ok(!sitemap.includes(route), `${route} must remain outside the sitemap`);
}

console.log('AGI Fellowship presentation contract OK: two native Pretext decks, 17 Day 1 slides, 35 Day 2 slides, canonical subdomains, and noindex at page and edge.');
