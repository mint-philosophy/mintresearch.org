import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import worker from '../src/index.js';

class MemoryKV {
  constructor() {
    this.values = new Map();
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, value);
  }
}

const passwords = {
  september8: 'test-september-eight',
  september9: 'test-september-nine',
  september10: 'test-september-ten',
  september11: 'test-september-eleven',
  september14: 'test-september-fourteen',
};

function environment(overrides = {}) {
  return {
    FELLOWSHIP_SLIDES_PASSWORD: 'test-shared-slides-password',
    FELLOWSHIP_PASSWORD_SEPTEMBER_8: passwords.september8,
    FELLOWSHIP_PASSWORD_SEPTEMBER_9: passwords.september9,
    FELLOWSHIP_PASSWORD_SEPTEMBER_10: passwords.september10,
    FELLOWSHIP_PASSWORD_SEPTEMBER_11: passwords.september11,
    FELLOWSHIP_PASSWORD_SEPTEMBER_14: passwords.september14,
    FELLOWSHIP_EDITOR_PASSWORD: 'test-editor-only-password',
    OWNER_LOGIN_LIMITER: { limit: async () => ({ success: true }) },
    TEST_NOW_MS: Date.parse('2026-09-07T12:00:00-04:00'),
    ALLOWED_IPS: '203.0.113.8',
    CONTENT_OVERRIDES: new MemoryKV(),
    ASSETS: {
      async fetch(request) {
        const path = new URL(request.url).pathname;
        return new Response(request.method === 'HEAD' ? null : `asset:${path}`, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
    ...overrides,
  };
}

function request(path, options = {}) {
  return new Request(`https://fellowship.mintresearch.org${path}`, options);
}

async function viewerCookie(env) {
  const response = await worker.fetch(request('/login', {
    method: 'POST', headers: { Origin: 'https://fellowship.mintresearch.org' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD, next: '/' }),
  }), env);
  assert.equal(response.status, 303);
  return response.headers.get('set-cookie').split(';')[0];
}

function requestEditorSession(env, password = env.FELLOWSHIP_EDITOR_PASSWORD) {
  return worker.fetch(request('/editor/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://fellowship.mintresearch.org',
      'CF-Connecting-IP': '203.0.113.8',
    },
    body: JSON.stringify({ password }),
  }), env);
}

