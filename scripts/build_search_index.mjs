import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { parseCsv } from './papers_csv_utils.mjs';

const origin = 'https://mintresearch.org';
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
function nodes(node, test) {
  return [...(test(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, test))];
}
function plain(node) {
  if (['script', 'style', 'nav', 'header', 'footer', 'svg', 'template', 'noscript', 'form'].includes(node.tagName) || attr(node, 'hidden') !== undefined || attr(node, 'aria-hidden') === 'true') return '';
  return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(plain).join(' ');
}
const clean = text => text.replace(/\s+/g, ' ').trim();
export function pageRecord(html, file) {
  const doc = parse(html);
  const metas = nodes(doc, n => n.tagName === 'meta');
  if (metas.some(n => (attr(n, 'name')?.toLowerCase() === 'robots' && /\bnoindex\b/i.test(attr(n, 'content') || '')) || attr(n, 'http-equiv')?.toLowerCase() === 'refresh')) return null;
  const canonical = nodes(doc, n => n.tagName === 'link' && attr(n, 'rel') === 'canonical')[0];
  if (canonical && new URL(attr(canonical, 'href'), origin).origin !== origin) return null;
  const main = nodes(doc, n => n.tagName === 'main')[0] || nodes(doc, n => n.tagName === 'body')[0];
  const title = clean(plain(nodes(doc, n => n.tagName === 'title')[0] || {}));
  const text = clean(plain(main || {}));
  if (!title || !text) return null;
  return { title, url: origin + '/' + file.replace(/index\.html$/, ''), text };
}
async function htmlFiles(directory, relative = '') {
  const found = [];
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['assets', '_astro', 'pagefind', 'output'].includes(entry.name)) continue;
    const name = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) found.push(...await htmlFiles(directory, name));
    else if (entry.name.endsWith('.html') && !['404.html'].includes(entry.name)) found.push(name);
  }
  return found.sort();
}
export async function buildSearchIndex(directory) {
  const records = [];
  for (const file of await htmlFiles(directory)) {
    const record = pageRecord(await readFile(path.join(directory, file), 'utf8'), file);
    if (record) records.push(record);
  }
  const rows = parseCsv(await readFile(path.join(directory, 'assets/papers/latest-paper-deliverables.csv'), 'utf8'));
  for (const row of rows) {
    if (!['Site: Public?', 'Site: in Papers Section?'].every(key => row[key]?.trim().toLowerCase() === 'yes')) continue;
    const url = row['Site: Link to Paper'] || row.Link;
    if (!/^https?:\/\//i.test(url || '')) continue;
    records.push({ title: row['Title/Details'], url, text: clean([row['Site: List of Authors'], row['Site: Venue'] || row.Venue, row['Site: Blurb'], row.Abstract].filter(Boolean).join(' ')) });
  }
  await mkdir(path.join(directory, 'assets'), { recursive: true });
  const output = JSON.stringify(records);
  await writeFile(path.join(directory, 'assets/search-index.json'), output);
  console.log(`Search index: ${records.length} public pages/publications, ${Buffer.byteLength(output)} bytes.`);
  return records;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await buildSearchIndex(path.resolve(process.argv[2] || 'dist'));
