const DECK_ID = 'should-we-build-agi';

function csv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  return csv(env.ALLOWED_ORIGINS).includes(origin) ? origin : null;
}

function headers(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ ok: true, service: 'mint-agi-inline-editor' }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    const origin = allowedOrigin(request, env);
    if (!origin) return new Response('Forbidden', { status: 403 });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
    if (url.pathname !== `/v1/decks/${DECK_ID}`) return json(origin, { error: 'Not found' }, 404);

    if (request.method === 'GET') {
      return json(origin, { error: 'This legacy editor endpoint is retired' }, 410);
    }

    if (request.method === 'PUT') {
      return json(origin, { error: 'This legacy editor endpoint is read-only' }, 410);
    }
    return json(origin, { error: 'Method not allowed' }, 405);
  },
};
