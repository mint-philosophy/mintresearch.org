import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import worker from '../src/index.js';

function environment(overrides = {}) {
  return {
    FELLOWSHIP_SLIDES_PASSWORD: 'test-shared-slides-password',
    FELLOWSHIP_EDITOR_PASSWORD: 'test-editor-only-password',
    OWNER_LOGIN_LIMITER: { limit: async () => ({ success: true }) },
    TEST_NOW_MS: Date.parse('2026-11-18T12:00:00-05:00'),
    CONTENT_OVERRIDES: { get: async () => assert.fail('no Fellowship route may read saved deck text') },
    ...overrides,
  };
}

function request(path, options = {}) {
  return new Request(`https://fellowship.mintresearch.org${path}`, options);
}

async function ownerCookie(env) {
  const login = await worker.fetch(request('/owner/login', {
    method: 'POST',
    headers: { Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': '198.51.100.4' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_EDITOR_PASSWORD, next: '/bibliography/edit/' }),
  }), env);
  assert.equal(login.status, 303);
  return login;
}

const retiredRoutes = [
  '/definitions/', '/philosophy/', '/projects/', '/should-we-build-agi/', '/agi-institutions/',
  '/adaptation/', '/adaptation/deck.html', '/societal-adaptation/deck.js', '/day-1/', '/day-2/deck.html',
  '/day-3/', '/fellowship/index.html', '/login', '/logout', '/editor/v1/session',
  '/editor/v1/decks/definitions', '/assets/inline-editor.js', '/_astro/x.css',
];

test('the Fellowship host root is a content-free noindex notice that needs no password', async () => {
  for (const env of [environment(), environment({ FELLOWSHIP_SLIDES_PASSWORD: undefined })]) {
    const response = await worker.fetch(request('/'), env);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const html = await response.text();
    assert.match(html, /no longer online/);
    assert.match(html, /href="https:\/\/bibliography\.mintresearch\.org\/"/);
    assert.doesNotMatch(html, /type="password"|<iframe|deck\.html|\/definitions\/|\/adaptation\//);
  }
  const head = await worker.fetch(request('/', { method: 'HEAD' }), environment());
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('every former presentation, viewer login, deck editor and deck asset route answers 410 without content', async () => {
  const owner = (await ownerCookie(environment())).headers.get('set-cookie').split(';')[0];
  for (const path of retiredRoutes) {
    for (const headers of [{}, { Cookie: owner }]) {
      const response = await worker.fetch(request(path, { headers }), environment());
      assert.equal(response.status, 410, path);
      assert.match(response.headers.get('x-robots-tag'), /noindex/, path);
      assert.equal(response.headers.get('set-cookie'), null, path);
      assert.doesNotMatch(await response.text(), /type="password"|<iframe|data-editor-deck/, path);
    }
  }
  assert.equal((await worker.fetch(request('/anything-else'), environment())).status, 404);
});

test('the retired agif hosts redirect to the notice', async () => {
  for (const host of ['agif1', 'agif2', 'agif3']) {
    const response = await worker.fetch(new Request(`https://${host}.mintresearch.org/deck.html?old=1`), environment());
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), 'https://fellowship.mintresearch.org/?old=1');
  }
});

test('the Worker no longer carries deck assets or reads saved deck text', async () => {
  const config = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.doesNotMatch(config, /\[assets\]|site-assets/);
  const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /env\.ASSETS|deck:\$\{|\/editor\/v1\/decks\//);
});

test('public bibliography routes forward the original request and preserve backend responses', async () => {
  for (const [path, method] of [
    ['/bibliography/', 'GET'], ['/bibliography/', 'HEAD'],
    ['/bibliography/api/state', 'GET'], ['/bibliography/api/suggestions', 'POST'],
  ]) {
    const incoming = request(`${path}?example=1`, {
      method,
      headers: { Origin: 'https://fellowship.mintresearch.org', 'CF-Connecting-IP': '198.51.100.9' },
      ...(method === 'POST' ? { body: '{"title":"Example"}' } : {}),
    });
    const backendResponse = new Response(method === 'HEAD' ? null : 'bibliography', { headers: { 'X-Backend': 'preserved' } });
    const response = await worker.fetch(incoming, environment({ BIBLIOGRAPHY: { fetch(forwarded) {
      assert.equal(forwarded, incoming);
      return backendResponse;
    } } }));
    assert.equal(response, backendResponse);
  }
});

test('bibliography routing answers 503 when the backend call fails', async () => {
  const env = environment({ BIBLIOGRAPHY: { fetch: async () => { throw new Error('Worker exceeded resource limits'); } } });
  assert.equal((await worker.fetch(request('/bibliography/api/state'), env)).status, 503);
});

test('bibliography routing protects owner routes and keeps the public allowlist bounded', async () => {
  const env = environment({ BIBLIOGRAPHY: { fetch() { assert.fail('private or invalid request forwarded'); } } });
  assert.equal((await worker.fetch(request('/bibliography/edit/'), env)).status, 303);
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state'), env)).status, 401);
  for (const path of ['/bibliography/api/admin', '/bibliography/definitions/deck.html', '/bibliography/api/state/']) {
    assert.equal((await worker.fetch(request(path), env)).status, 404);
  }
  for (const [path, method] of [['/bibliography/', 'POST'], ['/bibliography/api/state', 'PUT'], ['/bibliography/api/suggestions', 'GET']]) {
    assert.equal((await worker.fetch(request(path, { method }), env)).status, 405);
  }
  const response = await worker.fetch(request('/bibliography?from=hub'), env);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://fellowship.mintresearch.org/bibliography/?from=hub');
  assert.equal((await worker.fetch(request('/bibliography/'), environment())).status, 503);
});

test('sitemap lists only the public bibliography; robots keep the notice and owner pages out', async () => {
  const xml = await (await worker.fetch(request('/sitemap.xml'), environment())).text();
  assert.match(xml, /https:\/\/fellowship\.mintresearch\.org\/bibliography\//);
  assert.doesNotMatch(xml, /<loc>https:\/\/fellowship\.mintresearch\.org\/<\/loc>/);
  const robots = await (await worker.fetch(request('/robots.txt'), environment())).text();
  assert.match(robots, /Disallow: \/\$/);
  assert.match(robots, /Disallow: \/owner\//);
  assert.match(robots, /Allow: \/bibliography\//);
  assert.match(robots, /Sitemap: https:\/\/fellowship\.mintresearch\.org\/sitemap\.xml/);
  const unknown = await worker.fetch(new Request('https://example.com/'), environment());
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('x-robots-tag'), /noindex/);
});

test('the owner login opens bibliography editing from any network and logs out', async () => {
  const env = environment({ BIBLIOGRAPHY: { fetch: async () => new Response('owner bibliography') } });
  const login = await ownerCookie(env);
  assert.equal(login.headers.get('location'), '/bibliography/edit/');
  assert.match(login.headers.get('set-cookie'), /^mint_fellowship_editor=/);
  assert.match(login.headers.get('set-cookie'), /Max-Age=2592000; Path=\/; HttpOnly; Secure; SameSite=Strict/);
  const headers = { Cookie: login.headers.get('set-cookie').split(';')[0], 'CF-Connecting-IP': '192.0.2.73' };
  assert.equal(await (await worker.fetch(request('/bibliography/edit/', { headers }), env)).text(), 'owner bibliography');
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state', { method: 'PUT', headers: { ...headers, Origin: 'https://evil.example' }, body: '{}' }), env)).status, 403);
  assert.equal((await worker.fetch(request('/owner/login', { headers }), env)).status, 303);
  const logout = await worker.fetch(request('/owner/logout', { method: 'POST', headers: { ...headers, Origin: 'https://fellowship.mintresearch.org' } }), env);
  assert.equal(logout.status, 303);
  assert.equal(logout.headers.get('location'), '/');
  assert.match(logout.headers.get('set-cookie'), /mint_fellowship_editor=; Max-Age=0/);
  assert.equal((await worker.fetch(request('/owner/logout', { headers }), env)).status, 405);
  const expired = { ...env, TEST_NOW_MS: env.TEST_NOW_MS + 31 * 86400000 };
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state', { headers }), expired)).status, 401);
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state', { headers }), { ...env, FELLOWSHIP_EDITOR_PASSWORD: 'rotated-test-secret' })).status, 401);
});

test('owner login rejects the old viewing password, forged origins and rate-limited attempts', async () => {
  const env = environment();
  const init = { method: 'POST', headers: { Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD }) };
  const wrong = await worker.fetch(request('/owner/login', init), env);
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get('set-cookie'), null);
  assert.equal((await worker.fetch(request('/owner/login', { ...init, headers: { ...init.headers, Origin: 'https://evil.example' } }), env)).status, 403);
  const limited = { ...env, OWNER_LOGIN_LIMITER: { limit: async () => ({ success: false }) } };
  const response = await worker.fetch(request('/owner/login', init), limited);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
  assert.equal((await worker.fetch(request('/owner/login', init), { ...env, OWNER_LOGIN_LIMITER: undefined })).status, 503);
  for (const next of ['https://evil.example', '/definitions/']) {
    const page = await worker.fetch(request(`/owner/login?next=${encodeURIComponent(next)}`), env);
    const html = await page.text();
    assert.match(html, /name="next" value="\/"/);
    assert.match(html, /edit the AGI Governance Bibliography/);
    assert.doesNotMatch(html, /presentation/i);
    assert.match(page.headers.get('x-robots-tag'), /noindex/);
  }
});

test('write methods outside the owner and bibliography routes are refused', async () => {
  for (const path of ['/', '/should-we-build-agi/', '/anything']) {
    const response = await worker.fetch(request(path, { method: 'POST' }), environment());
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, HEAD');
  }
});
