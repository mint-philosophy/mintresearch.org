import assert from 'node:assert/strict';
import test from 'node:test';

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
    FELLOWSHIP_PASSWORD_SEPTEMBER_8: passwords.september8,
    FELLOWSHIP_PASSWORD_SEPTEMBER_9: passwords.september9,
    FELLOWSHIP_PASSWORD_SEPTEMBER_10: passwords.september10,
    FELLOWSHIP_PASSWORD_SEPTEMBER_11: passwords.september11,
    FELLOWSHIP_PASSWORD_SEPTEMBER_14: passwords.september14,
    FELLOWSHIP_EDITOR_PASSWORD: 'test-editor-only-password',
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

test('the Fellowship overview is public and served from the dedicated shell', async () => {
  const response = await worker.fetch(request('/'), environment());
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'asset:/fellowship/index.html');
  assert.equal(response.headers.get('x-robots-tag'), null);
});

const schedule = [
  ['/definitions/', '/fellowship/definitions/index.html', '2026-09-08T06:00:00-04:00'],
  ['/philosophy/', '/fellowship/philosophy/index.html', '2026-09-09T06:00:00-04:00'],
  ['/projects/', '/fellowship/projects/index.html', '2026-09-09T06:00:00-04:00'],
  ['/should-we-build-agi/', '/fellowship/day-1/index.html', '2026-09-10T06:00:00-04:00'],
  ['/agi-institutions/', '/fellowship/day-2/index.html', '2026-09-11T06:00:00-04:00'],
  ['/adaptation/', '/fellowship/day-3/index.html', '2026-09-14T06:00:00-04:00'],
];

test('every scheduled presentation is gated before its date', async () => {
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

test('password sessions are date-specific and the two September 9 presentations share access', async () => {
  const env = environment();
  const login = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password: passwords.september9, next: '/philosophy/' }),
  }), env);
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('location'), '/philosophy/');
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /^mint_fellowship_session_2026_09_09=/);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Strict/);

  const cookie = setCookie.split(';', 1)[0];
  const philosophy = await worker.fetch(request('/philosophy/deck.css', { headers: { Cookie: cookie } }), env);
  const projects = await worker.fetch(request('/projects/', { headers: { Cookie: cookie } }), env);
  const nextDay = await worker.fetch(request('/should-we-build-agi/', { headers: { Cookie: cookie } }), env);
  assert.equal(await philosophy.text(), 'asset:/philosophy/deck.css');
  assert.equal(await projects.text(), 'asset:/fellowship/projects/index.html');
  assert.equal(nextDay.status, 303);
  assert.match(projects.headers.get('x-robots-tag'), /noindex/);
  assert.equal(projects.headers.get('cache-control'), 'private, no-store');
});

test('a password for another date and an incorrect password are rejected', async () => {
  for (const candidate of [passwords.september8, 'incorrect']) {
    const response = await worker.fetch(request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ password: candidate, next: '/adaptation/' }),
    }), environment());
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.match(await response.text(), /not recognized/);
  }
});

test('login pages identify the date and automatic opening time', async () => {
  const response = await worker.fetch(request('/login?next=%2Fagi-institutions%2F'), environment());
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /9\.11 · AGI Institutions/);
  assert.match(body, /6:00 a\.m\. ET on September 11/);
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('wrappers and nested assets use their date gate, IP bypass, and noindex policy', async () => {
  const env = environment();
  const definitionsLogin = await worker.fetch(request('/login', {
    method: 'POST',
    body: new URLSearchParams({ password: passwords.september8, next: '/definitions/' }),
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
    assert.equal(await bypassed.text(), `asset:/philosophy/${asset}`);
    assert.match(bypassed.headers.get('x-robots-tag'), /noindex/);
  }
  const head = await worker.fetch(request('/definitions/', { method: 'HEAD', headers: { Cookie: cookie } }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('each presentation opens automatically at exactly 6 a.m. Eastern on its date', async () => {
  for (const [path, asset, unlockAt] of schedule) {
    const unlockMs = Date.parse(unlockAt);
    const before = await worker.fetch(request(path), environment({ TEST_NOW_MS: unlockMs - 1 }));
    assert.equal(before.status, 303, `${path} must remain gated one millisecond before release`);

    const open = await worker.fetch(request(path), environment({
      TEST_NOW_MS: unlockMs,
      FELLOWSHIP_PASSWORD_SEPTEMBER_8: undefined,
      FELLOWSHIP_PASSWORD_SEPTEMBER_9: undefined,
      FELLOWSHIP_PASSWORD_SEPTEMBER_10: undefined,
      FELLOWSHIP_PASSWORD_SEPTEMBER_11: undefined,
      FELLOWSHIP_PASSWORD_SEPTEMBER_14: undefined,
    }));
    assert.equal(open.status, 200, `${path} must open at release time without a secret`);
    assert.equal(await open.text(), `asset:${asset}`);
    assert.match(open.headers.get('x-robots-tag'), /noindex/);
  }
});

test('a missing password secret fails closed before release', async () => {
  const response = await worker.fetch(request('/should-we-build-agi/'), environment({
    FELLOWSHIP_PASSWORD_SEPTEMBER_10: undefined,
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
    body: new URLSearchParams({ password: passwords.september9, next: '/philosophy/' }),
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
    headers: { 'CF-Connecting-IP': '203.0.113.8' },
  }), env);
  assert.equal(editor.status, 200);
  assert.deepEqual(await editor.json(), {
    revision: 'base', updatedAt: null, fields: {}, canEdit: false, canRequestEdit: true,
  });
});

test('editor authentication requires both the allowed IP and the separate editor password', async () => {
  const env = environment();
  const presentationPassword = await requestEditorSession(env, passwords.september9);
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
  assert.equal(otherIp.status, 403);

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
    headers: { ...baseHeaders, Origin: 'https://fellowship.mintresearch.org', 'CF-Connecting-IP': '203.0.113.8', Cookie: editorCookie },
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

test('editor overrides become readable without a password when a deck opens', async () => {
  const env = environment({ TEST_NOW_MS: Date.parse('2026-09-14T06:00:00-04:00') });
  await env.CONTENT_OVERRIDES.put('deck:adaptation:current', JSON.stringify({
    revision: 'saved', updatedAt: '2026-09-07T16:00:00.000Z', fields: { 's01-1234abcd-01': 'Live copy' },
  }));
  const response = await worker.fetch(request('/editor/v1/decks/adaptation'), env);
  assert.equal(response.status, 200);
  const state = await response.json();
  assert.equal(state.fields['s01-1234abcd-01'], 'Live copy');
  assert.equal(state.canEdit, false);
  assert.equal(state.canRequestEdit, false);
});

test('write methods are allowed only for the login form', async () => {
  const protectedWrite = await worker.fetch(request('/should-we-build-agi/', { method: 'POST' }), environment());
  assert.equal(protectedWrite.status, 405);
  assert.equal(protectedWrite.headers.get('allow'), 'GET, HEAD');

  const unknownWrite = await worker.fetch(request('/anything', { method: 'POST' }), environment());
  assert.equal(unknownWrite.status, 405);
  assert.equal(unknownWrite.headers.get('allow'), 'GET, HEAD');
});
