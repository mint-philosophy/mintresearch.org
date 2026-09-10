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
  fellowshipHub,
  fellowshipDay1,
  fellowshipDay2,
  fellowshipDay3,
  fellowshipProjects,
  fellowshipShell,
  projectsDeck,
  projectsCss,
  projectsJs,
  projectsPretext,
  definitionsWrapper,
  definitionsDeck,
  definitionsCss,
  definitionsJs,
  definitionsPretext,
  sharedEditorJs,
  sharedEditorCss,
  legacyEditorWorker,
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
  read('agif-router-worker/site-assets/fellowship/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-1/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-2/index.html'),
  read('agif-router-worker/site-assets/fellowship/day-3/index.html'),
  read('agif-router-worker/site-assets/fellowship/projects/index.html'),
  read('agif-router-worker/site-assets/assets/fellowship-shell.js'),
  read('agif-router-worker/site-assets/projects/deck.html'),
  read('agif-router-worker/site-assets/projects/deck.css'),
  read('agif-router-worker/site-assets/projects/deck.js'),
  read('agif-router-worker/site-assets/projects/pretext-layout.js'),
  read('agif-router-worker/site-assets/fellowship/definitions/index.html'),
  read('agif-router-worker/site-assets/definitions/deck.html'),
  read('agif-router-worker/site-assets/definitions/deck.css'),
  read('agif-router-worker/site-assets/definitions/deck.js'),
  read('agif-router-worker/site-assets/definitions/pretext-layout.js'),
  read('agif-router-worker/site-assets/assets/inline-editor.js'),
  read('agif-router-worker/site-assets/assets/inline-editor.css'),
  read('agi-editor-worker/src/index.js'),
]);

