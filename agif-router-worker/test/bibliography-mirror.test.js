import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { renderBibliographyMirror } from '../src/index.js';
const origin = 'https://bibliography.mintresearch.org';
test('mirror replaces fellowship navigation and preserves bibliography data and canonical URL', () => {
  const input = '<head><link rel="canonical" href="https://fellowship.mintresearch.org/bibliography/"></head><nav aria-label="Fellowship navigation"><div class="nav-pages" id="siteNav"><div class="nav-divider">AGI Governance Fellowship</div><a>Overview</a></div></nav><script>const BOOT={"revision":42,"items":["unchanged"]};</script>';
  const output = renderBibliographyMirror(input);
  assert.ok(output.includes('data-mint-site-nav'));
  assert.ok(output.includes('data-current-id="agi-governance-bibliography"'));
  assert.ok(!output.includes('Overview'));
  assert.ok(output.includes('const BOOT={"revision":42,"items":["unchanged"]};'));
  assert.ok(output.includes('href="https://fellowship.mintresearch.org/bibliography/"'));
});
test('mirror uses shared backend and preserves suggestion origin, body and client IP', async () => {
  let seen;
  const request = new Request(origin + '/api/suggestions', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' }, body: '{"suggestion":"example"}' });
  const response = await worker.fetch(request, { BIBLIOGRAPHY: { fetch: async req => { seen = req; return new Response('{"ok":true}'); } } });
  assert.equal(response.status, 200);
  assert.equal(seen, request);
  assert.equal(seen.headers.get('Origin'), origin);
  assert.equal(seen.headers.get('CF-Connecting-IP'), '203.0.113.7');
  assert.equal(await seen.text(), '{"suggestion":"example"}');
});
test('mirror blocks editor APIs and redirects edit UI to owner authentication', async () => {
  const env = { BIBLIOGRAPHY: { fetch: () => { throw new Error('must not reach backend'); } } };
  for (const path of ['/api/editor/state', '/owner/login', '/unknown']) assert.equal((await worker.fetch(new Request(origin + path), env)).status, 404);
  assert.equal((await worker.fetch(new Request(origin + '/', { method: 'POST' }), env)).status, 405);
  const response = await worker.fetch(new Request(origin + '/edit/'), env);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://fellowship.mintresearch.org/bibliography/edit/');
});
test('mirror transforms only successful root HTML and preserves API responses and security headers', async () => {
  const env = { BIBLIOGRAPHY: { fetch: async () => new Response('<head></head>', { headers: { 'Content-Type': 'text/html', 'Content-Length': '13', 'Content-Security-Policy': "frame-ancestors 'none'" } }) } };
  const response = await worker.fetch(new Request(origin + '/'), env);
  assert.ok((await response.text()).includes('mint-site-nav.v1.js'));
  assert.equal(response.headers.get('Content-Length'), null);
  assert.equal(response.headers.get('Content-Security-Policy'), "frame-ancestors 'none'");
  const api = await worker.fetch(new Request(origin + '/api/state'), env);
  assert.equal(await api.text(), '<head></head>');
});
