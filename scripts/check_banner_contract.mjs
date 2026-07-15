import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const bannerCss = read('public/assets/mint-banner.css');
const bannerJs = read('public/assets/mint-banner.js');
const themeCss = read('public/assets/theme.css');
const themeJs = read('public/assets/theme.js');

const firstRuleBody = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = bannerCss.match(new RegExp(`${escaped}\\s*\\{([^{}]*)\\}`));
  assert.ok(match, `missing banner selector: ${selector}`);
  return match[1];
};

const requireInRule = (selector, declarations) => {
  const body = firstRuleBody(selector);
  for (const declaration of declarations) {
    assert.ok(body.includes(declaration), `${selector} must own ${declaration}`);
  }
};

for (const declaration of [
  'height: min(75px, 9vh)',
  'width: min(45px, 5.4vh)',
  'height: min(45px, 5.4vh)',
  'height: 36px',
  'width: 21.6px',
  'height: 21.6px',
  'height: 24px',
  'width: 14.4px',
  'height: 14.4px'
]) {
  assert.ok(bannerCss.includes(declaration), `missing banner declaration: ${declaration}`);
}

requireInRule('.top-banner', [
  'box-sizing: border-box',
  'display: flex',
  'min-width: 0'
]);
assert.ok(!/(?:^|\s)width\s*:/.test(firstRuleBody('.top-banner')), 'host placement must determine the outer banner width');
requireInRule('.top-banner-inner', [
  'box-sizing: border-box',
  'display: flex',
  'flex-wrap: wrap',
  'width: 100%',
  'min-width: 0',
  'max-width: 100%'
]);
requireInRule('.top-banner-minties', [
  'display: flex',
  'flex-wrap: wrap',
  'min-width: 0',
  'max-width: 100%'
]);

assert.ok(!themeCss.includes('mint-banner.css'), 'theme.css must not duplicate the explicitly loaded banner contract');
assert.ok(!themeJs.includes('mint-banner.js'), 'theme.js must not duplicate the explicitly loaded banner contract');
assert.ok(bannerJs.includes("var colors = Object.freeze(['red', 'brown', 'yellow', 'green', 'teal', 'indigo', 'purple', 'cool'])"), 'banner component must own all eight Minties');
assert.ok(bannerJs.includes("logo.src = assetRoot + 'mint-banner.png'"), 'banner component must own the logo source');
assert.ok(bannerJs.includes("banner.setAttribute('data-mint-banner-contract', '1')"), 'banner component must mark initialized banners');
assert.ok(bannerJs.includes('mount: mount'), 'banner component must expose a mount API for empty external mounts');
assert.ok(bannerJs.includes("document.createElement('div')"), 'banner component must create missing structure');
assert.ok(bannerJs.includes("'--banner-h'"), 'banner component must publish the measured document banner height');
assert.ok(!bannerJs.includes('innerHTML'), 'banner component must preserve fallback nodes and listeners');

// Reproduce the 901x1200 desktop case that previously clipped in consumers
// with a 240px sidebar. Each flex-wrapped row must fit the content box.
const png = fs.readFileSync('public/assets/mint-banner.png');
const logoRatio = png.readUInt32BE(16) / png.readUInt32BE(20);
const availableWidth = 901 - 240 - (18 * 2);
const logoWidth = 75 * logoRatio;
const mintiesWidth = (8 * 45) + (7 * 6);
assert.ok(logoWidth + 12 + mintiesWidth > availableWidth, 'geometry fixture must require wrapping');
assert.ok(logoWidth <= availableWidth, 'wrapped logo row must fit the narrow desktop banner');
assert.ok(mintiesWidth <= availableWidth, 'wrapped Minties row must fit the narrow desktop banner');

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
    '.top-banner': new Set(['display', 'align-items', 'justify-content', 'padding', 'height', 'min-height']),
    '.top-banner-inner': new Set(['display', 'align-items', 'justify-content', 'width', 'padding', 'gap', 'flex-direction', 'flex-wrap']),
    '.top-banner-logo': new Set(['height', 'width', 'max-width']),
    '.top-banner-minties': new Set(['display', 'align-items', 'justify-content', 'gap', 'flex-wrap']),
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

console.log(`MINT banner contract passed: empty-mount rendering, eight Minties, complete wrapping, measured height, and narrow-desktop geometry${process.argv.includes('--check-blind-refusal') ? ', plus Blind Refusal compatibility' : ''}.`);