test('the Fellowship overview is gated and served from the dedicated shell after login', async () => {
  const env = environment();
  assert.equal((await worker.fetch(request('/'), env)).status, 303);
  const response = await worker.fetch(request('/', { headers: { Cookie: await viewerCookie(env) } }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'asset:/fellowship/index.html');
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
});

test('owner IPv6 privacy addresses match only the registered network and still need editor authentication', async () => {
  const env = environment({ FELLOWSHIP_OWNER_IPV6_NETWORKS: '2001:db8:abcd:1234::/64' });
  const cookie = await viewerCookie(env);
  for (const ip of ['2001:db8:abcd:1234::1', '2001:0DB8:ABCD:1234:9876:4321:abcd:1234']) {
    const headers = { Cookie: cookie, 'CF-Connecting-IP': ip, Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/json' };
    const response = await worker.fetch(request('/editor/v1/decks/definitions', { headers }), env);
    assert.equal(response.status, 200);
    const state = await response.json();
    assert.equal(state.canRequestEdit, true);
    assert.equal(state.canEdit, false);
    assert.equal((await worker.fetch(request('/editor/v1/session', { method: 'POST', headers, body: JSON.stringify({ password: passwords.september8 }) }), env)).status, 401);
  }
  for (const ip of ['2001:db8:abcd:1235::1', '2001:db8:abcd::1', '198.51.100.9']) {
    assert.equal((await worker.fetch(request('/editor/v1/decks/definitions', { headers: { 'CF-Connecting-IP': ip } }), env)).status, 401);
  }
  for (const network of ['::/0', 'invalid/64', '2001:db8:abcd:1234::/48']) {
    assert.equal((await worker.fetch(request('/editor/v1/decks/definitions', { headers: { 'CF-Connecting-IP': '2001:db8:abcd:1234::1' } }), environment({ FELLOWSHIP_OWNER_IPV6_NETWORKS: network }))).status, 401);
  }
});

test('the overview never labels slides public or schedules automatic opening', async () => {
  const source = await readFile(new URL('../site-assets/fellowship/index.html', import.meta.url), 'utf8');
  for (const time of [
    '2026-09-08T05:59:59-04:00', '2026-09-08T06:00:00-04:00',
    '2026-09-09T06:00:00-04:00', '2030-01-01T00:00:00Z',
  ]) {
    const env = environment({ TEST_NOW_MS: Date.parse(time), ASSETS: { fetch: async () => new Response(source) } });
    const response = await worker.fetch(request('/', { headers: { Cookie: await viewerCookie(env) } }), env);
    const html = await response.text();
    const open = html.match(/<section id="open-resources">([\s\S]*?)<\/section>/)[1];
    const pending = html.match(/<section id="protected-presentations"[^>]*>([\s\S]*?)<\/section>/)[1];
    assert.deepEqual([...open.matchAll(/data-presentation="([^"]+)"/g)], []);
    assert.equal([...pending.matchAll(/data-presentation=/g)].length, 6);
    assert.match(open, /href="\/bibliography\/"/);
    assert.doesNotMatch(html, /Password until|6 a\.m\.|pending/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
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

test('sitemap includes the public bibliography and excludes presentations', async () => {
  const response = await worker.fetch(request('/sitemap.xml'), environment());
  const xml = await response.text();
  assert.match(xml, /https:\/\/fellowship\.mintresearch\.org\/bibliography\//);
  assert.doesNotMatch(xml, /<loc>https:\/\/fellowship\.mintresearch\.org\/<\/loc>/);
  assert.doesNotMatch(xml, /definitions|philosophy|projects|adaptation/);
});

const schedule = [
  ['/definitions/', '/fellowship/definitions/index.html', '2026-09-08T06:00:00-04:00'],
  ['/philosophy/', '/fellowship/philosophy/index.html', '2026-09-09T06:00:00-04:00'],
  ['/projects/', '/fellowship/projects/index.html', '2026-09-09T06:00:00-04:00'],
  ['/should-we-build-agi/', '/fellowship/day-1/index.html', '2026-09-10T06:00:00-04:00'],
  ['/agi-institutions/', '/fellowship/day-2/index.html', '2026-09-11T06:00:00-04:00'],
  ['/adaptation/', '/fellowship/day-3/index.html', '2026-09-14T06:00:00-04:00'],
];

test('every presentation is gated', async () => {
  for (const [path] of schedule) {
    const response = await worker.fetch(request(`${path}?from=hub`), environment());
    assert.equal(response.status, 303, path);
    assert.equal(
      response.headers.get('location'),
      `https://fellowship.mintresearch.org/login?next=${encodeURIComponent(`${path}?from=hub`)}`,
    );
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  }
});

test('one viewing password session opens all six decks and the hub', async () => {
  const env = environment();
  const login = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://fellowship.mintresearch.org' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD, next: '/philosophy/' }),
  }), env);
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('location'), '/philosophy/');
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /^mint_fellowship_session_slides=/);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Strict/);

  const cookie = setCookie.split(';', 1)[0];
  const philosophy = await worker.fetch(request('/philosophy/deck.css', { headers: { Cookie: cookie } }), env);
  const projects = await worker.fetch(request('/projects/', { headers: { Cookie: cookie } }), env);
  const nextDay = await worker.fetch(request('/should-we-build-agi/', { headers: { Cookie: cookie } }), env);
  assert.equal(await philosophy.text(), 'asset:/philosophy/deck.css');
  assert.equal(await projects.text(), 'asset:/fellowship/projects/index.html');
  assert.equal(nextDay.status, 200);
  for (const path of ['/', ...schedule.map(([path]) => path)]) {
    assert.equal((await worker.fetch(request(path, { headers: { Cookie: cookie } }), env)).status, 200);
  }
  assert.match(projects.headers.get('x-robots-tag'), /noindex/);
  assert.equal(projects.headers.get('cache-control'), 'private, no-store');
});

test('old date passwords and incorrect passwords are rejected', async () => {
  for (const candidate of [passwords.september8, 'incorrect']) {
    const response = await worker.fetch(request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://fellowship.mintresearch.org' },
      body: new URLSearchParams({ password: candidate, next: '/adaptation/' }),
    }), environment());
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.match(await response.text(), /not recognized/);
  }
});

