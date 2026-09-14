import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pageRecord } from './build_search_index.mjs';
import { searchRecords } from '../public/assets/site-search.js';

test('indexing uses page content, excludes scripts and respects private/redirect metadata', () => {
  const html = '<title>Test &amp; search</title><main>Visible words<script>PRIVATE_SCRIPT</script><nav>Navigation</nav><p hidden>PRIVATE_HIDDEN</p></main>';
  assert.deepEqual(pageRecord(html, 'test/index.html'), { title: 'Test & search', url: 'https://mintresearch.org/test/', text: 'Visible words' });
  assert.equal(pageRecord('<meta name="robots" content="noindex">' + html, 'test.html'), null);
  assert.equal(pageRecord('<meta http-equiv="refresh" content="0;url=/">' + html, 'test.html'), null);
});
test('search ranks titles, folds accents, requires every term and rejects unsafe destinations', () => {
  const records = [
    { title: 'Other', text: 'More about artificial persons', url: 'https://mintresearch.org/other/' },
    { title: 'Artificial Persons', text: 'Seth Lazar', url: 'https://arxiv.org/abs/2607.08695' },
    { title: 'Café', text: 'Accent test', url: 'https://mintresearch.org/cafe/' },
    { title: 'Artificial Persons', text: 'Bad URL', url: 'javascript:alert(1)' },
  ];
  assert.equal(searchRecords(records, 'artificial persons')[0].title, 'Artificial Persons');
  assert.equal(searchRecords(records, 'cafe')[0].title, 'Café');
  assert.deepEqual(searchRecords(records, 'missing term'), []);
  assert.deepEqual(searchRecords(records, '!!!'), []);
  assert.equal(searchRecords(records, 'artificial persons').length, 2);
});
test('built index includes the public publications and excludes nonpublic and Fellowship records', async () => {
  const records = JSON.parse(await readFile(new URL('../dist/assets/search-index.json', import.meta.url), 'utf8'));
  assert.equal(searchRecords(records, 'artificial persons')[0].url, 'https://arxiv.org/abs/2607.08695');
  assert.ok(records.some(record => record.url === 'https://mintresearch.org/cv/'));
  assert.ok(records.every(record => !record.url.includes('fellowship.mintresearch.org')));
  assert.ok(!records.some(record => record.url === 'https://doi.org/10.1002/japp.70120'));
});
