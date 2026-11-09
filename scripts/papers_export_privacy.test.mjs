import test from 'node:test';
import assert from 'node:assert/strict';
import { publicExportRow } from './papers_csv_utils.mjs';

test('nonpublic review venues stay out of served export without mutating canonical rows', () => {
  const source = { 'Site: Public?': 'No', 'Site: codename': 'stable-paper', Venue: 'Private review venue', 'Site: Venue': 'Preprint' };
  const exported = publicExportRow(source);
  assert.equal(exported.Venue, '');
  assert.equal(exported['Site: Venue'], 'Preprint');
  assert.equal(exported['Site: codename'], 'stable-paper');
  assert.equal(source.Venue, 'Private review venue');
  assert.deepEqual(publicExportRow(exported), exported);
  assert.equal(publicExportRow({ ...source, 'Site: Public?': 'Yes' }).Venue, source.Venue);
});

test('public preprints expose the authorized public venue rather than a private review venue', () => {
  const source = { 'Site: Public?': 'Yes', Status: 'Under Review', Venue: 'Private conference submission', 'Site: Venue': 'Preprint' };
  assert.equal(publicExportRow(source).Venue, 'Preprint');
  assert.equal(source.Venue, 'Private conference submission');
  assert.equal(publicExportRow({ ...source, 'Site: Venue': '' }).Venue, '');
});
