import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
const host = 'https://fellows.mintresearch.org';
const env = {
  FELLOWSHIP_PASSWORD_SEPTEMBER_14: 'test-viewing-password',
  OWNER_LOGIN_LIMITER: { limit: async () => ({ success: true }) },
  CONTENT_OVERRIDES: { get: async () => 'PRIVATE ROSTER' },
};
const req = (path = '/', options) => new Request(host + path, options);
const post = (password, origin = host) => req('/login', { method: 'POST', headers: { Origin: origin }, body: new URLSearchParams({ password }) });
test('directory stays protected after presentation release and rejects other hosts and paths', async () => {
  const r = await worker.fetch(req(), env);
  assert.match(await r.text(), /type="password"/);
  assert.match(r.headers.get('X-Robots-Tag'), /noindex/);
  assert.match(r.headers.get('Cache-Control'), /no-store/);
  assert.equal((await worker.fetch(req('/fellows-directory/index.html'), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://fellowship.mintresearch.org/fellows-directory/index.html'), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://mint-agif-router.mintlabjhu.workers.dev/fellows-directory/index.html'), env)).status, 404);
});
test('password, session, expiry and logout are enforced', async () => {
  assert.equal((await worker.fetch(post('wrong'), env)).status, 401);
  assert.equal((await worker.fetch(post('test-viewing-password', 'https://other.example'), env)).status, 403);
  const login = await worker.fetch(post('test-viewing-password'), env);
  assert.equal(login.status, 303);
  const cookie = login.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  const r = await worker.fetch(req('/', { headers: { Cookie: cookie } }), env);
  assert.equal(await r.text(), 'PRIVATE ROSTER');
  assert.match(r.headers.get('Cache-Control'), /no-store/);
  const expired = await worker.fetch(req('/', { headers: { Cookie: cookie } }), { ...env, TEST_NOW_MS: Date.now() + 13 * 3600000 });
  assert.doesNotMatch(await expired.text(), /PRIVATE ROSTER/);
  const logout = await worker.fetch(req('/logout', { method: 'POST', headers: { Origin: host, Cookie: cookie } }), env);
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
});
test('robots blocks entire host and missing secret or rate limiter fails closed', async () => {
  assert.match(await (await worker.fetch(req('/robots.txt'), env)).text(), /Disallow: \//);
  assert.equal((await worker.fetch(req(), { ...env, FELLOWSHIP_PASSWORD_SEPTEMBER_14: undefined })).status, 503);
  assert.equal((await worker.fetch(post('test-viewing-password'), { ...env, OWNER_LOGIN_LIMITER: undefined })).status, 503);
});