test('login pages identify the deck and shared permanent protection', async () => {
  const response = await worker.fetch(request('/login?next=%2Fagi-institutions%2F'), environment());
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /9\.11 · AGI Institutions/);
  assert.match(body, /view all six presentations/);
  assert.doesNotMatch(body, /opens without|6:00/);
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('wrappers and nested assets use the shared gate without any IP bypass', async () => {
  const env = environment();
  const definitionsLogin = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { Origin: 'https://fellowship.mintresearch.org' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD, next: '/definitions/' }),
  }), env);
  const cookie = definitionsLogin.headers.get('set-cookie').split(';', 1)[0];
  const definitionsPaths = [
    ['/definitions', '/fellowship/definitions/index.html'],
    ['/definitions/', '/fellowship/definitions/index.html'],
    ['/definitions/index.html', '/fellowship/definitions/index.html'],
    ['/definitions/deck.html', '/definitions/deck.html'],
    ['/definitions/deck.css', '/definitions/deck.css'],
    ['/definitions/deck.js', '/definitions/deck.js'],
    ['/definitions/pretext-layout.js', '/definitions/pretext-layout.js'],
  ];
  for (const [path, asset] of definitionsPaths) {
    const authorized = await worker.fetch(request(path, { headers: { Cookie: cookie } }), env);
    assert.equal(authorized.status, 200);
    assert.equal(await authorized.text(), `asset:${asset}`);
    assert.match(authorized.headers.get('x-robots-tag'), /noindex/);
    assert.equal(authorized.headers.get('cache-control'), 'private, no-store');
  }
  const philosophyAssets = ['deck.html', 'deck.css', 'philosophy.css', 'deck.js', 'pretext-layout.js'];
  for (const asset of philosophyAssets) {
    const bypassed = await worker.fetch(request(`/philosophy/${asset}`, {
      headers: { 'CF-Connecting-IP': '203.0.113.8' },
    }), env);
    assert.equal(bypassed.status, 303);
    assert.match(bypassed.headers.get('x-robots-tag'), /noindex/);
  }
  const head = await worker.fetch(request('/definitions/', { method: 'HEAD', headers: { Cookie: cookie } }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  for (const [path] of schedule) {
    for (const suffix of ['', 'deck.html', 'deck.css', 'deck.js', 'pretext-layout.js']) {
      for (const method of ['GET', 'HEAD']) {
        const blocked = await worker.fetch(request(path + suffix, { method, headers: { 'CF-Connecting-IP': '203.0.113.8' } }), env);
        assert.equal(blocked.status, 303, `${method} ${path}${suffix}`);
      }
    }
  }
});

test('every presentation stays gated after its former release date and in the future', async () => {
  for (const [path, , unlockAt] of schedule) {
    const unlockMs = Date.parse(unlockAt);
    const before = await worker.fetch(request(path), environment({ TEST_NOW_MS: unlockMs - 1 }));
    assert.equal(before.status, 303, `${path} must remain gated one millisecond before release`);

    for (const time of [unlockMs, Date.parse('2030-01-01')]) {
      const closed = await worker.fetch(request(path), environment({ TEST_NOW_MS: time }));
      assert.equal(closed.status, 303, path);
      assert.match(closed.headers.get('x-robots-tag'), /noindex/);
    }
  }
});

test('a missing password secret fails closed regardless of date', async () => {
  const response = await worker.fetch(request('/should-we-build-agi/'), environment({
    FELLOWSHIP_SLIDES_PASSWORD: undefined, TEST_NOW_MS: Date.parse('2030-01-01'),
  }));
  assert.equal(response.status, 503);
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('legacy paths and subdomains permanently redirect to canonical dated routes', async () => {
  const env = environment();
  const redirects = [
    ['/day-1/deck.html?old=1', 'https://fellowship.mintresearch.org/should-we-build-agi/deck.html?old=1'],
    ['/day-2/', 'https://fellowship.mintresearch.org/agi-institutions/'],
    ['/day-3/', 'https://fellowship.mintresearch.org/adaptation/'],
  ];
  for (const [from, to] of redirects) {
    const response = await worker.fetch(request(from), env);
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), to);
  }
  const legacyHost = await worker.fetch(new Request('https://agif3.mintresearch.org/deck.html?old=1'), env);
  assert.equal(legacyHost.status, 308);
  assert.equal(legacyHost.headers.get('location'), 'https://fellowship.mintresearch.org/adaptation/?old=1');
});

test('robots excludes every canonical and legacy route; unknown hosts fail closed', async () => {
  const env = environment();
  const robots = await worker.fetch(request('/robots.txt'), env);
  const robotsText = await robots.text();
  for (const route of [
    '/definitions/', '/philosophy/', '/projects/', '/should-we-build-agi/',
    '/agi-institutions/', '/adaptation/', '/day-1/', '/day-2/', '/day-3/',
  ]) assert.ok(robotsText.includes(`Disallow: ${route}`), route);
  assert.match(robotsText, /Sitemap: https:\/\/fellowship\.mintresearch\.org\/sitemap\.xml/);

  const unknown = await worker.fetch(new Request('https://example.com/'), env);
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('x-robots-tag'), /noindex/);
});

