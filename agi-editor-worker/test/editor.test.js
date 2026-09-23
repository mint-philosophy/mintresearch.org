import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

class MemoryKV {
  constructor() {
    this.values = new Map();
    this.reads = 0;
  }

  async get(key, type) {
    this.reads += 1;
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, value);
  }
}

const origin = 'https://mintresearch.org';
const fellowshipOrigin = 'https://fellowship.mintresearch.org';
const endpoint = 'https://agi-editor.mintresearch.org/v1/decks/should-we-build-agi';

function environment() {
  return {
    ALLOWED_ORIGINS: `${origin},https://www.mintresearch.org,${fellowshipOrigin}`,
    CONTENT_OVERRIDES: new MemoryKV(),
  };
}

function request(method, ip, body, requestOrigin = origin) {
  const headers = { Origin: requestOrigin, 'CF-Connecting-IP': ip };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return new Request(endpoint, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

for (const requestOrigin of [origin, 'https://www.mintresearch.org', fellowshipOrigin]) {
  test(`legacy reads are retired without accessing saved text for ${requestOrigin}`, async () => {
    const env = environment();
    await env.CONTENT_OVERRIDES.put('deck:should-we-build-agi:current', JSON.stringify({
      revision: 'saved', fields: { 's03-1234abcd-01': 'Private slide text' },
    }));
    for (const ip of ['198.51.100.4', '203.0.113.8']) {
      const response = await worker.fetch(request('GET', ip, undefined, requestOrigin), env);
      assert.equal(response.status, 410);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), requestOrigin);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), { error: 'This legacy editor endpoint is retired' });
    }
    assert.equal(env.CONTENT_OVERRIDES.reads, 0);
  });
}

test('missing and unapproved origins cannot read saved text', async () => {
  const env = environment();
  for (const requestOrigin of ['', 'https://example.com']) {
    const response = await worker.fetch(request('GET', '198.51.100.4', undefined, requestOrigin), env);
    assert.equal(response.status, 403);
    assert.equal(await response.text(), 'Forbidden');
  }
  assert.equal(env.CONTENT_OVERRIDES.reads, 0);
});

test('the legacy save route is permanently read-only', async () => {
  const env = environment();
  const body = { revision: 'base', fields: { 's03-1234abcd-01': 'New wording' } };
  const response = await worker.fetch(request('PUT', '203.0.113.8', body), env);
  assert.equal(response.status, 410);
  assert.match((await response.json()).error, /read-only/);
  assert.equal((await worker.fetch(request('PUT', '203.0.113.8', body, 'https://example.com'), env)).status, 403);
});
