import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../public/assets/contact-form.js', import.meta.url), 'utf8');
function client(fetch) {
  let handler;
  const status = { style: {}, setAttribute() {} };
  const button = { disabled: false };
  const form = {
    action: 'https://contact.example.org/contact', resets: 0,
    querySelector: (selector) => selector.startsWith('button') ? button : { append() {} },
    addEventListener: (_, listener) => { handler = listener; },
    reportValidity: () => true, setAttribute() {}, removeAttribute() {},
    reset() { this.resets++; },
  };
  vm.runInNewContext(source, {
    document: { querySelector: () => form, createElement: () => status },
    fetch, URLSearchParams, AbortController, setTimeout, clearTimeout,
    FormData: class { *[Symbol.iterator]() { yield ['message', 'Retain my message']; } },
  });
  return { status, button, form, submit: () => handler({ preventDefault() {} }) };
}
test('successful submission stays on the page and clears the form', async () => {
  const ui = client(async (url, options) => {
    assert.equal(url, 'https://contact.example.org/contact');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.body.get('message'), 'Retain my message');
    return Response.json({ ok: true, message: 'Submitted.' });
  });
  await ui.submit();
  assert.equal(ui.form.resets, 1);
  assert.equal(ui.status.textContent, 'Submitted.');
  assert.equal(ui.button.disabled, false);
});
test('HTTP and network failures preserve input and restore the send button', async () => {
  for (const fetch of [async () => Response.json({ ok: false, message: 'Please try later.' }, { status: 503 }), async () => { throw new Error('offline'); }, async () => new Response('bad gateway', { status: 502 })]) {
    const ui = client(fetch);
    await ui.submit();
    assert.equal(ui.form.resets, 0);
    assert.equal(ui.button.disabled, false);
    assert.notEqual(ui.status.textContent, 'Sending...');
  }
});
test('repeated clicks do not submit twice while a request is pending', async () => {
  let resolve;
  let calls = 0;
  const ui = client(() => { calls++; return new Promise((done) => { resolve = done; }); });
  const pending = ui.submit();
  await ui.submit();
  assert.equal(calls, 1);
  assert.equal(ui.button.disabled, true);
  resolve(Response.json({ ok: true, message: 'Submitted.' }));
  await pending;
});
