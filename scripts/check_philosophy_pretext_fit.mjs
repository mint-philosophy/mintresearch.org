import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../agif-router-worker/site-assets/', import.meta.url);
const css = readFileSync(new URL('philosophy/philosophy.css', root), 'utf8');
const html = readFileSync(new URL('philosophy/deck.html', root), 'utf8');
const wrapper = readFileSync(new URL('fellowship/philosophy/index.html', root), 'utf8');
const rule = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`^${escaped} \\{([^}]+)\\}`, 'm'));
  assert.ok(match, `Missing rule: ${selector}`);
  return match[1];
};

// Pretext inserts line breaks, so a title cannot size its own containing track.
assert.match(rule('.philo-definitions-heading'), /display: grid;/);
assert.match(rule('.philo-definitions-heading'), /grid-template-columns: auto minmax\(0,1fr\);/);
assert.match(rule('.philo-definitions-heading h2'), /min-width: 0;/);
// Size against the slide, whose height excludes the ticker and navigation.
assert.match(rule('.philo-definitions'), /container-type: size;/);
for (const selector of ['.philo-definitions-heading', '.philo-definitions-heading h2', '.philo-definition-rows h3', '.philo-definition-rows p']) {
  assert.match(rule(selector), /cqh/, `${selector} must respect actual slide height`);
}
const shortLandscape = css.slice(css.indexOf('@media (max-height: 600px)'));
assert.doesNotMatch(shortLandscape, /\.philo-definition/, 'Do not replace height-aware sizing at an iframe-height breakpoint');

const slide = html.match(/<section class="slide philo-definitions"[\s\S]*?<\/section>/)?.[0];
assert.ok(slide);
assert.equal((slide.match(/<article>/g) || []).length, 3);
assert.equal((slide.match(/data-pretext(?=[ >])/g) || []).length, 7);
assert.match(slide, /<h2 data-pretext>AGI Governance<\/h2>/);
const cssVersion = html.match(/philosophy\.css\?v=([^" ]+)/)?.[1];
const deckVersion = wrapper.match(/philosophy\/deck\.html\?v=([^" ]+)/)?.[1];
assert.equal(cssVersion, deckVersion, 'Both levels must invalidate cached layout');
assert.notEqual(cssVersion, '20260907.5');
console.log('Philosophy Pretext geometry contracts passed (3 rows, 7 text blocks).');