test('editor reads follow the presentation gate and expose controls only on the allowed IP', async () => {
  const env = environment();
  const endpoint = '/editor/v1/decks/philosophy';
  const blocked = await worker.fetch(request(endpoint), env);
  assert.equal(blocked.status, 401);
  assert.deepEqual(await blocked.json(), { error: 'Authentication required' });

  const login = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { Origin: 'https://fellowship.mintresearch.org' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD, next: '/philosophy/' }),
  }), env);
  const cookie = login.headers.get('set-cookie').split(';', 1)[0];
  const reader = await worker.fetch(request(endpoint, { headers: { Cookie: cookie } }), env);
  assert.equal(reader.status, 200);
  assert.deepEqual(await reader.json(), {
    revision: 'base', updatedAt: null, fields: {}, canEdit: false, canRequestEdit: false,
  });
  assert.match(reader.headers.get('x-robots-tag'), /noindex/);
  assert.equal(reader.headers.get('cache-control'), 'private, no-store');

  const editor = await worker.fetch(request(endpoint, {
    headers: { Cookie: cookie, 'CF-Connecting-IP': '203.0.113.8' },
  }), env);
  assert.equal(editor.status, 200);
  assert.deepEqual(await editor.json(), {
    revision: 'base', updatedAt: null, fields: {}, canEdit: false, canRequestEdit: true,
  });
});

test('editor authentication requires the separate owner password and works from any network', async () => {
  const env = environment();
  const presentationPassword = await requestEditorSession(env, env.FELLOWSHIP_SLIDES_PASSWORD);
  assert.equal(presentationPassword.status, 401);
  assert.equal(presentationPassword.headers.get('set-cookie'), null);

  const otherIp = await worker.fetch(request('/editor/v1/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://fellowship.mintresearch.org',
      'CF-Connecting-IP': '198.51.100.4',
    },
    body: JSON.stringify({ password: env.FELLOWSHIP_EDITOR_PASSWORD }),
  }), env);
  assert.equal(otherIp.status, 200);

  const authenticated = await requestEditorSession(env);
  assert.equal(authenticated.status, 200);
  assert.match(authenticated.headers.get('set-cookie'), /^mint_fellowship_editor=/);
  assert.match(authenticated.headers.get('set-cookie'), /HttpOnly/);
  assert.match(authenticated.headers.get('set-cookie'), /SameSite=Strict/);
});

test('same-origin saves require editor authentication and persist per deck with revision history', async () => {
  const env = environment();
  const endpoint = '/editor/v1/decks/definitions';
  const fields = { 's03-1234abcd-01': 'Sharper wording' };
  const payload = JSON.stringify({ revision: 'base', fields });
  const baseHeaders = { 'Content-Type': 'application/json' };

  const otherOrigin = await worker.fetch(request(endpoint, {
    method: 'PUT',
    headers: { ...baseHeaders, Origin: 'https://example.com', 'CF-Connecting-IP': '203.0.113.8' },
    body: payload,
  }), env);
  assert.equal(otherOrigin.status, 403);

  const otherIp = await worker.fetch(request(endpoint, {
    method: 'PUT',
    headers: { ...baseHeaders, Origin: 'https://fellowship.mintresearch.org', 'CF-Connecting-IP': '198.51.100.4' },
    body: payload,
  }), env);
  assert.equal(otherIp.status, 403);

  const unauthenticated = await worker.fetch(request(endpoint, {
    method: 'PUT',
    headers: { ...baseHeaders, Origin: 'https://fellowship.mintresearch.org', 'CF-Connecting-IP': '203.0.113.8' },
    body: payload,
  }), env);
  assert.equal(unauthenticated.status, 403);

  const editorLogin = await requestEditorSession(env);
  const editorCookie = editorLogin.headers.get('set-cookie').split(';', 1)[0];

  const saved = await worker.fetch(request(endpoint, {
    method: 'PUT',
    headers: { ...baseHeaders, Origin: 'https://fellowship.mintresearch.org', 'CF-Connecting-IP': '198.51.100.4', Cookie: editorCookie },
    body: payload,
  }), env);
  assert.equal(saved.status, 200);
  const savedState = await saved.json();
  assert.equal(savedState.ok, true);
  assert.deepEqual(savedState.fields, fields);
  assert.notEqual(savedState.revision, 'base');
  assert.ok(env.CONTENT_OVERRIDES.values.has('deck:definitions:current'));
  assert.ok(env.CONTENT_OVERRIDES.values.has(`deck:definitions:history:${savedState.revision}`));

  const reader = await worker.fetch(request(endpoint, {
    headers: { 'CF-Connecting-IP': '203.0.113.8', Cookie: editorCookie },
  }), env);
  const readerState = await reader.json();
  assert.deepEqual(readerState.fields, fields);
  assert.equal(readerState.canEdit, true);
});