assert.match(day1Wrapper, noIndex, 'Day 1 framed page must remain noindex');
assert.match(day1Deck, noIndex, 'Day 1 deck must remain noindex');
assert.match(day1Wrapper, /https:\/\/fellowship\.mintresearch\.org\/should-we-build-agi\//, 'Should We Build canonical must use its protected Fellowship route');
assert.match(day1Deck, /https:\/\/fellowship\.mintresearch\.org\/should-we-build-agi\//, 'Should We Build deck canonical must point to its protected Fellowship page');
assert.match(day1Deck, /pretext-layout\.js/, 'Day 1 must retain its Pretext layout pass');
assert.equal((day1Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 1 ticker must contain two seamless cycles');

assert.match(day2Wrapper, noIndex, 'Day 2 framed page must remain noindex');
assert.match(day2Deck, noIndex, 'Day 2 deck must remain noindex');
assert.match(day2Wrapper, /https:\/\/fellowship\.mintresearch\.org\/agi-institutions\//, 'AGI Institutions canonical must use its protected Fellowship route');
assert.match(day2Deck, /https:\/\/fellowship\.mintresearch\.org\/agi-institutions\//, 'AGI Institutions deck canonical must point to its protected Fellowship page');
assert.equal((day2Deck.match(/<section class="slide\b/g) || []).length, 35, 'Day 2 must expose all 35 Fable slides');
assert.equal((day2Deck.match(/aria-label="Slide \d+ of 35:/g) || []).length, 35, 'every Day 2 slide needs navigation metadata');
assert.doesNotMatch(
  [day2Deck, day2Css, day2Js, day2Pretext, day2Editor].join('\n'),
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close)|nav-notes/,
  'Day 2 public assets must not contain speaker-note data, controls, behavior, or styles',
);
assert.ok((day2Deck.match(/data-pretext/g) || []).length >= 170, 'Day 2 must retain its measured text fields');
assert.match(day2Deck, /pretext-layout\.js/, 'Day 2 must load its Pretext layout pass');
assert.match(day2Deck, /id="slideCounter">1 \/ 35/, 'Day 2 counter must use the real slide total');
assert.equal((day2Deck.match(/class="ticker-cycle"/g) || []).length, 2, 'Day 2 ticker must contain two seamless cycles');

assert.match(day3Wrapper, noIndex, 'Day 3 framed page must remain noindex');
assert.match(day3Deck, noIndex, 'Day 3 deck must remain noindex');
assert.match(day3Wrapper, /https:\/\/fellowship\.mintresearch\.org\/adaptation\//, 'Adaptation canonical must use its protected Fellowship route');
assert.match(day3Deck, /https:\/\/fellowship\.mintresearch\.org\/adaptation\//, 'Adaptation deck canonical must point to its protected Fellowship page');
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
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close|empty|toggle|body)|nav-notes|slide-draft|draft-body|slide-hidden|slide-inserted|data-show-hidden|plan-grid-nine|slide-reasons-four/i,
  'Day 3 public assets must not contain speaker-note or superseded draft data',
);

assert.match(fellowshipProjects, noIndex, 'Projects framed page must remain noindex');
assert.match(projectsDeck, noIndex, 'Projects deck must remain noindex');
assert.match(fellowshipProjects, /https:\/\/fellowship\.mintresearch\.org\/projects\//, 'Projects wrapper must use its protected Fellowship route');
assert.match(projectsDeck, /https:\/\/fellowship\.mintresearch\.org\/projects\//, 'Projects deck canonical must point to its protected Fellowship page');
assert.match(fellowshipProjects, /src="deck\.html\?v=[^"]+"/, 'Projects wrapper must load its versioned deck');
assert.match(projectsDeck, /href="deck\.css\?v=[^"]+"/, 'Projects deck must load its versioned CSS');
assert.match(projectsDeck, /src="deck\.js\?v=[^"]+"/, 'Projects deck must load its static navigation');
assert.match(projectsDeck, /src="pretext-layout\.js\?v=[^"]+"/, 'Projects deck must load its Pretext layout pass');
assert.equal((projectsDeck.match(/<section class="slide\b/g) || []).length, 9, 'Projects must expose all 9 source slides');
assert.equal((projectsDeck.match(/aria-label="Slide \d+ of 9:/g) || []).length, 9, 'every Projects slide needs navigation metadata');
assert.equal((projectsDeck.match(/data-sid="projects-[^"]+"/g) || []).length, 9, 'every Projects slide needs a stable source identifier');
assert.match(projectsDeck, /id="slideCounter">1 \/ 9/, 'Projects counter must use the real slide total');
assert.equal((projectsDeck.match(/class="ticker-cycle"/g) || []).length, 2, 'Projects ticker must contain two seamless cycles');
assert.doesNotMatch(
  [fellowshipProjects, projectsDeck, projectsCss, projectsJs, projectsPretext].join('\n'),
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close|empty|toggle|body)|nav-notes|ppt\/notesSlides|Seth, 24 Aug|Sources:/i,
  'Projects public assets must not contain speaker-note data, controls, or source-only notes',
);

assert.match(definitionsDeck, noIndex, 'Definitions deck must remain noindex');
assert.match(definitionsDeck, /https:\/\/fellowship\.mintresearch\.org\/definitions\//, 'Definitions canonical must use its protected Fellowship route');
assert.match(definitionsDeck, /href="deck\.css\?v=[^"]+"/, 'Definitions must load its versioned CSS');
assert.match(definitionsDeck, /src="deck\.js\?v=[^"]+"/, 'Definitions must load its static navigation');
assert.match(definitionsDeck, /src="pretext-layout\.js\?v=[^"]+"/, 'Definitions must load its Pretext layout pass');
assert.equal((definitionsDeck.match(/<section class="slide\b/g) || []).length, 7, 'Definitions must expose all 7 slides');
assert.equal((definitionsDeck.match(/aria-label="Slide \d+ of 7:/g) || []).length, 7, 'every Definitions slide needs navigation metadata');
assert.equal((definitionsDeck.match(/data-sid="df-[^"]+"/g) || []).length, 7, 'every Definitions slide needs a stable source identifier');
assert.match(definitionsDeck, /id="slideCounter">1 \/ 7/, 'Definitions counter must use the real slide total');
assert.equal((definitionsDeck.match(/class="ticker-cycle"/g) || []).length, 2, 'Definitions ticker must contain two seamless cycles');
assert.match(definitionsCss, /--blue:\s*#3558d4/i, 'Definitions must use its cobalt accent');
assert.match(day1Css, /--blue:\s*#47657a/i, 'Day 1 must use its slate-blue accent');
assert.match(definitionsCss, /height:\s*100dvh/, 'Definitions must account for mobile browser chrome');
assert.match(definitionsCss, /@media \(max-width: 900px\) and \(orientation: portrait\)/, 'Definitions must have readable portrait layouts');
assert.match(definitionsCss, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'Definitions must have short-landscape layouts');
assert.match(definitionsCss, /prefers-reduced-motion/, 'Definitions must respect reduced motion');
assert.match(definitionsCss, /\.slide\s*\{[^}]*overflow:\s*auto/s, 'Definitions must allow fallback scrolling');
assert.match(definitionsCss, /\.ticker-track\s*\{[^}]*flex:\s*0 0 auto/s, 'Definitions ticker track must retain its two-cycle width');
assert.match(definitionsCss, /\.ticker-cycle\s*\{[^}]*min-width:\s*100vw/s, 'Definitions ticker cycles must cover the viewport');
assert.match(definitionsPretext, /@chenglou\/pretext@0\.0\.8/, 'Definitions must pin the same Pretext release as the other decks');
assert.match(definitionsPretext, /prepareWithSegments/, 'Definitions must prepare measured text');
assert.match(definitionsPretext, /layoutWithLines/, 'Definitions must lay out measured lines');
for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(definitionsJs.includes(token), `Definitions navigation must include ${token}`);
}
assert.doesNotMatch(
  [definitionsWrapper, definitionsDeck, definitionsCss, definitionsJs, definitionsPretext].join('\n'),
  /speaker-notes|Speaker notes|notes(?:Drawer|Body|Toggle|Close)|notes-(?:drawer|close|empty|toggle|body)|nav-notes|ppt\/notesSlides/i,
  'Definitions served assets must not contain private notes',
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

for (const [label, css] of [['Day 1', day1Css], ['Day 2', day2Css], ['Day 3', day3Css], ['Projects', projectsCss], ['Definitions', definitionsCss]]) {
  assert.match(css, /\.ticker-track\s*\{[^}]*animation:\s*none;/s, `${label} ticker must remain stationary`);
  assert.match(css, /\.ticker\s*\{[^}]*overflow-x:\s*auto;/s, `${label} ticker labels must remain manually reachable`);
  assert.match(css, /\.ticker-cycle\[aria-hidden="true"\]\s*\{\s*display:\s*none;/, `${label} duplicate ticker cycle must stay hidden`);
}
assert.match(day3Css, /\.ticker-track\s*\{[^}]*flex:\s*0 0 auto/s, 'Day 3 ticker track must not shrink below the two-cycle width');
assert.match(day3Css, /\.ticker-cycle\s*\{[^}]*min-width:\s*100vw/s, 'Day 3 ticker cycles must each cover the viewport');
assert.match(projectsCss, /\.ticker-track\s*\{[^}]*flex:\s*0 0 auto/s, 'Projects ticker track must not shrink below the two-cycle width');
assert.match(projectsCss, /\.ticker-cycle\s*\{[^}]*min-width:\s*100vw/s, 'Projects ticker cycles must each cover the viewport');
assert.match(projectsCss, /--blue:\s*#2f6b4f/, 'Projects must use its forest-green accent');
assert.doesNotMatch(projectsCss, /--blue:\s*(?:#2456a6|#74445b|#a8432a)/, 'Projects accent must differ from the three day decks');

assert.match(day2Pretext, /@chenglou\/pretext@0\.0\.8/, 'Day 2 must pin the same Pretext release as Day 1');
assert.match(day2Pretext, /prepareWithSegments/, 'Day 2 must prepare measured text');
assert.match(day2Pretext, /layoutWithLines/, 'Day 2 must lay out measured lines');
assert.match(day3Pretext, /@chenglou\/pretext@0\.0\.8/, 'Day 3 must pin the same Pretext release as Days 1 and 2');
assert.match(day3Pretext, /prepareWithSegments/, 'Day 3 must prepare measured text');
assert.match(day3Pretext, /layoutWithLines/, 'Day 3 must lay out measured lines');
assert.match(projectsPretext, /@chenglou\/pretext@0\.0\.8/, 'Projects must pin the same Pretext release as the day decks');
assert.match(projectsPretext, /prepareWithSegments/, 'Projects must prepare measured text');
assert.match(projectsPretext, /layoutWithLines/, 'Projects must lay out measured lines');
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
assert.match(projectsCss, /height:\s*100dvh/, 'Projects must account for mobile browser chrome');
assert.match(projectsCss, /@media \(max-width: 900px\) and \(orientation: portrait\)/, 'Projects must have readable portrait layouts');
assert.match(projectsCss, /@media \(max-height: 600px\) and \(orientation: landscape\)/, 'Projects must have short-landscape layouts');
assert.match(projectsCss, /prefers-reduced-motion/, 'Projects must respect reduced motion');
assert.match(projectsCss, /\.slide\s*\{[^}]*overflow:\s*auto/s, 'Projects slides must allow readable fallback scrolling');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(day2Js.includes(token), `Day 2 navigation must include ${token}`);
}
assert.match(day2Js, /closest\('\.table-scroll, \.ledger-scroll/, 'Day 2 swipe navigation must not claim table gestures');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(day3Js.includes(token), `Day 3 static navigation must include ${token}`);
}
assert.match(day3Js, /closest\('\.table-scroll, \.ledger-scroll/, 'Day 3 swipe navigation must not claim table gestures');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', '#slide-']) {
  assert.ok(projectsJs.includes(token), `Projects static navigation must include ${token}`);
}
assert.match(projectsJs, /closest\('\.table-scroll, \.ledger-scroll/, 'Projects swipe navigation must not claim nested scrolling gestures');

const fellowshipRoutes = [
  ['agif1.mintresearch.org', '/should-we-build-agi/', '/should-we-build-agi/'],
  ['agif2.mintresearch.org', '/agi-institutions/', '/agi-institutions/'],
  ['agif3.mintresearch.org', '/societal-adaptation/', '/adaptation/'],
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

assert.ok(fellowshipHub.includes('href="/projects/"'), 'Projects must be reachable from the public Fellowship hub');
assert.ok(fellowshipShell.includes("{ id: 'projects', label: '9.9 — Projects', href: '/projects/' }"), 'Projects must appear in the dated Fellowship slide navigation');
assert.match(router, /id: 'projects', path: '\/projects'/, 'the Worker must gate and serve the Projects route');
assert.ok(fellowshipHub.includes('href="/definitions/"'), 'Definitions must be reachable from the Fellowship hub');
assert.ok(fellowshipShell.includes("{ id: 'definitions', label: '9.8 — Definitions', href: '/definitions/' }"), 'Definitions must appear in dated Fellowship slide navigation');
assert.match(router, /id: 'definitions', path: '\/definitions'/, 'the Worker must gate and serve Definitions');
assert.ok(!nav.includes('/definitions/'), 'Definitions must remain outside main-site navigation');
assert.ok(!sitemap.includes('/definitions/'), 'Definitions must remain outside the main-site sitemap');

for (const [label, canonical, wrapper] of [
  ['Definitions', 'definitions', definitionsWrapper],
  ['Projects', 'projects', fellowshipProjects],
  ['Should We Build', 'should-we-build-agi', fellowshipDay1],
  ['AGI Institutions', 'agi-institutions', fellowshipDay2],
  ['Adaptation', 'adaptation', fellowshipDay3],
]) {
  assert.match(wrapper, noIndex, `${label} Fellowship wrapper must remain noindex`);
  assert.match(wrapper, new RegExp(`https://fellowship\\.mintresearch\\.org/${canonical}/`), `${label} wrapper must use the Fellowship canonical URL`);
  assert.match(wrapper, /\/assets\/fellowship-shell\.js\?v=/, `${label} wrapper must load the Fellowship navigation shell`);
  assert.match(wrapper, /src="deck\.html\?v=/, `${label} wrapper must frame its native deck`);
}

assert.match(fellowshipHub, /<link rel="canonical" href="https:\/\/fellowship\.mintresearch\.org\/">/, 'the public Fellowship hub must be canonical on its own host');
assert.doesNotMatch(fellowshipHub, noIndex, 'the public Fellowship hub must remain indexable');
assert.match(fellowshipHub, /aria-label="Fellowship navigation"/, 'the public Fellowship hub must expose its own navigation');
assert.match(fellowshipShell, /aria-label="Fellowship navigation"/, 'the slide shell must expose Fellowship navigation');
assert.match(fellowshipShell, /presentation-mode/, 'the Fellowship slide shell must preserve the expand and restore control');
assert.match(legacyHub, /https:\/\/fellowship\.mintresearch\.org\//, 'the old main-site hub must point to the new canonical host');
assert.equal(existsSync('public/fellowship'), false, 'the protected Fellowship tree must not be published by GitHub Pages');
assert.equal(existsSync('public/projects'), false, 'Projects must not be published by GitHub Pages');
assert.equal(existsSync('public/definitions'), false, 'Definitions must not be published by GitHub Pages');
for (const [path, destination] of [
  ['public/should-we-build-agi/deck.html', 'should-we-build-agi'],
  ['public/agi-institutions/deck.html', 'agi-institutions'],
  ['public/societal-adaptation/deck.html', 'adaptation'],
]) {
  const legacyDeck = await read(path);
  assert.match(legacyDeck, new RegExp(`https://fellowship\\.mintresearch\\.org/${destination}/`), `${path} must redirect to its protected route`);
  assert.doesNotMatch(legacyDeck, /<section class="slide\b/, `${path} must not retain presentation content`);
}
assert.ok(nav.includes("href: 'https://fellowship.mintresearch.org/'"), 'the main-site Fellowship branch must link to the new public hub');
const resourcesStart = nav.indexOf("id: 'resources'");
const resourcesEnd = nav.indexOf('\n    },', resourcesStart);
const resourcesBlock = nav.slice(resourcesStart, resourcesEnd);
assert.ok(resourcesBlock.includes("href: 'https://fellowship.mintresearch.org/'"), 'the Fellowship link must live inside Resources');
assert.ok(!nav.includes("id: 'fellowship'"), 'the old top-level Fellowship group must be removed');
assert.ok(!sitemap.includes('<loc>https://mintresearch.org/agif/</loc>'), 'the superseded main-site hub must leave the main-site sitemap');
assert.ok(routerConfig.includes('pattern = "fellowship.mintresearch.org"'), 'the Worker must own the Fellowship custom domain');
assert.match(routerConfig, /directory = "\.\/site-assets"/, 'the Worker must serve the isolated Fellowship asset tree');
assert.match(routerConfig, /run_worker_first = true/, 'the password gate must run before static assets');
assert.match(routerConfig, /binding = "CONTENT_OVERRIDES"/, 'the Fellowship Worker must bind the text-override store');
for (const day of ['8', '9', '10', '11', '14']) {
  assert.ok(router.includes(`FELLOWSHIP_PASSWORD_SEPTEMBER_${day}`), `September ${day} must use its own Worker secret`);
}
assert.match(router, /ALLOWED_IPS/, 'the IP bypass must be read only from a Worker secret');
assert.match(router, /HttpOnly; Secure; SameSite=Strict/, 'the Fellowship session cookie must use secure attributes');
assert.match(router, /X-Robots-Tag/, 'protected presentation routes must add an HTTP noindex directive');
assert.doesNotMatch(router, /test-only-password|Minty-[A-Za-z0-9_-]{12,}/, 'the production Worker source must not contain a password');

const [philosophy, philosophyCss, philosophyLayouts, philosophyJs, philosophyPretext, philosophyWrapper] = await Promise.all([
  'philosophy/deck.html', 'philosophy/deck.css', 'philosophy/philosophy.css',
  'philosophy/deck.js', 'philosophy/pretext-layout.js', 'fellowship/philosophy/index.html',
].map(path => read(`agif-router-worker/site-assets/${path}`)));
assert.match(philosophy, noIndex);
assert.match(philosophyWrapper, noIndex);
assert.match(philosophyWrapper, /data-fellowship-day="philosophy"/);
assert.match(philosophyWrapper, /src="\/philosophy\/deck\.html\?v=/);
const philosophyFrame = philosophyWrapper.match(/id="presentationFrame"[^>]*src="([^"]+)"/)[1];
for (const route of ['/philosophy', '/philosophy/', '/philosophy/index.html']) {
  assert.equal(new URL(philosophyFrame, `https://fellowship.mintresearch.org${route}`).pathname, '/philosophy/deck.html');
}
assert.match(philosophy, /https:\/\/fellowship\.mintresearch\.org\/philosophy\//);
assert.equal((philosophy.match(/<section class="slide\b/g) || []).length, 5);
assert.equal((philosophy.match(/aria-label="Slide \d+ of 5:/g) || []).length, 5);
assert.equal((philosophy.match(/data-sid="philosophy-[^"]+"/g) || []).length, 5);
assert.equal((philosophy.match(/class="ticker-cycle"/g) || []).length, 2);
assert.match(philosophy, /id="slideCounter">1 \/ 5/);
for (const required of [
  'What philosophy can contribute', 'AI-targeted Policy', 'Our approach to justified power',
  'Building a methodology for vulnerability scanning', 'Updating our normative theories',
  'AGI will change both the contents and grounds of our mutual obligations.',
  'could expand to “alignment and control”', '<h4>What</h4>', '<h4>Who</h4>', '<h4>How</h4>',
]) assert.ok(philosophy.includes(required), `Philosophy must preserve source text: ${required}`);
assert.doesNotMatch(philosophy, /speaker.?notes|ppt\/notesSlides|inspection_notes|source\.pptx|\/Volumes\//i);
assert.match(philosophyCss, /--blue:\s*#856018/);
assert.match(philosophyCss, /--pale-blue:\s*#f3e8ca/);
assert.match(philosophyCss, /height:\s*100dvh/);
assert.match(philosophyCss, /\.slide\s*\{[^}]*overflow:\s*auto/s);
assert.match(philosophyLayouts, /writing-mode:\s*vertical-rl/);
assert.match(philosophyLayouts, /@media \(max-width: 900px\) and \(orientation: portrait\)/);
assert.match(philosophyPretext, /@chenglou\/pretext@0\.0\.8/);
assert.match(philosophyPretext, /prepareWithSegments/);
assert.match(philosophyPretext, /layoutWithLines/);
for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'hashchange', '__philosophyDeck']) assert.ok(philosophyJs.includes(token));
assert.ok(fellowshipHub.includes('href="/philosophy/"'));
assert.ok(fellowshipShell.includes("{ id: 'philosophy', label: '9.9 — Philosophy', href: '/philosophy/' }"));
assert.match(fellowshipHub, /class="agif-link" data-presentation="philosophy" href="\/philosophy\/">\s*<span class="agif-day">9\.9<\/span>/);
assert.match(fellowshipHub, /class="agif-link" data-presentation="projects" href="\/projects\/">\s*<span class="agif-day">9\.9<\/span>/);
assert.ok(fellowshipHub.indexOf('data-presentation="philosophy"') < fellowshipHub.indexOf('data-presentation="projects"'), 'the earlier 9.9 Philosophy session must precede Projects');
assert.ok(fellowshipShell.indexOf("id: 'philosophy'") < fellowshipShell.indexOf("id: 'projects'"));
assert.match(router, /id: 'philosophy', path: '\/philosophy'/);
for (const marker of ['9.8 — Definitions', '9.9 — Philosophy', '9.9 — Projects', '9.10 — Should We Build AGI?', '9.11 — AGI Institutions', '9.14 — Adaptation']) {
  assert.ok(fellowshipShell.includes(marker), `Fellowship navigation must include ${marker}`);
}
assert.equal(existsSync('public/philosophy'), false, 'Philosophy must not be published by GitHub Pages');

for (const [id, deck, navigation, pretext] of [
  ['definitions', definitionsDeck, definitionsJs, definitionsPretext],
  ['philosophy', philosophy, philosophyJs, philosophyPretext],
  ['projects', projectsDeck, projectsJs, projectsPretext],
  ['should-we-build-agi', day1Deck, await read('agif-router-worker/site-assets/should-we-build-agi/deck.js'), await read('agif-router-worker/site-assets/should-we-build-agi/pretext-layout.js')],
  ['agi-institutions', day2Deck, day2Js, day2Pretext],
  ['adaptation', day3Deck, day3Js, day3Pretext],
]) {
  assert.match(deck, new RegExp(`data-editor-deck="${id}"`), `${id} must identify its editor store`);
  assert.match(deck, /href="\/assets\/inline-editor\.css\?v=/, `${id} must load the shared editor styles`);
  assert.match(deck, /src="\/assets\/inline-editor\.js\?v=/, `${id} must load the same-origin editor`);
  for (const control of ['inlineEditorToolbar', 'inlineEditorEdit', 'inlineEditorSave', 'inlineEditorCancel', 'inlineEditorHide', 'inlineEditorReveal']) {
    assert.ok(deck.includes(`id="${control}"`), `${id} must provide ${control}`);
  }
  assert.match(pretext, /await window\.__agiEditorReady/, `${id} must apply saved text before measuring line layout`);
  assert.match(navigation, /dataset\.editorMode === 'editing'/, `${id} must suspend slide navigation while editing`);
}

assert.match(sharedEditorJs, /`\/editor\/v1\/decks\/\$\{deckId\}`/, 'the browser editor must use the Fellowship same-origin endpoint');
assert.match(sharedEditorJs, /credentials: 'same-origin'/, 'editor reads and saves must retain the dated access session');
assert.match(sharedEditorJs, /textContent = values\[field\.key\]/, 'saved overrides must be rendered as plain text');
assert.doesNotMatch(sharedEditorJs, /https?:\/\/|innerHTML/, 'the shared editor must not transmit to another origin or render saved HTML');
assert.match(sharedEditorCss, /html\[data-editor-mode="editing"\] \[data-editor-key\]/, 'editing must visibly identify editable text');
assert.match(router, /EDITOR_PATH_PREFIX = '\/editor\/v1\/decks\/'/, 'the Fellowship Worker must own the editor endpoint');
assert.match(router, /request\.headers\.get\('Origin'\) !== EDITOR_ORIGIN/, 'saves must require the exact Fellowship origin');
assert.match(router, /await editorSessionIsValid\(request, env\)/, 'saves must require the private owner session');
assert.match(router, /OWNER_LOGIN_LIMITER/, 'network-independent owner login must be rate limited');
assert.match(router, /MAX_EDITOR_FIELDS = 384/, 'editor payloads must retain a bounded field count above the largest deck');
assert.match(legacyEditorWorker, /legacy editor endpoint is read-only/, 'the retired cross-origin editor must reject writes');
assert.doesNotMatch(legacyEditorWorker, /CONTENT_OVERRIDES\.put/, 'the retired editor must have no remaining storage write path');

console.log('AGI Fellowship presentation contract OK: six dated, isolated, noindex Pretext decks (7/5/9/16/35/8 slides), five day-specific password gates, timed public release, private owner-session editing, and content-free redirects from retired routes.');
