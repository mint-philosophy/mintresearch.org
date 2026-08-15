import assert from 'node:assert/strict';
import fs from 'node:fs';
import { kindleScienceFictionBooks, kindleScienceFictionSeries } from '../public/assets/collections/ai-culture-kindle.js';

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
const kindleCultureFile = 'public/assets/collections/ai-culture-kindle.js';
const books = arraySource(cultureFile, 'const books = [', 'const screen = [');
const screen = arraySource(cultureFile, 'const screen = [', 'function noteSlot');
const bookIds = [...values(books, 'id'), ...kindleScienceFictionBooks.map((book) => book.id)];
const screenIds = values(screen, 'id');
assert.equal(bookIds.length, 117, 'The literature collection must contain 117 reviewed books');
assert.equal(screenIds.length, 7, 'The screen collection must contain 7 watched works');
assertUnique([...bookIds, ...screenIds], 'Culture collection');

const cultureQuotes = [
  ...values(books, 'sourceQuote'),
  ...kindleScienceFictionBooks.map((book) => book.sourceQuote),
  ...values(screen, 'sourceQuote')
];
assert.equal(cultureQuotes.length, 124, 'Every culture entry needs a source quotation');
cultureQuotes.forEach((quote) => {
  assert.ok(wordCount(quote) <= 25, `Source quotation exceeds 25 words: ${quote}`);
});
assert.equal(
  values(books, 'source').length + kindleScienceFictionBooks.filter((book) => book.source).length + values(screen, 'source').length,
  124,
  'Every culture entry needs a source URL'
);
assert.ok(!books.includes('description:'), 'Book cards must not restore model-written descriptions');
assert.ok(!fs.readFileSync(kindleCultureFile, 'utf8').includes('description:'), 'Kindle book cards must not contain model-written descriptions');
assert.ok(!screen.includes('description:'), 'Screen cards must not restore model-written descriptions');
assert.ok(cultureFile && fs.readFileSync(cultureFile, 'utf8').includes("'murderbot-diaries': { title: 'The Murderbot Diaries', author: 'Martha Wells' }"), 'The Murderbot Diaries series metadata is missing');
for (const id of ['all-systems-red', 'artificial-condition', 'rogue-protocol', 'exit-strategy', 'network-effect', 'fugitive-telemetry', 'system-collapse']) {
  assert.match(books, new RegExp(`id: '${id}'[^\\n]+series: 'murderbot-diaries'`), `Murderbot series assignment is missing: ${id}`);
}
assert.equal(kindleScienceFictionSeries['le-guin'].kind, 'Author', 'Le Guin titles must use an author stack');
assert.equal(kindleScienceFictionSeries['kim-stanley-robinson'].kind, 'Author', 'KSR titles must use an author stack');
assert.equal(kindleScienceFictionBooks.filter((book) => book.series === 'le-guin').length, 7, 'The Le Guin author stack needs its seven added titles');
assert.equal(kindleScienceFictionBooks.filter((book) => book.series === 'kim-stanley-robinson').length, 9, 'The KSR author stack needs its nine added titles');
assert.equal(kindleScienceFictionBooks.filter((book) => book.series === 'culture').length, 2, 'The Culture stack needs its two added titles');
assert.match(books, /id: 'the-dispossessed'[^\n]+series: 'le-guin'/, 'The Dispossessed must be included in the Le Guin author stack');
for (const id of ['ministry-for-the-future', 'red-mars', 'green-mars', 'blue-mars']) {
  assert.match(books, new RegExp(`id: '${id}'[^\\n]+series: 'kim-stanley-robinson'`), `KSR author-stack assignment is missing: ${id}`);
}

const coverPaths = [...values(books, 'cover'), ...kindleScienceFictionBooks.map((book) => book.cover)];
assert.equal(coverPaths.length, 117, 'Every book needs a cover');
coverPaths.forEach((path) => assert.ok(fs.existsSync(`public${path}`), `Book cover is missing: ${path}`));
assertImageFiles(screen, 'Screen');

const notes = JSON.parse(fs.readFileSync('public/assets/collections/ai-culture-notes.json', 'utf8'));
assert.deepEqual(Object.keys(notes).sort(), [...bookIds, ...screenIds].sort(), 'Curator-note keys must match culture entry IDs');
assert.equal(notes.daemon, 'It’s kind of Michael Crichton-lite, and the model of AI is pretty deterministic. But there’s good stuff on meat robots and it’s a pretty fun read.', 'Seth’s Daemon note must retain its approved wording');
assert.equal(notes.exhalation, 'Look, it’s not as good as his current writing on AI is bad, but it’s pretty nicely conceived; the memory/recording one is especially thought-provoking.', 'Seth’s Exhalation note must retain its approved wording');
assert.equal(notes['klara-and-the-sun'], 'Every bit as good as you’d expect, and pretty well on the nose for one near-term trajectory for AI. Poignant, lyrical, etc. Better written than one has a right to expect an interesting novel about AI to be.', 'Seth’s Klara and the Sun note must remain verbatim');
assert.equal(notes.speak, 'Very few sci-fi writers anticipated language being quite so central to AI progress; this book does so nicely, and it is pretty well written too. Very focused on the companions side of things; I reckon it’s a bit pessimistic about the human appetite for non-digital connection. But good.', 'Seth’s Speak note must retain its approved wording');
assert.equal(notes['red-mars'], 'KSR was just not into AI at this time, so it figures in a very minimal, “universal interface” kind of way. Everything else about the trilogy is wicked, though, especially the whole constitutional convention dimension. Also, the later reflections on the cognitive and social implications of much-extended lives.', 'Seth’s Mars trilogy note must retain its approved wording');

for (const [page, pageUrl, next, subject] of [
  ['public/governing-with-agents/index.html', 'https://mintresearch.org/governing-with-agents/', 'https://mintresearch.org/governing-with-agents/?submitted=1#suggest', 'Suggestion for Governing with Agents'],
  ['public/ai-culture/index.html', 'https://mintresearch.org/ai-culture/', 'https://mintresearch.org/ai-culture/?submitted=1#suggest', 'Suggestion for AI (etc)']
]) {
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes(`action="${formEndpoint}"`), `${page} must use the established form endpoint`);
  assert.ok(html.includes(`name="_subject" value="${subject}"`), `${page} must retain its mailbox subject`);
  assert.ok(html.includes('name="_captcha" value="false"'), `${page} must submit directly without an untested CAPTCHA handoff`);
  assert.ok(html.includes(`name="_next" value="${next}"`), `${page} must return to its own receipt state`);
  assert.ok(html.includes(`name="_url" value="${pageUrl}"`), `${page} must identify its exact public form URL`);
  assert.ok(html.includes('name="_honey"'), `${page} must retain its spam honeypot`);
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
assert.ok(cultureHtml.includes('id="book-shelf"'), 'The culture page must retain the horizontal bookshelf');
assert.ok(cultureHtml.includes('data-shelf-direction="-1"') && cultureHtml.includes('data-shelf-direction="1"'), 'The bookshelf needs explicit left and right controls');
const cultureScript = fs.readFileSync(cultureFile, 'utf8');
assert.ok(cultureScript.includes('function revealBook'), 'The bookshelf must be able to reveal and focus an exact book');
assert.ok(cultureScript.includes('stack.open = true'), 'Bookshelf navigation must open a collapsed series stack');

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

console.log('MINT curated collections contract passed: 23 source-quoted governance cases, 124 source-quoted culture entries, local assets, notes, and moderated forms.');
