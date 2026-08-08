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

function wordCount(text) {
  return text.trim().split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
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
assert.equal(governingIds.length, 23, 'Governing with Agents must contain the 23 reviewed cases');
assertUnique(governingIds, 'Governing with Agents');
const governingQuotes = values(governing, 'sourceQuote');
assert.equal(governingQuotes.length, 23, 'Every governance case needs a source quotation');
assert.equal(values(governing, 'sourceLabel').length, 23, 'Every governance quotation needs a visible source label');
assert.equal(values(governing, 'sourceHref').length, 23, 'Every governance quotation needs a source URL');
governingQuotes.forEach((quote) => {
  assert.ok(wordCount(quote) <= 25, `Governance source quotation exceeds 25 words: ${quote}`);
});
assert.ok(!governing.includes('goal:'), 'Governance cards must not restore model-written goal summaries');
assert.ok(!governing.includes('method:'), 'Governance cards must not restore model-written method summaries');
assertImageFiles(governing, 'Governance case');

const cultureFile = 'public/assets/collections/ai-culture.js';
const books = arraySource(cultureFile, 'const books = [', 'const screen = [');
const screen = arraySource(cultureFile, 'const screen = [', 'function noteSlot');
const bookIds = values(books, 'id');
const screenIds = values(screen, 'id');
assert.equal(bookIds.length, 51, 'The literature collection must contain 51 reviewed books');
assert.equal(screenIds.length, 7, 'The screen collection must contain 7 watched works');
assertUnique([...bookIds, ...screenIds], 'Culture collection');

const cultureQuotes = [...values(books, 'sourceQuote'), ...values(screen, 'sourceQuote')];
assert.equal(cultureQuotes.length, 58, 'Every culture entry needs a source quotation');
cultureQuotes.forEach((quote) => {
  assert.ok(wordCount(quote) <= 25, `Source quotation exceeds 25 words: ${quote}`);
});
assert.equal(values(books, 'source').length + values(screen, 'source').length, 58, 'Every culture entry needs a source URL');
assert.ok(!books.includes('description:'), 'Book cards must not restore model-written descriptions');
assert.ok(!screen.includes('description:'), 'Screen cards must not restore model-written descriptions');
assert.equal(values(books, 'series').length, 16, 'The five complete series must retain all 16 volume assignments');

const coverPaths = values(books, 'cover');
assert.equal(coverPaths.length, 51, 'Every book needs a cover');
coverPaths.forEach((path) => assert.ok(fs.existsSync(`public${path}`), `Book cover is missing: ${path}`));
assertImageFiles(screen, 'Screen');

const notes = JSON.parse(fs.readFileSync('public/assets/collections/ai-culture-notes.json', 'utf8'));
assert.deepEqual(Object.keys(notes).sort(), [...bookIds, ...screenIds].sort(), 'Curator-note keys must match culture entry IDs');

for (const [page, next] of [
  ['public/governing-with-agents/index.html', 'https://mintresearch.org/governing-with-agents/?submitted=1#suggest'],
  ['public/ai-culture/index.html', 'https://mintresearch.org/ai-culture/?submitted=1#suggest']
]) {
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes(`action="${formEndpoint}"`), `${page} must use the established form endpoint`);
  assert.ok(html.includes(`name="_next" value="${next}"`), `${page} must return to its own receipt state`);
  assert.ok(html.includes('MINT reviews submissions before publication'), `${page} must state the moderation boundary`);
  assert.ok(html.includes('/assets/collections/collections.css'), `${page} must load the shared collection styles`);
}

const governanceHtml = fs.readFileSync('public/governing-with-agents/index.html', 'utf8');
const cultureHtml = fs.readFileSync('public/ai-culture/index.html', 'utf8');
assert.ok(governanceHtml.includes('Tracking the ecosystem of civic AI'), 'The governance page must identify itself as an ecosystem tracker');
assert.ok(governanceHtml.includes('Built by the organisations and teams named on each card'), 'The governance page must make third-party project ownership explicit');
assert.ok(governanceHtml.includes('<dt>Card text</dt><dd>Quotations from linked sources</dd>'), 'The governance page must retain its source-quotation note');
assert.ok(!cultureHtml.includes('class="collection-aside"'), 'The culture page must not expose an internal sourcing panel');
assert.ok(!cultureHtml.toLowerCase().includes('human-written source'), 'Internal source-quality instructions must not appear on the culture page');

const collectionCopy = [
  fs.readFileSync('public/governing-with-agents/index.html', 'utf8'),
  fs.readFileSync('public/ai-culture/index.html', 'utf8'),
  governing
].join('\n');
for (const rejected of [
  'Case files, not endorsements',
  'Field notes for governing institutions',
  'Make institutions visible',
  'Hear more people without flattening them',
  'A shelf for impossible futures',
  'Stories are rehearsal spaces',
  'What belongs here next?'
]) {
  assert.ok(!collectionCopy.includes(rejected), `Rejected collection copy returned: ${rejected}`);
}

assert.ok(fs.existsSync('public/assets/governing-with-agents/og-governing-with-agents.png'), 'Governance social card is missing');
assert.ok(fs.existsSync('public/assets/ai-culture/og-ai-culture.png'), 'Culture social card is missing');

console.log('MINT curated collections contract passed: 23 source-quoted governance cases, 58 source-quoted culture entries, local assets, notes, and moderated forms.');
