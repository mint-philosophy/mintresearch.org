import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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
  day3Wrapper,
  day3Deck,
  day3Css,
  day3Js,
  day3Pretext,
  router,
  routerConfig,
  nav,
  sitemap,
  legacyHub,
  editorConfig,
  fellowshipHub,
  fellowshipDay1,
  fellowshipDay2,
  fellowshipDay3,
  fellowshipShell,
] = await Promise.all([
  read('public/should-we-build-agi/index.html'),
  read('agif-router-worker/site-assets/should-we-build-agi/deck.html'),
  read('agif-router-worker/site-assets/should-we-build-agi/deck.css'),
  read('public/agi-institutions/index.html'),
  read('agif-router-worker/site-assets/agi-institutions/deck.html'),
  read('agif-router-worker/site-assets/agi-institutions/deck.css'),
  read('agif-router-worker/site-assets/agi-institutions/deck.js'),
  read('agif-router-worker/site-assets/agi-institutions/pretext-layout.js'),
  read('agif-router-worker/site-assets/agi-institutions/inline-editor.js'),
  read('public/societal-adaptation/index.html'),
  read('agif-router-worker/site-assets/societal-adaptation/deck.html'),
  read('agif-router-worker/site-assets/societal-adaptation/deck.css'),
  read('agif-router-worker/site-assets/societal-adaptation/deck.js'),
  read('agif-router-worker/site-assets/societal-adaptation/pretext-layout.js'),
  read('agif-router-worker/src/index.js'),
  read('agif-router-worker/wrangler.toml'),
  read('public/assets/mint-site-nav.v1.js'),
  read('public/sitemap.xml'),
  read('public/agif/index.html'),
  read('agi-editor-worker/wrangler.toml'),
  read('agif-router-worker/site-assets/fellowship/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-1/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-2/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-3/index.html'),
  read('agif-router-worker/site-assets/assets/fellowship-shell.js'),
]);

