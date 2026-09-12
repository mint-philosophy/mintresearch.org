import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const valid = { name: 'Test Visitor', email: 'visitor@example.org', affiliation: 'Test lab', message: 'A test inquiry.' };
function request(values = valid, headers = {}, path = '/contact') {
  return new Request(`https://contact.example.org${path}`, {
    method: 'POST', headers: { Origin: 'https://mintresearch.org', Accept: 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers },
    body: new URLSearchParams(values),
  });
}
function environment() {
  const sent = [];
  return { sent, CONTACT_TO: 'owner@example.org', CONTACT_FROM: 'website@example.org',
    CONTACT_RATE_LIMIT: { limit: async () => ({ success: true }) },
    EMAIL: { send: async (message) => { sent.push(message); return { messageId: 'accepted' }; } },
  };
}
test('delivers only to the configured inbox with visitor reply-to and plain text', async () => {
  const env = environment();
  const response = await worker.fetch(request({ ...valid, to: 'attacker@example.org', message: '<img src=x onerror=alert(1)>\nUnicode: café' }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(env.sent.length, 1);
  assert.equal(env.sent[0].to, 'owner@example.org');
  assert.equal(env.sent[0].replyTo, valid.email);
  assert.match(env.sent[0].text, /Unicode: café/);
  assert.equal(env.sent[0].html, undefined);
});
test('does not send on missing fields, header injection, invalid email or oversized fields', async () => {
  for (const values of [{ ...valid, name: '' }, { ...valid, name: 'a\r\nBcc: b@example.org' }, { ...valid, email: 'a@b.org,c@d.org' }, { ...valid, message: 'x'.repeat(8001) }]) {
    const env = environment();
    assert.equal((await worker.fetch(request(values), env)).status, 400);
    assert.equal(env.sent.length, 0);
  }
});
test('rejects foreign and missing origins, unsupported routes and media types', async () => {
  const env = environment();
  assert.equal((await worker.fetch(request(valid, { Origin: 'https://evil.example' }), env)).status, 403);
  assert.equal((await worker.fetch(request(valid, { Origin: '' }), env)).status, 403);
  assert.equal((await worker.fetch(request(valid, {}, '/other'), env)).status, 404);
  assert.equal((await worker.fetch(request(valid, { 'Content-Type': 'application/json' }), env)).status, 415);
  assert.equal(env.sent.length, 0);
});
test('rejects repeated fields and oversized bodies without relying on content-length', async () => {
  const env = environment();
  assert.equal((await worker.fetch(request([...Object.entries(valid), ['email', 'second@example.org']]), env)).status, 400);
  assert.equal((await worker.fetch(request({ ...valid, message: 'x'.repeat(50000) }), env)).status, 413);
  assert.equal(env.sent.length, 0);
});
test('spam trap and rate limit prevent email delivery', async () => {
  const env = environment();
  assert.equal((await worker.fetch(request({ ...valid, _honey: 'spam' }), env)).status, 200);
  env.CONTACT_RATE_LIMIT.limit = async () => ({ success: false });
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(env.sent.length, 0);
});
test('provider failures and incomplete configuration never claim success', async () => {
  for (const override of [
    { CONTACT_TO: '' }, { CONTACT_RATE_LIMIT: undefined },
    { EMAIL: { send: async () => { throw new Error('private provider error'); } } },
    { EMAIL: { send: async () => ({}) } },
  ]) {
    const response = await worker.fetch(request(), { ...environment(), ...override });
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.doesNotMatch(body.message, /private provider error/);
  }
});
test('native form fallback is ad-free and does not reflect submitted HTML', async () => {
  const response = await worker.fetch(request({ ...valid, name: '<script>alert(1)</script>' }, { Accept: 'text/html' }), environment());
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Security-Policy'), /default-src 'none'/);
  const html = await response.text();
  assert.match(html, /https:\/\/mintresearch.org\/#contact/);
  assert.doesNotMatch(html, /<script>|formsubmit/i);
});
test('preflight allows only the main site', async () => {
  const response = await worker.fetch(new Request('https://contact.example.org/contact', { method: 'OPTIONS', headers: { Origin: 'https://mintresearch.org' } }), environment());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://mintresearch.org');
});
