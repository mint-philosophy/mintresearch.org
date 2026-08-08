import assert from 'node:assert/strict';
import fs from 'node:fs';

const formEndpoint = 'https://formsubmit.co/f3ed156ef75fc12f2395ba0d338cc6ce';

function arraySource(file, startMarker, endMarker) {
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${file} must retain ${startMarker}`);
  return source.slice(start, end);
}

function values(source, field) {
  return [...source.matchAll(new RegExp(`${field}: '([^']+)'`, 'g'))].map((match) => match[1]);
}

function assertUnique(items, label) {
  assert.equal(new Set(items).size, items.length, `${label} IDs must be unique`);
}

function assertImageFiles(source, label) {
  const paths = values(source, 'image');
  paths.forEach((path) => {
    assert.ok(path.startsWith('/assets/'), `${label} images must use public asset paths`);
    assert.ok(fs.existsSync(`public${path}`), `${label} image is missing: ${path}`);
  });
}

const governingFile = 'public/assets/collections/governing-with-agents.js';
const governing = arraySource(governingFile, 'const cases = [', 'const statusClass');
const governingIds = values(governing, 'id');
assert.equal(governingIds.length, 17, 'Governing with Agents must contain the 17 reviewed cases');
assertUnique(governingIds, 'Governing with Agents');
assert.equal(values(governing, 'goal').length, 17, 'Every governance case needs a goal');
assert.equal(values(governing, 'method').length, 17, 'Every governance case needs a method');
assertImageFiles(governing, 'Governance case');

const cultureFile = 'public/assets/collections/ai-culture.js';
const books = arraySource(cultureFile, 'const books = [', 'const screen = [');
const screen = arraySource(cultureFile, 'const screen = [', 'function noteSlot');
const bookIds = values(books, 'id');
const screenIds = values(screen, 'id');
assert.equal(bookIds.length, 16, 'The literature collection must contain 16 reviewed books');
assert.equal(screenIds.length, 14, 'The screen collection must contain 14 reviewed works');
assertUnique([...bookIds, ...screenIds], 'Culture collection');

const descriptions = [...values(books, 'description'), ...values(screen, 'description')];
assert.equal(descriptions.length, 30, 'Every culture entry needs a source description');
descriptions.forEach((description) => {
  assert.ok(description.trim().split(/\s+/).length <= 25, `Source quotation exceeds 25 words: ${description}`);
});
assert.equal(values(books, 'source').length + values(screen, 'source').length, 30, 'Every culture entry needs a human source URL');

const coverPaths = values(books, 'cover');
assert.equal(coverPaths.length, 16, 'Every book needs a cover');
coverPaths.forEach((path) => assert.ok(fs.existsSync(`public${path}`), `Book cover is missing: ${path}`));

const notes = JSON.parse(fs.readFileSync('public/assets/collections/ai-culture-notes.json', 'utf8'));
assert.deepEqual(Object.keys(notes).sort(), [...bookIds, ...screenIds].sort(), 'Curator-note keys must match culture entry IDs');

for (const [page, next] of [
  ['public/governing-with-agents/index.html', 'https://mintresearch.org/governing-with-agents/?submitted=1#suggest'],
  ['public/ai-culture/index.html', 'https://mintresearch.org/ai-culture/?submitted=1#suggest']
]) {
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes(`action="${formEndpoint}"`), `${page} must use the established form endpoint`);
  assert.ok(html.includes(`name="_next" value="${next}"`), `${page} must return to its own receipt state`);
  assert.ok(html.includes('nothing is published automatically'), `${page} must state the moderation boundary`);
  assert.ok(html.includes('/assets/collections/collections.css'), `${page} must load the shared collection styles`);
}

assert.ok(fs.existsSync('public/assets/governing-with-agents/og-governing-with-agents.png'), 'Governance social card is missing');
assert.ok(fs.existsSync('public/assets/ai-culture/og-ai-culture.png'), 'Culture social card is missing');

console.log('MINT curated collections contract passed: 17 governance cases, 30 culture entries, local assets, human-source limits, notes, and moderated forms.');
