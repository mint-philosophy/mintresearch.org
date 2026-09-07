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

test('public readers receive overrides without edit authority', async () => {
  const response = await worker.fetch(request('GET', '198.51.100.4'), environment());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { revision: 'base', updatedAt: null, fields: {}, canEdit: false });
});

test('the former configured IP no longer receives edit authority', async () => {
  const response = await worker.fetch(request('GET', '203.0.113.8'), environment());
  assert.equal((await response.json()).canEdit, false);
});

test('the Fellowship host is an allowed editor origin', async () => {
  const response = await worker.fetch(request('GET', '203.0.113.8', undefined, fellowshipOrigin), environment());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), fellowshipOrigin);
  assert.equal((await response.json()).canEdit, false);
});

test('the legacy save route is permanently read-only', async () => {
  const env = environment();
  const body = { revision: 'base', fields: { 's03-1234abcd-01': 'New wording' } };
  const response = await worker.fetch(request('PUT', '203.0.113.8', body), env);
  assert.equal(response.status, 410);
  assert.match((await response.json()).error, /read-only/);
  assert.equal((await worker.fetch(request('PUT', '203.0.113.8', body, 'https://example.com'), env)).status, 403);
});
