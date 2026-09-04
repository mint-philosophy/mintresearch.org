import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const noIndex = /noindex, nofollow, noarchive, nosnippet, noimageindex/;

const [day1Wrapper, day1Deck, day2, day2Css, day2Js, router, routerConfig, nav, sitemap, editorConfig] = await Promise.all([
  read('public/should-we-build-agi/index.html'),
  read('public/should-we-build-agi/deck.html'),
  read('public/agif2/index.html'),
  read('public/agif2/deck.css'),
  read('public/agif2/deck.js'),
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

assert.match(day2, noIndex, 'Day 2 must be noindex');
assert.match(day2, /https:\/\/agif2\.mintresearch\.org\//, 'Day 2 canonical must use agif2');
assert.equal((day2.match(/<section class="slide(?: active)?"/g) || []).length, 34, 'Day 2 must expose all 34 saved slides');
assert.equal((day2.match(/aria-label="Slide \d+ of 34:/g) || []).length, 34, 'every Day 2 slide needs navigation metadata');
assert.equal((day2.match(/width="2560" height="1440"/g) || []).length, 34, 'Day 2 renders must keep the source 16:9 canvas');
assert.match(day2, /e1422c6fbc018bf72e18fe959303066fe177e976b1439dba3f1916b1e6d3b624/, 'Day 2 must record its PowerPoint source hash');

const images = (await readdir('public/agif2/slides')).filter((name) => /^slide-\d+\.png$/.test(name));
assert.equal(images.length, 34, 'Day 2 must ship one render per saved slide');
for (const image of images) {
  const bytes = await readFile(`public/agif2/slides/${image}`);
  assert.ok(bytes.length > 8, `${image} must not be empty`);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${image} must be a PNG`);
  assert.equal(bytes.readUInt32BE(16), 2560, `${image} must be 2560px wide`);
  assert.equal(bytes.readUInt32BE(20), 1440, `${image} must be 1440px high`);
}

assert.match(day2Css, /height:\s*100dvh/, 'Day 2 must account for mobile browser chrome');
assert.match(day2Css, /object-fit:\s*contain/, 'Day 2 slides must preserve the source canvas at every viewport');
assert.match(day2Css, /@media \(max-width: 760px\)/, 'Day 2 must have phone controls');
assert.match(day2Css, /@media \(max-height: 480px\).*orientation: landscape/s, 'Day 2 must have short-landscape controls');
assert.match(day2Css, /prefers-reduced-motion/, 'Day 2 must respect reduced motion');

for (const token of ['ArrowRight', 'ArrowLeft', 'touchstart', 'touchend', 'requestFullscreen', '#slide-']) {
  assert.ok(day2Js.includes(token), `Day 2 navigation must include ${token}`);
}
assert.match(day2Js, /data-src/, 'Day 2 must lazy-load neighbouring slide renders');

for (const host of ['agif1.mintresearch.org', 'agif2.mintresearch.org']) {
  assert.ok(router.includes(`'${host}'`), `router must recognize ${host}`);
  assert.ok(routerConfig.includes(`pattern = "${host}"`), `Worker must own ${host}`);
  assert.ok(!nav.includes(host), `${host} must remain outside site navigation`);
  assert.ok(!sitemap.includes(host), `${host} must remain outside the sitemap`);
}
assert.match(router, /X-Robots-Tag/, 'router must add an HTTP noindex directive');
assert.match(router, /request\.method !== 'GET'.*request\.method !== 'HEAD'/s, 'router must reject write methods');

for (const route of ['/agif2/', '/should-we-build-agi/']) {
  assert.ok(!nav.includes(route), `${route} must remain outside site navigation`);
  assert.ok(!sitemap.includes(route), `${route} must remain outside the sitemap`);
}

console.log('AGI Fellowship presentation contract OK: Day 1 + 34-slide Day 2, canonical subdomains, responsive controls, and noindex at page and edge.');
