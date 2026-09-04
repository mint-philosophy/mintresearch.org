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
    ALLOWED_IPS: '203.0.113.8',
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

test('the configured IP receives edit authority', async () => {
  const response = await worker.fetch(request('GET', '203.0.113.8'), environment());
  assert.equal((await response.json()).canEdit, true);
});

test('the Fellowship host is an allowed editor origin', async () => {
  const response = await worker.fetch(request('GET', '203.0.113.8', undefined, fellowshipOrigin), environment());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), fellowshipOrigin);
  assert.equal((await response.json()).canEdit, true);
});

test('save is rejected from another IP and another origin', async () => {
  const env = environment();
  const body = { revision: 'base', fields: { 's03-1234abcd-01': 'New wording' } };
  assert.equal((await worker.fetch(request('PUT', '198.51.100.4', body), env)).status, 403);
  assert.equal((await worker.fetch(request('PUT', '203.0.113.8', body, 'https://example.com'), env)).status, 403);
});

test('an authorized save becomes the public override', async () => {
  const env = environment();
  const fields = { 's03-1234abcd-01': 'This is implausibly fatalistic.' };
  const saved = await worker.fetch(request('PUT', '203.0.113.8', { revision: 'base', fields }), env);
  assert.equal(saved.status, 200);
  const savedBody = await saved.json();
  assert.equal(savedBody.ok, true);
  assert.notEqual(savedBody.revision, 'base');

  const publicResponse = await worker.fetch(request('GET', '198.51.100.4'), env);
  const publicBody = await publicResponse.json();
  assert.deepEqual(publicBody.fields, fields);
  assert.equal(publicBody.canEdit, false);
});

test('a stale revision cannot overwrite a newer edit', async () => {
  const env = environment();
  const fields = { 's03-1234abcd-01': 'First edit' };
  await worker.fetch(request('PUT', '203.0.113.8', { revision: 'base', fields }), env);
  const stale = await worker.fetch(request('PUT', '203.0.113.8', { revision: 'base', fields }), env);
  assert.equal(stale.status, 409);
});

test('field keys and field lengths are bounded', async () => {
  const env = environment();
  const invalidKey = await worker.fetch(request('PUT', '203.0.113.8', {
    revision: 'base',
    fields: { arbitrary: 'text' },
  }), env);
  assert.equal(invalidKey.status, 400);

  const tooLong = await worker.fetch(request('PUT', '203.0.113.8', {
    revision: 'base',
    fields: { 's03-1234abcd-01': 'x'.repeat(2_001) },
  }), env);
  assert.equal(tooLong.status, 400);
});
