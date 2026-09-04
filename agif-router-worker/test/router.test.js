import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const password = 'test-only-password';

function environment() {
  return {
    FELLOWSHIP_PASSWORD: password,
    ALLOWED_IPS: '203.0.113.8',
    ASSETS: {
      async fetch(request) {
        const path = new URL(request.url).pathname;
        return new Response(request.method === 'HEAD' ? null : `asset:${path}`, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  };
}

function request(path, options = {}) {
  return new Request(`https://fellowship.mintresearch.org${path}`, options);
}

test('the Fellowship overview is public and served from the dedicated shell', async () => {
  const response = await worker.fetch(request('/'), environment());
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'asset:/fellowship/index.html');
  assert.equal(response.headers.get('x-robots-tag'), null);
});

test('protected day routes redirect to the password form', async () => {
  const response = await worker.fetch(request('/day-2/?from=hub'), environment());
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get('location'),
    'https://fellowship.mintresearch.org/login?next=%2Fday-2%2F%3Ffrom%3Dhub',
  );
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
});

test('a correct password creates a secure session that opens every day', async () => {
  const login = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password, next: '/day-1/' }),
  }), environment());
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('location'), '/day-1/');
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Strict/);

  const cookie = setCookie.split(';', 1)[0];
  const day1 = await worker.fetch(request('/day-1/', { headers: { Cookie: cookie } }), environment());
  const day3Asset = await worker.fetch(request('/day-3/deck.css', { headers: { Cookie: cookie } }), environment());
  assert.equal(await day1.text(), 'asset:/fellowship/day-1/index.html');
  assert.equal(await day3Asset.text(), 'asset:/societal-adaptation/deck.css');
  assert.match(day1.headers.get('x-robots-tag'), /noindex/);
  assert.equal(day1.headers.get('cache-control'), 'private, no-store');
});

test('an incorrect password is rejected without a session cookie', async () => {
  const response = await worker.fetch(request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password: 'incorrect', next: '/day-3/' }),
  }), environment());
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.match(await response.text(), /not recognized/);
});

test('the configured IP bypasses the password gate', async () => {
  const response = await worker.fetch(request('/day-2/deck.html', {
    headers: { 'CF-Connecting-IP': '203.0.113.8' },
  }), environment());
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'asset:/agi-institutions/deck.html');
});

test('legacy subdomains redirect to the protected Fellowship pages', async () => {
  const env = environment();
  const legacy = await worker.fetch(new Request('https://agif3.mintresearch.org/deck.html?old=1'), env);
  assert.equal(legacy.status, 308);
  assert.equal(legacy.headers.get('location'), 'https://fellowship.mintresearch.org/day-3/?old=1');
});

test('robots indexes only the public overview and unknown hosts fail closed', async () => {
  const env = environment();
  const robots = await worker.fetch(request('/robots.txt'), env);
  const robotsText = await robots.text();
  assert.match(robotsText, /Disallow: \/day-1\//);
  assert.match(robotsText, /Sitemap: https:\/\/fellowship\.mintresearch\.org\/sitemap\.xml/);

  const unknown = await worker.fetch(new Request('https://example.com/'), env);
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('x-robots-tag'), /noindex/);
});

test('write methods are allowed only for the login form', async () => {
  const protectedWrite = await worker.fetch(request('/day-1/', { method: 'POST' }), environment());
  assert.equal(protectedWrite.status, 405);
  assert.equal(protectedWrite.headers.get('allow'), 'GET, HEAD');

  const unknownWrite = await worker.fetch(request('/anything', { method: 'POST' }), environment());
  assert.equal(unknownWrite.status, 405);
  assert.equal(unknownWrite.headers.get('allow'), 'GET, HEAD');
});