assert.match(day1Wrapper, noIndex, 'Day 1 framed page must remain noindex');
assert.match(day1Deck, noIndex, 'Day 1 deck must remain noindex');
assert.match(day1Wrapper, /https:\/\/fellowship\.mintresearch\.org\/day-1\//, 'Day 1 canonical must use its protected Fellowship route');
assert.match(day1Deck, /https:\/\/fellowship\.mintresearch\.org\/day-1\//, 'Day 1 deck canonical must point to its protected Fellowship page');
assert.match(day1Deck, /pretext-layout\.js/, 'Day 1 must retain its Pretext layout pass');
assert.match(editorConfig, /https:\/\/fellowship\.mintresearch\.org/, 'Day 1 editor must allow the canonical Fellowship origin');
assert.equal((day1Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 1 ticker must contain two seamless cycles');

assert.match(day2Wrapper, noIndex, 'Day 2 framed page must remain noindex');
assert.match(day2Deck, noIndex, 'Day 2 deck must remain noindex');
assert.match(day2Wrapper, /https:\/\/fellowship\.mintresearch\.org\/day-2\//, 'Day 2 canonical must use its protected Fellowship route');
assert.match(day2Deck, /https:\/\/fellowship\.mintresearch\.org\/day-2\//, 'Day 2 deck canonical must point to its protected Fellowship page');
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

assert.match(day3Wrapper, noIndex, 'Day 3 framed page must remain noindex');
assert.match(day3Deck, noIndex, 'Day 3 deck must remain noindex');
assert.match(day3Wrapper, /https:\/\/fellowship\.mintresearch\.org\/day-3\//, 'Day 3 canonical must use its protected Fellowship route');
assert.match(day3Deck, /https:\/\/fellowship\.mintresearch\.org\/day-3\//, 'Day 3 deck canonical must point to its protected Fellowship page');
assert.match(fellowshipDay3, /src="deck\.html\?v=[^"]+"/, 'Day 3 wrapper must load its versioned deck');
assert.match(day3Deck, /href="deck\.css\?v=[^"]+"/, 'Day 3 deck must load its versioned CSS');
assert.match(day3Deck, /src="deck\.js\?v=[^"]+"/, 'Day 3 deck must load its static navigation');
assert.match(day3Deck, /src="pretext-layout\.js\?v=[^"]+"/, 'Day 3 deck must load its Pretext layout pass');
assert.equal((day3Deck.match(/<section class="slide\b/g) || []).length, 8, 'Day 3 must expose all 8 source slides');
assert.equal((day3Deck.match(/aria-label="Slide \d+ of 8:/g) || []).length, 8, 'every Day 3 slide needs navigation metadata');
assert.equal((day3Deck.match(/data-sid="d3-[^"]+"/g) || []).length, 8, 'every Day 3 slide needs a stable source identifier');
assert.match(day3Deck, /id="slideCounter">1 \/ 8/, 'Day 3 counter must use the real slide total');
assert.equal((day3Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 3 ticker must contain two seamless cycles');
assert.doesNotMatch(
  [fellowshipDay3, day3Deck, day3Css, day3Js, day3Pretext].join('\n'),
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close|empty|toggle|body)|nav-notes|inline-editor|artifact-editor|editorMode|__agiEditor|data-editor|slide-draft|draft-body|slide-hidden|slide-inserted|data-show-hidden|plan-grid-nine|slide-reasons-four/i,
  'Day 3 public assets must not contain speaker-note data or editor payload',
);

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

for (const [label, css] of [['Day 1', day1Css], ['Day 2', day2Css], ['Day 3', day3Css]]) {
  assert.match(css, /animation:\s*ticker 42s linear infinite;/, `${label} ticker must scroll continuously`);
  assert.match(css, /to\s*\{\s*transform:\s*translateX\(-50%\)/, `${label} ticker must loop over one cycle`);
  assert.doesNotMatch(css, /infinite alternate/, `${label} ticker must not reverse direction`);
}
assert.match(day3Css, /\.ticker-track\s*\{[^}]*flex:\s*0 0 auto/s, 'Day 3 ticker track must not shrink below the two-cycle width');
assert.match(day3Css, /\.ticker-cycle\s*\{[^}]*min-width:\s*100vw/s, 'Day 3 ticker cycles must each cover the viewport');

assert.match(day2Pretext, /@chenglou\/pretext@0\.0\.8/, 'Day 2 must pin the same Pretext release as Day 1');
assert.match(day2Pretext, /prepareWithSegments/, 'Day 2 must prepare measured text');
assert.match(day2Pretext, /layoutWithLines/, 'Day 2 must lay out measured lines');
assert.match(day3Pretext, /@chenglou\/pretext@0\.0\.8/, 'Day 3 must pin the same Pretext release as Days 1 and 2');
assert.match(day3Pretext, /prepareWithSegments/, 'Day 3 must prepare measured text');
assert.match(day3Pretext, /layoutWithLines/, 'Day 3 must lay out measured lines');
assert.match(day2Css, /height:\s*100dvh/, 'Day 2 must account for mobile browser chrome');
assert.match(day2Css, /@media \(max-width: 900px\) and \(orientation: portrait\)/, 'Day 2 must have readable portrait layouts');
assert.match(day2Css, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'Day 2 must have short-landscape layouts');
assert.match(day2Css, /prefers-reduced-motion/, 'Day 2 must respect reduced motion');
assert.match(day2Css, /\.table-scroll[^}]*overflow:\s*auto/s, 'Day 2 tables must remain independently scrollable');
assert.match(day2Css, /\.ledger-scroll[^}]*overflow:\s*auto/s, 'Day 2 ledger must remain independently scrollable');
assert.match(day3Css, /height:\s*100dvh/, 'Day 3 must account for mobile browser chrome');
assert.match(day3Css, /@media \(max-width: 900px\) and \(orientation: portrait\)/, 'Day 3 must have readable portrait layouts');
assert.match(day3Css, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'Day 3 must have short-landscape layouts');
assert.match(day3Css, /prefers-reduced-motion/, 'Day 3 must respect reduced motion');
assert.match(day3Css, /\.slide\s*\{[^}]*overflow:\s*auto/s, 'Day 3 slides must allow readable fallback scrolling');
assert.match(day3Css, /\.table-scroll[^}]*overflow:\s*auto/s, 'Day 3 tables must remain independently scrollable');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(day2Js.includes(token), `Day 2 navigation must include ${token}`);
}
assert.match(day2Js, /closest\('\.table-scroll, \.ledger-scroll/, 'Day 2 swipe navigation must not claim table gestures');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(day3Js.includes(token), `Day 3 static navigation must include ${token}`);
}
assert.match(day3Js, /closest\('\.table-scroll, \.ledger-scroll/, 'Day 3 swipe navigation must not claim table gestures');

const fellowshipRoutes = [
  ['agif1.mintresearch.org', '/should-we-build-agi/', '/day-1/'],
  ['agif2.mintresearch.org', '/agi-institutions/', '/day-2/'],
  ['agif3.mintresearch.org', '/societal-adaptation/', '/day-3/'],
];

for (const [host, oldRoute, protectedRoute] of fellowshipRoutes) {
  assert.ok(router.includes(`'${host}'`), `router must recognize ${host}`);
  assert.ok(routerConfig.includes(`pattern = "${host}"`), `Worker must own ${host}`);
  assert.ok(fellowshipHub.includes(`href="${protectedRoute}"`), `${protectedRoute} must be reachable from the public Fellowship hub`);
  assert.ok(!nav.includes(oldRoute), `${oldRoute} must remain outside site navigation`);
  assert.ok(!sitemap.includes(`<loc>https://mintresearch.org${oldRoute}</loc>`), `${oldRoute} must remain outside the main-site sitemap`);
  assert.ok(!nav.includes(host), `${host} must not appear in site navigation`);
  assert.ok(!sitemap.includes(host), `${host} must remain outside the sitemap`);
}

for (const [day, wrapper] of [['day-1', fellowshipDay1], ['day-2', fellowshipDay2], ['day-3', fellowshipDay3]]) {
  assert.match(wrapper, noIndex, `${day} Fellowship wrapper must remain noindex`);
  assert.match(wrapper, new RegExp(`https://fellowship\\.mintresearch\\.org/${day}/`), `${day} wrapper must use the Fellowship canonical URL`);
  assert.match(wrapper, /\/assets\/fellowship-shell\.js\?v=/, `${day} wrapper must load the Fellowship navigation shell`);
  assert.match(wrapper, /src="deck\.html\?v=/, `${day} wrapper must frame its native deck`);
}

assert.match(fellowshipHub, /<link rel="canonical" href="https:\/\/fellowship\.mintresearch\.org\/">/, 'the public Fellowship hub must be canonical on its own host');
assert.doesNotMatch(fellowshipHub, noIndex, 'the public Fellowship hub must remain indexable');
assert.match(fellowshipHub, /aria-label="Fellowship navigation"/, 'the public Fellowship hub must expose its own navigation');
assert.match(fellowshipShell, /aria-label="Fellowship navigation"/, 'the slide shell must expose Fellowship navigation');
assert.match(fellowshipShell, /presentation-mode/, 'the Fellowship slide shell must preserve the expand and restore control');
assert.match(legacyHub, /https:\/\/fellowship\.mintresearch\.org\//, 'the old main-site hub must point to the new canonical host');
assert.equal(existsSync('public/fellowship'), false, 'the protected Fellowship tree must not be published by GitHub Pages');
for (const [path, destination] of [
  ['public/should-we-build-agi/deck.html', 'day-1'],
  ['public/agi-institutions/deck.html', 'day-2'],
  ['public/societal-adaptation/deck.html', 'day-3'],
]) {
  const legacyDeck = await read(path);
  assert.match(legacyDeck, new RegExp(`https://fellowship\\.mintresearch\\.org/${destination}/`), `${path} must redirect to its protected route`);
  assert.doesNotMatch(legacyDeck, /<section class="slide\b/, `${path} must not retain presentation content`);
}
assert.ok(nav.includes("href: 'https://fellowship.mintresearch.org/'"), 'the main-site Fellowship branch must link to the new public hub');
assert.ok(!sitemap.includes('<loc>https://mintresearch.org/agif/</loc>'), 'the superseded main-site hub must leave the main-site sitemap');
assert.ok(routerConfig.includes('pattern = "fellowship.mintresearch.org"'), 'the Worker must own the Fellowship custom domain');
assert.match(routerConfig, /directory = "\.\/site-assets"/, 'the Worker must serve the isolated Fellowship asset tree');
assert.match(routerConfig, /run_worker_first = true/, 'the password gate must run before static assets');
assert.match(router, /FELLOWSHIP_PASSWORD/, 'the Fellowship password must be read only from a Worker secret');
assert.match(router, /ALLOWED_IPS/, 'the IP bypass must be read only from a Worker secret');
assert.match(router, /HttpOnly; Secure; SameSite=Strict/, 'the Fellowship session cookie must use secure attributes');
assert.match(router, /X-Robots-Tag/, 'protected presentation routes must add an HTTP noindex directive');
assert.doesNotMatch(router, /test-only-password|Minty-[A-Za-z0-9_-]{12,}/, 'the production Worker source must not contain a password');

console.log('AGI Fellowship presentation contract OK: open dedicated hub, three isolated password-gated noindex Pretext decks (17/35/8 slides), IP bypass, and content-free redirects from the retired Pages routes.');