test('one owner form login grants all six decks and the bibliography across networks', async () => {
  const env = environment({ BIBLIOGRAPHY: { fetch: async () => new Response('owner bibliography') } });
  const login = await worker.fetch(request('/owner/login', {
    method: 'POST', headers: { Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': '198.51.100.4' },
    body: new URLSearchParams({ password: env.FELLOWSHIP_EDITOR_PASSWORD, next: '/bibliography/edit/' }),
  }), env);
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('location'), '/bibliography/edit/');
  assert.match(login.headers.get('set-cookie'), /Max-Age=2592000; Path=\/; HttpOnly; Secure; SameSite=Strict/);
  const headers = { Cookie: login.headers.get('set-cookie').split(';')[0], 'CF-Connecting-IP': '192.0.2.73' };
  for (const [path] of schedule) {
    assert.equal((await worker.fetch(request(path, { headers }), env)).status, 200);
    const state = await (await worker.fetch(request('/editor/v1/decks' + path.slice(0, -1), { headers }), env)).json();
    assert.equal(state.canEdit, true);
    assert.equal(state.canRequestEdit, true);
  }
  assert.equal(await (await worker.fetch(request('/bibliography/edit/', { headers }), env)).text(), 'owner bibliography');
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state', { method: 'PUT', headers: { ...headers, Origin: 'https://evil.example' }, body: '{}' }), env)).status, 403);
  assert.equal((await worker.fetch(request('/owner/login', { headers }), env)).status, 303);
  const logout = await worker.fetch(request('/owner/logout', { method: 'POST', headers: { ...headers, Origin: 'https://fellowship.mintresearch.org' } }), env);
  assert.equal(logout.status, 303);
  assert.match(logout.headers.get('set-cookie'), /mint_fellowship_editor=; Max-Age=0/);
  assert.equal((await worker.fetch(request('/owner/logout', { headers }), env)).status, 405);
  const expired = { ...env, TEST_NOW_MS: env.TEST_NOW_MS + 31 * 86400000 };
  assert.equal((await worker.fetch(request('/editor/v1/decks/definitions', { headers }), expired)).status, 401);
  assert.equal((await worker.fetch(request('/bibliography/api/editor/state', { headers }), { ...env, FELLOWSHIP_EDITOR_PASSWORD: 'rotated-test-secret' })).status, 401);
});

test('owner login rejects forged origins, wrong passwords and rate-limited attempts', async () => {
  const env = environment();
  const init = { method: 'POST', headers: { Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ password: passwords.september8 }) };
  assert.equal((await worker.fetch(request('/owner/login', init), env)).status, 401);
  assert.equal((await worker.fetch(request('/owner/login', { ...init, headers: { ...init.headers, Origin: 'https://evil.example' } }), env)).status, 403);
  const limited = { ...env, OWNER_LOGIN_LIMITER: { limit: async () => ({ success: false }) } };
  const response = await worker.fetch(request('/owner/login', init), limited);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
  assert.equal((await requestEditorSession(limited)).status, 429);
  assert.equal((await worker.fetch(request('/owner/login', init), { ...env, OWNER_LOGIN_LIMITER: undefined })).status, 503);
  const page = await worker.fetch(request('/owner/login?next=https://evil.example'), env);
  assert.match(await page.text(), /name="next" value="\/"/);
  assert.match(page.headers.get('x-robots-tag'), /noindex/);
});

