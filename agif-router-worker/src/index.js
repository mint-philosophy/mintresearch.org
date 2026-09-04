const NO_INDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

const destinations = {
  'agif1.mintresearch.org': 'https://mintresearch.org/should-we-build-agi/',
  'agif2.mintresearch.org': 'https://mintresearch.org/agi-institutions/',
  'agif3.mintresearch.org': 'https://mintresearch.org/societal-adaptation/',
};

function responseHeaders(source) {
  const headers = new Headers(source);
  headers.set('X-Robots-Tag', NO_INDEX);
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const destination = destinations[incoming.hostname.toLowerCase()];

    if (!destination) {
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

    const target = new URL(destination);
    target.search = incoming.search;
    return new Response(null, {
      status: 308,
      headers: responseHeaders({
        'Cache-Control': 'public, max-age=300',
        Location: target.href,
      }),
    });
  },
};
