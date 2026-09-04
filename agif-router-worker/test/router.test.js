import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

function withMockFetch(handler) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  return () => {
    globalThis.fetch = original;
  };
}

test('Day 1 root serves the existing interactive deck and preserves the query', async () => {
  let seen;
  const restore = withMockFetch(async (request) => {
    seen = request;
    return new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ETag: 'day-1' },
    });
  });

  try {
    const response = await worker.fetch(new Request('https://agif1.mintresearch.org/?v=3'));
    assert.equal(seen.url, 'https://mintresearch.org/should-we-build-agi/deck.html?v=3');
    assert.equal(response.headers.get('etag'), 'day-1');
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  } finally {
    restore();
  }
});

test('Day 2 root and paths map to Fable’s native Pretext deck', async () => {
  let seen;
  const restore = withMockFetch(async (request) => {
    seen = request;
    return new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  });

  try {
    const request = new Request('https://agif2.mintresearch.org/deck.html?v=14', {
      headers: { Range: 'bytes=0-99' },
    });
    const response = await worker.fetch(request);
    assert.equal(seen.url, 'https://mintresearch.org/agi-institutions/deck.html?v=14');
    assert.equal(seen.headers.get('range'), 'bytes=0-99');
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(response.headers.get('cache-control'), 'no-cache');
    assert.match(response.headers.get('x-robots-tag'), /noimageindex/);
  } finally {
    restore();
  }
});

test('Day 2 root serves its standalone deck', async () => {
  let seen;
  const restore = withMockFetch(async (request) => {
    seen = request;
    return new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  });

  try {
    await worker.fetch(new Request('https://agif2.mintresearch.org/'));
    assert.equal(seen.url, 'https://mintresearch.org/agi-institutions/deck.html');
  } finally {
    restore();
  }
});

test('shared root assets stay at the site origin root', async () => {
  let seen;
  const restore = withMockFetch(async (request) => {
    seen = request;
    return new Response('icon');
  });

  try {
    await worker.fetch(new Request('https://agif1.mintresearch.org/favicon-32x32.png'));
    assert.equal(seen.url, 'https://mintresearch.org/favicon-32x32.png');
  } finally {
    restore();
  }
});

test('the router is not an open proxy and accepts only read methods', async () => {
  const unknown = await worker.fetch(new Request('https://example.com/'));
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('x-robots-tag'), /noindex/);

  const write = await worker.fetch(new Request('https://agif1.mintresearch.org/', { method: 'POST' }));
  assert.equal(write.status, 405);
  assert.equal(write.headers.get('allow'), 'GET, HEAD');
});

test('robots remains fetchable so crawlers can observe noindex headers', async () => {
  const response = await worker.fetch(new Request('https://agif2.mintresearch.org/robots.txt'));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'User-agent: *\nAllow: /\n');
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
});
