const DECK_ID = 'should-we-build-agi';
const CURRENT_KEY = `deck:${DECK_ID}:current`;
const MAX_FIELDS = 256;
const MAX_FIELD_LENGTH = 2_000;
const MAX_TOTAL_LENGTH = 60_000;

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

function canEdit(request, env) {
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  return Boolean(clientIp) && csv(env.ALLOWED_IPS).includes(clientIp);
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

function validateFields(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('fields must be an object');
  }

  const entries = Object.entries(value);
  if (entries.length > MAX_FIELDS) throw new Error(`at most ${MAX_FIELDS} fields may be saved`);

  let totalLength = 0;
  const fields = {};
  for (const [key, text] of entries) {
    if (!/^s\d{2}-[a-f0-9]{8}-\d{2}$/.test(key)) throw new Error(`invalid field key: ${key}`);
    if (typeof text !== 'string') throw new Error(`field ${key} must be text`);
    if (text.length > MAX_FIELD_LENGTH) throw new Error(`field ${key} is too long`);
    if (/\u0000/.test(text)) throw new Error(`field ${key} contains an invalid character`);
    totalLength += text.length;
    if (totalLength > MAX_TOTAL_LENGTH) throw new Error('saved text is too large');
    fields[key] = text;
  }
  return fields;
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
      return json(origin, { ...state, canEdit: canEdit(request, env) });
    }

    if (request.method !== 'PUT') return json(origin, { error: 'Method not allowed' }, 405);
    if (!canEdit(request, env)) return json(origin, { error: 'Editing is not available from this network' }, 403);
    if (!String(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
      return json(origin, { error: 'Content-Type must be application/json' }, 415);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(origin, { error: 'Invalid JSON' }, 400);
    }

    const existing = await currentState(env);
    if (payload.revision !== existing.revision) {
      return json(origin, { error: 'The deck changed elsewhere. Reload before saving.', ...existing }, 409);
    }

    let fields;
    try {
      fields = validateFields(payload.fields);
    } catch (error) {
      return json(origin, { error: error.message }, 400);
    }

    const state = {
      revision: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      fields,
    };
    await env.CONTENT_OVERRIDES.put(CURRENT_KEY, JSON.stringify(state));
    await env.CONTENT_OVERRIDES.put(`deck:${DECK_ID}:history:${state.revision}`, JSON.stringify(state), {
      expirationTtl: 60 * 60 * 24 * 90,
    });

    return json(origin, { ok: true, ...state, canEdit: true });
  },
};
