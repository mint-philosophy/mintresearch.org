import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const routes = [
  ['agif1.mintresearch.org', 'https://mintresearch.org/should-we-build-agi/'],
  ['agif2.mintresearch.org', 'https://mintresearch.org/agi-institutions/'],
  ['agif3.mintresearch.org', 'https://mintresearch.org/societal-adaptation/'],
];

test('every legacy AGIF host permanently redirects to its framed main-site page', async () => {
  for (const [host, destination] of routes) {
    const response = await worker.fetch(new Request(`https://${host}/deck.html?source=legacy`));
    assert.equal(response.status, 308, host);
    assert.equal(response.headers.get('location'), `${destination}?source=legacy`, host);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300', host);
    assert.match(response.headers.get('x-robots-tag'), /noindex/, host);
  }
});

test('HEAD redirects without a body', async () => {
  const response = await worker.fetch(new Request('https://agif2.mintresearch.org/', { method: 'HEAD' }));
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://mintresearch.org/agi-institutions/');
  assert.equal(await response.text(), '');
});

test('the redirector recognizes only the three legacy hosts and read methods', async () => {
  const unknown = await worker.fetch(new Request('https://example.com/'));
  assert.equal(unknown.status, 404);
  assert.match(unknown.headers.get('x-robots-tag'), /noindex/);

  const write = await worker.fetch(new Request('https://agif1.mintresearch.org/', { method: 'POST' }));
  assert.equal(write.status, 405);
  assert.equal(write.headers.get('allow'), 'GET, HEAD');
});

test('robots remains fetchable on every legacy host', async () => {
  for (const [host] of routes) {
    const response = await worker.fetch(new Request(`https://${host}/robots.txt`));
    assert.equal(response.status, 200, host);
    assert.equal(await response.text(), 'User-agent: *\nAllow: /\n', host);
    assert.match(response.headers.get('x-robots-tag'), /noindex/, host);
  }
});
