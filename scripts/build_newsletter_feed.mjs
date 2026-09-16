import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';

const origin = 'https://mintresearch.org';
const feedPath = '/newsletters/yinai/feed.xml';
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const children = node => node.childNodes || [];
function findAll(node, test) {
  return [...(test(node) ? [node] : []), ...children(node).flatMap(n => findAll(n, test))];
}
const text = node => node.nodeName === '#text' ? node.value : children(node).map(text).join('');
const xml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
const allowed = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'blockquote', 'br', 'a', 'code']);

// Feed readers get the digest; expanded reports remain linked on the issue page.
function readable(node, url) {
  if (node.nodeName === '#text') return xml(node.value);
  if (['script', 'style', 'form', 'nav', 'footer', 'details', 'template'].includes(node.tagName)) return '';
  const inner = children(node).map(n => readable(n, url)).join('');
  if (!allowed.has(node.tagName)) return inner;
  let attributes = '';
  if (node.tagName === 'a') {
    const href = new URL(attr(node, 'href') || url, url);
    if (['http:', 'https:'].includes(href.protocol)) attributes = ` href="${xml(href.href)}"`;
  }
  return `<${node.tagName}${attributes}>${inner}${node.tagName === 'br' ? '' : `</${node.tagName}>`}`;
}

export function publishedDates(html) {
  const doc = parse(html);
  return [...new Set(findAll(doc, n => n.tagName === 'a')
    .map(n => attr(n, 'href')?.match(/^\/newsletters\/yinai\/(\d{4}-\d{2}-\d{2})\/$/)?.[1])
    .filter(Boolean))].sort().reverse();
}

export function issueItem(html, date) {
  const doc = parse(html);
  const title = findAll(doc, n => n.tagName === 'title')[0];
  const digest = findAll(doc, n => hasClass(n, 'nl-digest-content'))[0];
  if (!title || !digest) throw new Error(`Missing title or digest in published issue ${date}`);
  const url = `${origin}/newsletters/yinai/${date}/`;
  const content = readable(digest, url) + `<p><a href="${url}">Read the full issue and expanded reports</a></p>`;
  // Issues supply a calendar date, not a reliable publication timestamp.
  const published = new Date(`${date}T12:00:00Z`).toUTCString();
  return `<item><title>${xml(text(title))}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${published}</pubDate><description>${xml(content)}</description></item>`;
}

export async function buildNewsletterFeed(directory) {
  const newsletterFile = path.join(directory, 'newsletter/index.html');
  let newsletter = await readFile(newsletterFile, 'utf8');
  const dates = publishedDates(newsletter);
  if (!dates.length) throw new Error('The public YinAI archive is empty');
  const discovery = `<link rel="alternate" type="application/rss+xml" title="Yesterday in AI" href="${feedPath}">`;
  const items = [];
  for (const date of dates) {
    const file = path.join(directory, `newsletters/yinai/${date}/index.html`);
    const html = await readFile(file, 'utf8');
    items.push(issueItem(html, date));
    if (!html.includes(discovery)) await writeFile(file, html.replace('</head>', discovery + '</head>'));
  }
  const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Yesterday in AI</title><link>${origin}/newsletter/</link><description>Daily news and research relevant to AI alignment, governance and adaptation.</description><language>en</language><atom:link href="${origin}${feedPath}" rel="self" type="application/rss+xml"/>${items.join('\n')}</channel></rss>\n`;
  await writeFile(path.join(directory, feedPath.slice(1)), feed);
  if (!newsletter.includes(discovery)) newsletter = newsletter.replace('</head>', discovery + '</head>');
  if (!newsletter.includes('id="yinai-rss"')) {
    const formEnd = newsletter.indexOf('</form>', newsletter.indexOf('data-lists="882f8b1e-9d59-4a65-aa37-6adadf097025"'));
    if (formEnd < 0) throw new Error('YinAI email signup form is missing');
    const end = formEnd + '</form>'.length;
    newsletter = newsletter.slice(0, end) + `<p id="yinai-rss" style="margin-top:16px"><a href="${feedPath}" type="application/rss+xml">Subscribe via RSS</a></p>` + newsletter.slice(end);
  }
  await writeFile(newsletterFile, newsletter);
  console.log(`YinAI RSS: ${dates.length} published issues; newest ${dates[0]}.`);
  return dates;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await buildNewsletterFeed(path.resolve(process.argv[2] || 'dist'));
}
