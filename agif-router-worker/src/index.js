const ORIGIN = 'https://mintresearch.org';
const NO_INDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

const sites = {
  'agif1.mintresearch.org': {
    basePath: '/should-we-build-agi',
    entryPath: '/should-we-build-agi/deck.html',
  },
  'agif2.mintresearch.org': {
    basePath: '/agif2',
    entryPath: '/agif2/',
  },
};

const sharedAsset = /^\/(?:assets\/|_astro\/|favicon(?:[-.])|apple-touch-icon\.png$)/;

function upstreamPath(pathname, site) {
  if (pathname === '/' || pathname === '/index.html') return site.entryPath;
  if (sharedAsset.test(pathname)) return pathname;
  return `${site.basePath}${pathname}`;
}

function responseHeaders(source) {
  const headers = new Headers(source);
  headers.set('X-Robots-Tag', NO_INDEX);
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const site = sites[incoming.hostname.toLowerCase()];

    if (!site) {
      return new Response('Not found', {
        status: 404,
        headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }),
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: responseHeaders({
          Allow: 'GET, HEAD',
          'Content-Type': 'text/plain; charset=utf-8',
        }),
      });
    }

    if (incoming.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\n', {
        headers: responseHeaders({
          'Cache-Control': 'public, max-age=600',
          'Content-Type': 'text/plain; charset=utf-8',
        }),
      });
    }

    const upstream = new URL(ORIGIN);
    upstream.pathname = upstreamPath(incoming.pathname, site);
    upstream.search = incoming.search;

    const upstreamRequest = new Request(upstream, request);
    const response = await fetch(upstreamRequest);
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders(response.headers),
    });
  },
};
