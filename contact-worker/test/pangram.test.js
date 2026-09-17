import test from 'node:test';
import assert from 'node:assert/strict';
import { createPangramScreen, PangramError } from '../src/pangram.js';
import { result, provider } from './pangram-fixtures.js';

test('polls pending tasks to success on the fixed endpoint', async () => {
  let clock = 0;
  const calls = [];
  const responses = [{ task_id: 'task-123' }, { task_id: 'task-123', stage: 'STAGE_PREPROCESSING' }, result()];
  const screen = createPangramScreen({
    now: () => clock,
    sleep: async (ms) => { clock += ms; },
    fetchImpl: async (url, options) => { calls.push({ url, options }); return Response.json(responses.shift()); },
  });
  assert.deepEqual(await screen('Text', 'test-key'), { aiGenerated: false });
  assert.deepEqual(calls.map((call) => call.url), [
    'https://text.external-api.pangram.com/task',
    'https://text.external-api.pangram.com/task/task-123',
    'https://text.external-api.pangram.com/task/task-123',
  ]);
  assert.equal(clock, 500);
});

test('requires valid, consistent numeric classification and result shape', async () => {
  for (const overrides of [
    { fraction_ai: null }, { fraction_ai: '0' }, { fraction_ai: NaN },
    { fraction_human: 1.2 }, { fraction_human: 0.3 }, { fraction_ai: -1 },
    { num_ai_segments: 1 }, { num_human_segments: 0 }, { num_human_segments: 0.5 },
    { num_ai_segments: undefined }, { fraction_ai_assisted: undefined },
    { windows: {} }, { text: '' }, { prediction_short: '' },
  ]) {
    await assert.rejects(createPangramScreen(provider(result(overrides)))('Text', 'test-key'));
  }
});

test('invalid task IDs, mismatched tasks, invalid JSON and malformed task states fail', async () => {
  for (const response of [{}, { task_id: '../other' }, { task_id: 'https://evil.example' }]) {
    await assert.rejects(createPangramScreen({ fetchImpl: async () => Response.json(response) })('Text', 'test-key'));
  }
  for (const completed of [{}, [], null, { stage: 'unknown' }, { stage: 'STAGE_PREPROCESSING', task_id: 'different' }]) {
    await assert.rejects(createPangramScreen(provider(completed))('Text', 'test-key'));
  }
  await assert.rejects(createPangramScreen({ fetchImpl: async () => new Response('not JSON') })('Text', 'test-key'));
});

test('missing key makes no requests', async () => {
  const mock = provider();
  for (const key of [undefined, '', '   ']) await assert.rejects(createPangramScreen(mock)('Text', key));
  assert.equal(mock.calls.length, 0);
});

test('deadline bounds stalled fetch and body reads and aborts the provider request', async () => {
  for (const stallBody of [false, true]) {
    let signal;
    const screen = createPangramScreen({ deadlineMs: 10, fetchImpl: async (_url, options) => {
      signal = options.signal;
      if (stallBody) return { ok: true, json: () => new Promise(() => {}) };
      return new Promise(() => {});
    } });
    await assert.rejects(screen('Text', 'test-key'), /screening unavailable/);
    assert.equal(signal.aborted, true);
  }
});

test('safe diagnostics distinguish HTTP status and transport without retaining sensitive details', async () => {
  const privateDetail = 'secret-key visitor@example.org private-message task-private-id';
  const cases = [
    [{ fetchImpl: async () => new Response(privateDetail, { status: 403 }) }, 'create_http', 403],
    [{ fetchImpl: async (_url, options) => options.method === 'POST'
      ? Response.json({ task_id: 'test-task' }) : new Response(privateDetail, { status: 429 }) }, 'poll_http', 429],
    [{ fetchImpl: async () => { throw new Error(privateDetail); } }, 'create_transport', undefined],
    [{ fetchImpl: async () => new Response(privateDetail) }, 'invalid_json', undefined],
    [provider({ stage: 'STAGE_FAILED', headline: privateDetail }), 'failed_task', undefined],
  ];
  for (const [dependencies, code, status] of cases) {
    await assert.rejects(createPangramScreen(dependencies)(privateDetail, 'secret-key'), (error) => {
      assert.ok(error instanceof PangramError);
      assert.equal(error.code, code);
      assert.equal(error.status, status);
      assert.equal(error.message, 'Message screening unavailable');
      assert.equal(error.cause, undefined);
      assert.doesNotMatch(JSON.stringify(error), /secret-key|visitor@|private-message|task-private-id/);
      return true;
    });
  }
});

test('provider redirects are rejected without a follow-up request or forwarding the key', async () => {
  for (const status of [301, 302, 307]) {
    for (const redirectPhase of ['POST', 'GET']) {
      const calls = [];
      const screen = createPangramScreen({ fetchImpl: async (url, options) => {
        calls.push({ url, options });
        assert.equal(options.redirect, 'manual');
        if (options.method === redirectPhase) {
          return new Response(null, { status, headers: { Location: 'https://other.example/collect' } });
        }
        return Response.json({ task_id: 'test-task' });
      } });
      await assert.rejects(screen('Text', 'test-key'), (error) => {
        assert.equal(error.code, redirectPhase === 'POST' ? 'create_http' : 'poll_http');
        assert.equal(error.status, status);
        return true;
      });
      assert.equal(calls.length, redirectPhase === 'POST' ? 1 : 2);
      assert.ok(calls.every(({ url }) => new URL(url).origin === 'https://text.external-api.pangram.com'));
    }
  }
});
