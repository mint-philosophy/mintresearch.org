import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedDates, issueItem } from './build_newsletter_feed.mjs';

test('only archive links select issues, in reverse date order without duplicates', () => {
  assert.deepEqual(publishedDates('<a href="/newsletters/yinai/2026-09-01/">One</a><a href="/newsletters/yinai/2026-09-03/">Three</a><a href="/newsletters/yinai/2026-09-03/">Again</a><a href="/newsletters/yinai/2026-09-04/report/">Report</a>'), ['2026-09-03', '2026-09-01']);
});

test('feed escapes XML, resolves links and omits scripts and expanded reports', () => {
  const item = issueItem('<title>AI &amp; research</title><div class="nl-digest-content"><p>A &lt; B <a href="#story">Source</a></p><script>bad()</script><details>Expanded report</details></div>', '2026-09-03');
  assert.match(item, /AI &amp; research/);
  assert.match(item, /A &amp;lt; B/);
  assert.match(item, /https:\/\/mintresearch.org\/newsletters\/yinai\/2026-09-03\/#story/);
  assert.doesNotMatch(item, /bad\(\)|Expanded report/);
  assert.match(item, /Thu, 03 Sep 2026 12:00:00 GMT/);
  assert.throws(() => issueItem('<title>Incomplete</title>', '2026-09-03'), /Missing title or digest/);
});
