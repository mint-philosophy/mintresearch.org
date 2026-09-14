import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const pages = ['index.html', 'cv/index.html', 'newsletter/index.html', 'corpus-map/index.html', 'data-dash/index.html', 'agent-reports/index.html'];
for (const page of pages) {
  const html = await readFile(new URL('../public/' + page, import.meta.url), 'utf8');
  const input = html.slice(html.indexOf('// ── Input'), html.indexOf('// ── Drag + flick'));
  const listeners = {};
  vm.runInNewContext(input, { keys: {}, window: { addEventListener(type, handler) { (listeners[type] ||= []).push(handler); } } });
  for (const key of ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D']) {
    let prevented = false;
    for (const handler of listeners.keydown || []) handler({ key, target: { tagName: 'INPUT' }, preventDefault() { prevented = true; } });
    assert.equal(prevented, false, `${page}: typing ${key} must not be intercepted by Minty`);
  }
  assert.doesNotMatch(html, /keys\[['"][wasd]['"]\]/, `${page}: Minty must not move with letter keys`);
}
const generator = await readFile(new URL('./inject_minty.py', import.meta.url), 'utf8');
assert.doesNotMatch(generator, /keys\[k\]|keys\[['"][wasd]['"]\]/, 'the generator must not restore movement-key controls');
console.log('Minty keyboard contract OK: all six pages and their generator leave letter keys alone.');
