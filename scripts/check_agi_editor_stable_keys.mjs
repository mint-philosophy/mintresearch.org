import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('agif-router-worker/site-assets/assets/inline-editor.js', 'utf8').split('function applyValues')[0];
const leaf = (text = 'Plan') => ({
  textContent: text, tagName: 'H2', classList: ['wide-heading'],
  children: [], dataset: {}, matches: () => false,
});
const slide = (elements = [], editorIndex) => ({
  dataset: editorIndex === undefined ? {} : { editorIndex: String(editorIndex) },
  querySelectorAll: () => elements,
});
function keys(slides) {
  const context = {
    document: { documentElement: { dataset: { editorDeck: 'should-we-build-agi' } }, querySelectorAll: () => slides },
  };
  vm.runInNewContext(`${source}\neditableLeaves(); result = fields.map(field => field.key);`, context);
  return Array.from(context.result);
}

const before = Array.from({ length: 7 }, () => slide()).concat(slide([leaf()]));
assert.deepEqual(keys(before), ['s08-103e2dc4-01'], 'Unannotated decks must retain the existing production key');
const after = Array.from({ length: 7 }, () => slide()).concat(slide([], 19), slide([leaf()], 8));
assert.deepEqual(keys(after), keys(before), 'Inserting a slide must preserve the moved slide’s saved-edit key');
assert.deepEqual(keys([slide([leaf()], 8)]), keys(before), 'An explicit editor index must survive any display position');
assert.notDeepEqual(keys([slide([leaf('Revised plan')], 8)]), keys(before), 'Changing source text must still invalidate stale overrides');
assert.deepEqual(keys([slide([leaf(), leaf()], 8)]), ['s08-103e2dc4-01', 's08-103e2dc4-02'], 'Repeated fields must retain distinct keys');
console.log('Stable editor indices verified: legacy fallback, insertion, relocation, source changes, duplicate fields.');
