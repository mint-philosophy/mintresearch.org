import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const bannerCss = read('public/assets/mint-banner.css');
const bannerJs = read('public/assets/mint-banner.js');
const themeCss = read('public/assets/theme.css');
const themeJs = read('public/assets/theme.js');
const sourceCss = read('src/styles/global.css');

const requiredCss = [
  'height: min(75px, 9vh)',
  'width: min(45px, 5.4vh)',
  'height: min(45px, 5.4vh)',
  'height: 36px',
  'width: 21.6px',
  'height: 21.6px',
  'height: 24px',
  'width: 14.4px',
  'height: 14.4px'
];
for (const declaration of requiredCss) {
  assert.ok(bannerCss.includes(declaration), `missing banner declaration: ${declaration}`);
}

assert.ok(themeCss.startsWith('@import url("/assets/mint-banner.css");'), 'theme.css must import the banner contract first');
assert.ok(themeJs.includes("script.src = '/assets/mint-banner.js'"), 'theme.js must load the banner contract');
assert.ok(bannerJs.includes("var colors = ['red', 'brown', 'yellow', 'green', 'teal', 'indigo', 'purple', 'cool']"), 'banner component must own all eight Minties');
assert.ok(bannerJs.includes("logo.src = assetRoot + 'mint-banner.png'"), 'banner component must own the logo source');
assert.ok(bannerJs.includes("banner.dataset.mintBannerContract = '1'"), 'banner component must mark initialized banners');
assert.ok(!bannerJs.includes('innerHTML'), 'banner component must preserve descendant nodes and listeners');

for (const declaration of [
  'width: min(45px, 5.4vh)',
  'height: min(45px, 5.4vh)',
  'width: 21.6px',
  'height: 21.6px',
  'width: 14.4px',
  'height: 14.4px'
]) {
  assert.ok(sourceCss.includes(declaration), `Astro source drift: ${declaration}`);
}

if (process.argv.includes('--check-blind-refusal')) {
  const rawRoot = 'https://raw.githubusercontent.com/mint-philosophy/b-r-minisite/main/';
  const fetchText = async (path) => {
    const response = await fetch(rawRoot + path, { cache: 'no-store' });
    assert.equal(response.status, 200, `Blind Refusal ${path} returned ${response.status}`);
    return response.text();
  };
  const [consumerHtml, consumerCss] = await Promise.all([
    fetchText('index.html'),
    fetchText('styles.css')
  ]);

  assert.ok(consumerHtml.includes('https://mintresearch.org/assets/mint-banner.css'), 'Blind Refusal must load the banner stylesheet');
  assert.ok(consumerHtml.includes('https://mintresearch.org/assets/mint-banner.js'), 'Blind Refusal must load the banner component');
  assert.ok(!consumerHtml.includes('https://mintresearch.org/assets/theme.css'), 'Blind Refusal must not load the full main-site theme');
  assert.ok(!consumerHtml.includes('https://mintresearch.org/assets/theme.js'), 'Blind Refusal must not load the full main-site theme script');

  const forbidden = {
    '.top-banner': new Set(['padding', 'height', 'min-height']),
    '.top-banner-inner': new Set(['padding', 'gap', 'flex-direction']),
    '.top-banner-logo': new Set(['height']),
    '.top-banner-minties': new Set(['gap', 'flex-wrap']),
    '.top-banner-minty': new Set(['width', 'height'])
  };
  for (const match of consumerCss.matchAll(/(\.top-banner(?:-(?:inner|logo|minties|minty))?)\s*\{([^{}]*)\}/g)) {
    const [, selector, body] = match;
    const banned = forbidden[selector];
    if (!banned) continue;
    for (const declaration of body.split(';')) {
      const property = declaration.split(':', 1)[0].trim();
      assert.ok(!banned.has(property), `Blind Refusal ${selector} must not locally own ${property}`);
    }
  }
}

console.log(`MINT banner contract passed: canonical component, eight Minties, 60% logo-height sizing${process.argv.includes('--check-blind-refusal') ? ', and Blind Refusal compatibility' : ''}.`);