test('editor rejects stale revisions and invalid fields', async () => {
  const env = environment();
  const endpoint = '/editor/v1/decks/adaptation';
  const headers = {
    'Content-Type': 'application/json',
    Origin: 'https://fellowship.mintresearch.org',
    'CF-Connecting-IP': '203.0.113.8',
  };
  const editorLogin = await requestEditorSession(env);
  headers.Cookie = editorLogin.headers.get('set-cookie').split(';', 1)[0];
  const save = (body) => worker.fetch(request(endpoint, {
    method: 'PUT', headers, body: JSON.stringify(body),
  }), env);

  const invalid = await save({ revision: 'base', fields: { arbitrary: 'text' } });
  assert.equal(invalid.status, 400);
  const tooManyFields = Object.fromEntries(Array.from({ length: 385 }, (_, index) => [
    `s${String((index % 99) + 1).padStart(2, '0')}-${index.toString(16).padStart(8, '0')}-01`,
    'text',
  ]));
  const tooMany = await save({ revision: 'base', fields: tooManyFields });
  assert.equal(tooMany.status, 400);
  await save({ revision: 'base', fields: { 's01-1234abcd-01': 'First edit' } });
  const stale = await save({ revision: 'base', fields: { 's01-1234abcd-01': 'Stale edit' } });
  assert.equal(stale.status, 409);
  assert.match((await stale.json()).error, /changed elsewhere/);
});

test('editor overrides remain protected after former opening dates', async () => {
  const env = environment({ TEST_NOW_MS: Date.parse('2026-09-14T06:00:00-04:00') });
  await env.CONTENT_OVERRIDES.put('deck:adaptation:current', JSON.stringify({
    revision: 'saved', updatedAt: '2026-09-07T16:00:00.000Z', fields: { 's01-1234abcd-01': 'Live copy' },
  }));
  const response = await worker.fetch(request('/editor/v1/decks/adaptation'), env);
  assert.equal(response.status, 401);
  const state = await (await worker.fetch(request('/editor/v1/decks/adaptation', { headers: { Cookie: await viewerCookie(env) } }), env)).json();
  assert.equal(state.fields['s01-1234abcd-01'], 'Live copy');
  assert.equal(state.canEdit, false);
  assert.equal(state.canRequestEdit, false);
});

test('old date-specific sessions cannot grant shared viewing access', async () => {
  const env = environment();
  const expiry = Math.floor(env.TEST_NOW_MS / 1000) + 3600;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passwords.september9), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`agif:2026-09-09:${expiry}`))).toString('base64url');
  for (const name of ['mint_fellowship_session_2026_09_09', 'mint_fellowship_session_slides']) {
    const headers = { Cookie: `${name}=${expiry}.${signature}` };
    assert.equal((await worker.fetch(request('/philosophy/', { headers }), env)).status, 303);
    assert.equal((await worker.fetch(request('/editor/v1/decks/philosophy', { headers }), env)).status, 401);
  }
});

test('viewer login validates origin and rate limits without granting editing', async () => {
  const env = environment();
  const init = { method: 'POST', headers: { Origin: 'https://fellowship.mintresearch.org' }, body: new URLSearchParams({ password: env.FELLOWSHIP_SLIDES_PASSWORD, next: '/' }) };
  assert.equal((await worker.fetch(request('/login', { ...init, headers: {} }), env)).status, 403);
  assert.equal((await worker.fetch(request('/login', { ...init, headers: { Origin: 'https://evil.example' } }), env)).status, 403);
  assert.equal((await worker.fetch(request('/login', init), { ...env, OWNER_LOGIN_LIMITER: { limit: async () => ({ success: false }) } })).status, 429);
  assert.equal((await worker.fetch(request('/login', init), { ...env, OWNER_LOGIN_LIMITER: undefined })).status, 503);
  const cookie = await viewerCookie(env);
  assert.equal((await worker.fetch(request('/editor/v1/decks/definitions', { method: 'PUT', headers: { Cookie: cookie, Origin: 'https://fellowship.mintresearch.org', 'Content-Type': 'application/json' }, body: '{}' }), env)).status, 403);
  for (const path of ['/', '/definitions/', '/editor/v1/decks/definitions', '/login']) {
    assert.equal((await worker.fetch(request(path), { ...env, FELLOWSHIP_SLIDES_PASSWORD: undefined })).status, 503);
  }
});

test('write methods are allowed only for the login form', async () => {
  const protectedWrite = await worker.fetch(request('/should-we-build-agi/', { method: 'POST' }), environment());
  assert.equal(protectedWrite.status, 405);
  assert.equal(protectedWrite.headers.get('allow'), 'GET, HEAD');

  const unknownWrite = await worker.fetch(request('/anything', { method: 'POST' }), environment());
  assert.equal(unknownWrite.status, 405);
  assert.equal(unknownWrite.headers.get('allow'), 'GET, HEAD');
});
