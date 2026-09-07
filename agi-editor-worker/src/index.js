const DECK_ID = 'should-we-build-agi';
const CURRENT_KEY = `deck:${DECK_ID}:current`;

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

async function currentState(env) {
  const stored = await env.CONTENT_OVERRIDES.get(CURRENT_KEY, 'json');
  if (stored && typeof stored === 'object' && stored.fields && typeof stored.fields === 'object') {
    return stored;
  }
  return { revision: 'base', updatedAt: null, fields: {} };
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
      const state = await currentState(env);
      return json(origin, { ...state, canEdit: false });
    }

    if (request.method === 'PUT') {
      return json(origin, { error: 'This legacy editor endpoint is read-only' }, 410);
    }
    return json(origin, { error: 'Method not allowed' }, 405);
  },
};
