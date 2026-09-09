const FELLOWSHIP_HOST = 'fellowship.mintresearch.org';
const NO_INDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';
const SESSION_COOKIE_PREFIX = 'mint_fellowship_session';
const SESSION_SECONDS = 12 * 60 * 60;
const EDITOR_PATH_PREFIX = '/editor/v1/decks/';
const EDITOR_SESSION_PATH = '/editor/v1/session';
const EDITOR_ORIGIN = `https://${FELLOWSHIP_HOST}`;
const EDITOR_SESSION_COOKIE = 'mint_fellowship_editor';
const EDITOR_SESSION_SECONDS = 30 * 24 * 60 * 60;
const MAX_EDITOR_FIELDS = 384;
const MAX_EDITOR_FIELD_LENGTH = 2_000;
const MAX_EDITOR_TOTAL_LENGTH = 60_000;
const MAX_EDITOR_BODY_LENGTH = 100_000;

const legacyHosts = {
  'agif1.mintresearch.org': '/should-we-build-agi/',
  'agif2.mintresearch.org': '/agi-institutions/',
  'agif3.mintresearch.org': '/adaptation/',
};

const legacyPaths = {
  '/day-1': '/should-we-build-agi',
  '/day-2': '/agi-institutions',
  '/day-3': '/adaptation',
};

const presentations = [
  {
    id: 'definitions', path: '/definitions', source: '/definitions',
    wrapper: '/fellowship/definitions/index.html', dateLabel: '9.8', dateLong: 'September 8',
    title: 'Definitions', unlockAt: '2026-09-08T06:00:00-04:00',
    accessGroup: '2026-09-08', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_8',
  },
  {
    id: 'philosophy', path: '/philosophy', source: '/philosophy',
    wrapper: '/fellowship/philosophy/index.html', dateLabel: '9.9', dateLong: 'September 9',
    title: 'Philosophy', unlockAt: '2026-09-09T06:00:00-04:00',
    accessGroup: '2026-09-09', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_9',
  },
  {
    id: 'projects', path: '/projects', source: '/projects',
    wrapper: '/fellowship/projects/index.html', dateLabel: '9.9', dateLong: 'September 9',
    title: 'Projects', unlockAt: '2026-09-09T06:00:00-04:00',
    accessGroup: '2026-09-09', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_9',
  },
  {
    id: 'should-we-build-agi', path: '/should-we-build-agi', source: '/should-we-build-agi',
    wrapper: '/fellowship/day-1/index.html', dateLabel: '9.10', dateLong: 'September 10',
    title: 'Should We Build AGI?', unlockAt: '2026-09-10T06:00:00-04:00',
    accessGroup: '2026-09-10', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_10',
  },
  {
    id: 'agi-institutions', path: '/agi-institutions', source: '/agi-institutions',
    wrapper: '/fellowship/day-2/index.html', dateLabel: '9.11', dateLong: 'September 11',
    title: 'AGI Institutions', unlockAt: '2026-09-11T06:00:00-04:00',
    accessGroup: '2026-09-11', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_11',
  },
  {
    id: 'adaptation', path: '/adaptation', source: '/societal-adaptation',
    wrapper: '/fellowship/day-3/index.html', dateLabel: '9.14', dateLong: 'September 14',
    title: 'Adaptation', unlockAt: '2026-09-14T06:00:00-04:00',
    accessGroup: '2026-09-14', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_14',
  },
];

const textEncoder = new TextEncoder();

function csv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasPrefix(pathname, prefix) {
  return pathname === prefix || pathname === `${prefix}/` || pathname.startsWith(`${prefix}/`);
}

function responseHeaders(source, { noIndex = false, noStore = false } = {}) {
  const headers = new Headers(source);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  if (noIndex) headers.set('X-Robots-Tag', NO_INDEX);
  if (noStore) headers.set('Cache-Control', 'private, no-store');
  return headers;
}

function redirect(location, status = 308, { noIndex = true, cookies = [] } = {}) {
  const headers = responseHeaders({ Location: location }, { noIndex, noStore: status !== 308 });
  if (status === 308) headers.set('Cache-Control', 'public, max-age=300');
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(null, { status, headers });
}

function redirectToFellowship(request, path) {
  const incoming = new URL(request.url);
  const target = new URL(path, `https://${FELLOWSHIP_HOST}`);
  target.search = incoming.search;
  return redirect(target.href);
}

function canonicalizeLegacyPath(pathname) {
  for (const [legacy, canonical] of Object.entries(legacyPaths)) {
    if (hasPrefix(pathname, legacy)) return `${canonical}${pathname.slice(legacy.length)}`;
  }
  return pathname;
}

function presentationForPath(pathname) {
  return presentations.find((presentation) => hasPrefix(pathname, presentation.path)) || null;
}

function presentationForId(id) {
  return presentations.find((presentation) => presentation.id === id) || null;
}

function safeNext(value) {
  try {
    const url = new URL(String(value || ''), `https://${FELLOWSHIP_HOST}`);
    if (url.origin !== `https://${FELLOWSHIP_HOST}`) return '/';
    url.pathname = canonicalizeLegacyPath(url.pathname);
    return presentationForPath(url.pathname) || url.pathname === '/bibliography/edit/' ? `${url.pathname}${url.search}` : '/';
  } catch {
    return '/';
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', textEncoder.encode(value)));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function passwordMatches(candidate, expected) {
  if (!candidate || !expected) return false;
  const [candidateDigest, expectedDigest] = await Promise.all([digest(candidate), digest(expected)]);
  return constantTimeEqual(candidateDigest, expectedDigest);
}

function nowMs(env) {
  if (env.TEST_NOW_MS === undefined) return Date.now();
  const value = Number(env.TEST_NOW_MS);
  return Number.isFinite(value) ? value : Date.now();
}

function isPresentationOpen(presentation, env) {
  return Boolean(presentation.unlockAt) && nowMs(env) >= Date.parse(presentation.unlockAt);
}

function presentationPassword(presentation, env) {
  return env[presentation.passwordBinding];
}

function sessionCookieName(presentation) {
  return `${SESSION_COOKIE_PREFIX}_${presentation.accessGroup.replaceAll('-', '_')}`;
}

async function sessionSignature(presentation, expiry, password) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign(
    'HMAC', key, textEncoder.encode(`agif:${presentation.accessGroup}:${expiry}`),
  )));
}

async function createSessionCookie(presentation, password, env) {
  const expiry = Math.floor(nowMs(env) / 1000) + SESSION_SECONDS;
  const signature = await sessionSignature(presentation, expiry, password);
  return `${sessionCookieName(presentation)}=${expiry}.${signature}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return '';
}

async function sessionIsValid(request, presentation, password, env) {
  if (!password) return false;
  const value = cookieValue(request, sessionCookieName(presentation));
  const [expiryText, suppliedSignature, ...extra] = value.split('.');
  if (!expiryText || !suppliedSignature || extra.length) return false;
  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(nowMs(env) / 1000)) return false;
  const expectedSignature = await sessionSignature(presentation, expiry, password);
  return constantTimeEqual(textEncoder.encode(suppliedSignature), textEncoder.encode(expectedSignature));
}

function editorPassword(env) {
  return env.FELLOWSHIP_EDITOR_PASSWORD;
}

async function editorSessionSignature(expiry, password) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign(
    'HMAC', key, textEncoder.encode(`agif:editor:${expiry}`),
  )));
}

async function createEditorSessionCookie(password, env) {
  const expiry = Math.floor(nowMs(env) / 1000) + EDITOR_SESSION_SECONDS;
  const signature = await editorSessionSignature(expiry, password);
  return `${EDITOR_SESSION_COOKIE}=${expiry}.${signature}; Max-Age=${EDITOR_SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

async function editorSessionIsValid(request, env) {
  const password = editorPassword(env);
  if (!password) return false;
  const value = cookieValue(request, EDITOR_SESSION_COOKIE);
  const [expiryText, suppliedSignature, ...extra] = value.split('.');
  if (!expiryText || !suppliedSignature || extra.length) return false;
  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(nowMs(env) / 1000)) return false;
  const expectedSignature = await editorSessionSignature(expiry, password);
  return constantTimeEqual(textEncoder.encode(suppliedSignature), textEncoder.encode(expectedSignature));
}

function ipv6NetworkPrefix(address) {
  if (!/^[0-9a-f:]+$/i.test(address) || !address.includes(':')) return null;
  try {
    const canonical = new URL(`http://[${address}]/`).hostname.slice(1, -1);
    const [left, right] = canonical.split('::');
    const head = left ? left.split(':') : [];
    const tail = right ? right.split(':') : [];
    const parts = right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail];
    return parts.slice(0, 4).map(part => Number.parseInt(part, 16).toString(16)).join(':');
  } catch {
    return null;
  }
}

function ipIsAllowed(request, env) {
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  if (!clientIp) return false;
  if ([...csv(env.ALLOWED_IPS), ...csv(env.FELLOWSHIP_OWNER_IPS)].includes(clientIp)) return true;
  const prefix = ipv6NetworkPrefix(clientIp);
  return prefix !== null && csv(env.FELLOWSHIP_OWNER_IPV6_NETWORKS).some(network => {
    const [address, length, extra] = network.split('/');
    return length === '64' && extra === undefined && ipv6NetworkPrefix(address) === prefix;
  });
}

async function requestIsAuthorized(request, presentation, env) {
  if (isPresentationOpen(presentation, env) || ipIsAllowed(request, env)) return true;
  if (await editorSessionIsValid(request, env)) return true;
  return sessionIsValid(request, presentation, presentationPassword(presentation, env), env);
}

function loginPage(next, presentation, invalid = false, owner = false) {
  const nextValue = escapeHtml(next);
  const error = invalid
    ? '<p class="login-error" role="alert">That password was not recognized.</p>'
    : '';
  const heading = owner ? 'Owner login' : presentation.dateLabel
    ? `${presentation.dateLabel} · ${presentation.title}`
    : presentation.title;
  const accessCopy = owner ? 'Log in once to view and edit all Fellowship presentations and the bibliography, from any network. Stay signed in for 30 days on this browser.' : presentation.unlockAt
    ? `Enter this presentation’s password. It opens without a password at 6:00 a.m. ET on ${presentation.dateLong}.`
    : 'Enter the Fellowship password to open this presentation.';
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="${NO_INDEX}">
  <title>${escapeHtml(heading)} — Fellowship access</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; --ink:#0d2f2d; --muted:#506867; --accent:#087f75; --line:#b9d7d3; --paper:#f7fbfa; --panel:#fff; }
    * { box-sizing:border-box; }
    html, body { min-height:100%; margin:0; }
    body { display:grid; place-items:center; padding:28px; background:linear-gradient(145deg,#e6f5f2,#f9fcfb 48%,#d9efeb); color:var(--ink); font:14px/1.6 "JetBrains Mono",monospace; }
    .login-shell { width:min(560px,100%); background:var(--panel); border:1px solid var(--line); box-shadow:0 24px 70px rgba(13,47,45,.14); }
    .login-bar { display:flex; justify-content:space-between; gap:16px; padding:13px 16px; border-bottom:1px solid var(--line); color:var(--accent); font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
    .login-body { padding:34px; }
    h1 { margin:0 0 12px; font-size:24px; line-height:1.25; }
    p { margin:0 0 22px; color:var(--muted); }
    label { display:block; margin-bottom:8px; font-size:12px; font-weight:700; color:var(--accent); }
    input { width:100%; padding:13px 14px; border:1px solid var(--line); border-radius:4px; background:var(--paper); color:var(--ink); font:inherit; }
    input:focus { outline:2px solid #40b4a7; outline-offset:2px; }
    button { width:100%; margin-top:14px; padding:13px 16px; border:0; border-radius:4px; background:var(--accent); color:#fff; font:700 13px/1 "JetBrains Mono",monospace; cursor:pointer; }
    button:hover { background:#066c64; }
    .login-error { margin:14px 0 0; color:#a12d2d; font-size:12px; }
    .login-back { display:inline-block; margin-top:22px; color:var(--accent); text-decoration:none; }
    @media (max-width:520px) { body{padding:14px}.login-body{padding:25px 20px}.login-bar{flex-direction:column;gap:2px} }
  </style>
</head>
<body>
  <main class="login-shell">
    <div class="login-bar"><span>MINT Research Lab</span><span>AGI Governance Fellowship</span></div>
    <div class="login-body">
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(accessCopy)}</p>
      <form method="post" action="${owner ? '/owner/login' : '/login'}">
        <input type="hidden" name="next" value="${nextValue}">
        <label for="password">${owner ? 'Owner password' : 'Password'}</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">${owner ? 'Log in' : 'Open presentation'}</button>
      </form>
      ${error}
      <a class="login-back" href="/">← Fellowship overview</a>
      ${owner ? '' : `<a class="login-back" href="/owner/login?next=${encodeURIComponent(next)}">Owner login</a>`}
    </div>
  </main>
</body>
</html>`;
}

function renderLogin(next, presentation, invalid = false) {
  return new Response(loginPage(next, presentation, invalid), {
    status: invalid ? 401 : 200,
    headers: responseHeaders({ 'Content-Type': 'text/html; charset=utf-8' }, { noIndex: true, noStore: true }),
  });
}

function unavailable() {
  return new Response('Fellowship access is temporarily unavailable.', {
    status: 503,
    headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true, noStore: true }),
  });
}

function editorHeaders(extra = {}) {
  return responseHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  }, { noIndex: true, noStore: true });
}

function editorJson(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: editorHeaders(extraHeaders),
  });
}

async function currentEditorState(env, presentation) {
  const stored = await env.CONTENT_OVERRIDES.get(`deck:${presentation.id}:current`, 'json');
  if (stored && typeof stored === 'object' && stored.fields && typeof stored.fields === 'object') {
    return stored;
  }
  return { revision: 'base', updatedAt: null, fields: {} };
}

function validateEditorFields(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('fields must be an object');
  }

  const entries = Object.entries(value);
  if (entries.length > MAX_EDITOR_FIELDS) {
    throw new Error(`at most ${MAX_EDITOR_FIELDS} fields may be saved`);
  }

  let totalLength = 0;
  const fields = {};
  for (const [key, text] of entries) {
    if (!/^s\d{2}-[a-f0-9]{8}-\d{2}$/.test(key)) throw new Error(`invalid field key: ${key}`);
    if (typeof text !== 'string') throw new Error(`field ${key} must be text`);
    if (text.length > MAX_EDITOR_FIELD_LENGTH) throw new Error(`field ${key} is too long`);
    if (/\u0000/.test(text)) throw new Error(`field ${key} contains an invalid character`);
    totalLength += text.length;
    if (totalLength > MAX_EDITOR_TOTAL_LENGTH) throw new Error('saved text is too large');
    fields[key] = text;
  }
  return fields;
}

async function handleEditor(request, env, presentation) {
  if (!env.CONTENT_OVERRIDES) {
    return editorJson({ error: 'Editing is temporarily unavailable' }, 503);
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    if (!(await requestIsAuthorized(request, presentation, env))) {
      if (!presentationPassword(presentation, env) && !isPresentationOpen(presentation, env)) {
        return editorJson({ error: 'Fellowship access is temporarily unavailable' }, 503);
      }
      return editorJson({ error: 'Authentication required' }, 401);
    }
    const state = await currentEditorState(env, presentation);
    const canEdit = await editorSessionIsValid(request, env);
    const canRequestEdit = canEdit || (ipIsAllowed(request, env) && Boolean(editorPassword(env)));
    const response = editorJson({ ...state, canEdit, canRequestEdit });
    return request.method === 'HEAD'
      ? new Response(null, { status: response.status, headers: response.headers })
      : response;
  }

  if (request.method !== 'PUT') {
    return editorJson({ error: 'Method not allowed' }, 405, { Allow: 'GET, HEAD, PUT' });
  }
  if (request.headers.get('Origin') !== EDITOR_ORIGIN) {
    return editorJson({ error: 'Forbidden' }, 403);
  }
  if (!editorPassword(env)) {
    return editorJson({ error: 'Editing is temporarily unavailable' }, 503);
  }
  if (!(await editorSessionIsValid(request, env))) {
    return editorJson({ error: 'Editor authentication required' }, 403);
  }
  if (!String(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
    return editorJson({ error: 'Content-Type must be application/json' }, 415);
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_EDITOR_BODY_LENGTH) {
    return editorJson({ error: 'Request body is too large' }, 413);
  }
  const body = await request.text();
  if (body.length > MAX_EDITOR_BODY_LENGTH) {
    return editorJson({ error: 'Request body is too large' }, 413);
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return editorJson({ error: 'Invalid JSON' }, 400);
  }

  const existing = await currentEditorState(env, presentation);
  if (!payload || payload.revision !== existing.revision) {
    return editorJson({ error: 'The deck changed elsewhere. Reload before saving.', ...existing }, 409);
  }

  let fields;
  try {
    fields = validateEditorFields(payload.fields);
  } catch (error) {
    return editorJson({ error: error.message }, 400);
  }

  const state = {
    revision: crypto.randomUUID(),
    updatedAt: new Date(nowMs(env)).toISOString(),
    fields,
  };
  await env.CONTENT_OVERRIDES.put(`deck:${presentation.id}:current`, JSON.stringify(state));
  await env.CONTENT_OVERRIDES.put(
    `deck:${presentation.id}:history:${state.revision}`,
    JSON.stringify(state),
    { expirationTtl: 60 * 60 * 24 * 90 },
  );

  return editorJson({ ok: true, ...state, canEdit: true });
}

async function handleEditorSession(request, env) {
  if (request.method !== 'POST') {
    return editorJson({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }
  if (request.headers.get('Origin') !== EDITOR_ORIGIN) {
    return editorJson({ error: 'Forbidden' }, 403);
  }
  const password = editorPassword(env);
  if (!password) return editorJson({ error: 'Editing is temporarily unavailable' }, 503);
  const limited = await ownerLoginLimit(request, env);
  if (limited) return limited;
  if (!String(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
    return editorJson({ error: 'Content-Type must be application/json' }, 415);
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 4_096) return editorJson({ error: 'Request body is too large' }, 413);
  const body = await request.text();
  if (body.length > 4_096) return editorJson({ error: 'Request body is too large' }, 413);

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return editorJson({ error: 'Invalid JSON' }, 400);
  }
  if (typeof payload?.password !== 'string' || !(await passwordMatches(payload.password, password))) {
    return editorJson({ error: 'Editor password was not recognized' }, 401);
  }

  return editorJson({ ok: true, canEdit: true }, 200, {
    'Set-Cookie': await createEditorSessionCookie(password, env),
  });
}

async function ownerLoginLimit(request, env) {
  if (!env.OWNER_LOGIN_LIMITER) return editorJson({ error: 'Owner login is temporarily unavailable' }, 503);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const network = ipv6NetworkPrefix(ip) || ip;
  const key = bytesToBase64Url(await digest(`fellowship-owner-login:${network}`));
  const { success } = await env.OWNER_LOGIN_LIMITER.limit({ key });
  return success ? null : editorJson({ error: 'Too many login attempts. Please wait one minute.' }, 429, { 'Retry-After': '60' });
}

async function handleOwnerLogin(request, env) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get('next'));
  const render = (target, invalid = false) => new Response(loginPage(target, {}, invalid, true), {
    status: invalid ? 401 : 200,
    headers: responseHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "frame-ancestors 'none'; form-action 'self'; base-uri 'none'" }, { noIndex: true, noStore: true }),
  });
  if (request.method === 'GET' || request.method === 'HEAD') {
    if (await editorSessionIsValid(request, env)) return redirect(next, 303);
    const response = render(next);
    return request.method === 'HEAD' ? new Response(null, { headers: response.headers }) : response;
  }
  if (request.method !== 'POST') return editorJson({ error: 'Method not allowed' }, 405, { Allow: 'GET, HEAD, POST' });
  if (request.headers.get('Origin') !== EDITOR_ORIGIN) return editorJson({ error: 'Forbidden' }, 403);
  if (!editorPassword(env)) return unavailable();
  const limited = await ownerLoginLimit(request, env);
  if (limited) return limited;
  if (!String(request.headers.get('Content-Type') || '').startsWith('application/x-www-form-urlencoded')) return editorJson({ error: 'Invalid form' }, 415);
  if (Number(request.headers.get('Content-Length') || 0) > 4096) return editorJson({ error: 'Request body is too large' }, 413);
  const body = await request.text();
  if (body.length > 4096) return editorJson({ error: 'Request body is too large' }, 413);
  const form = new URLSearchParams(body);
  const target = safeNext(form.get('next'));
  if (!(await passwordMatches(form.get('password'), editorPassword(env)))) return render(target, true);
  return redirect(target, 303, { cookies: [await createEditorSessionCookie(editorPassword(env), env)] });
}

async function handleLogin(request, env) {
  const url = new URL(request.url);
  if (request.method === 'GET' || request.method === 'HEAD') {
    const next = safeNext(url.searchParams.get('next'));
    const presentation = presentationForPath(new URL(next, `https://${FELLOWSHIP_HOST}`).pathname);
    if (!presentation) return redirect('/', 303, { noIndex: true });
    if (await requestIsAuthorized(request, presentation, env)) return redirect(next, 303, { noIndex: true });
    if (!presentationPassword(presentation, env)) return unavailable();
    const response = renderLogin(next, presentation);
    return request.method === 'HEAD'
      ? new Response(null, { status: response.status, headers: response.headers })
      : response;
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: responseHeaders({ Allow: 'GET, HEAD, POST', 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true, noStore: true }),
    });
  }
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 8_192) return redirect('/', 303, { noIndex: true });
  const body = await request.text();
  if (body.length > 8_192) return redirect('/', 303, { noIndex: true });
  const form = new URLSearchParams(body);
  const next = safeNext(form.get('next'));
  const presentation = presentationForPath(new URL(next, `https://${FELLOWSHIP_HOST}`).pathname);
  if (!presentation) return redirect('/', 303, { noIndex: true });
  if (isPresentationOpen(presentation, env) || ipIsAllowed(request, env)) {
    return redirect(next, 303, { noIndex: true });
  }
  const password = presentationPassword(presentation, env);
  if (!password) return unavailable();
  if (!(await passwordMatches(form.get('password'), password))) return renderLogin(next, presentation, true);
  return redirect(next, 303, {
    noIndex: true,
    cookies: [await createSessionCookie(presentation, password, env)],
  });
}

function fellowshipAssetPath(pathname, presentation) {
  if (pathname === '/') return '/fellowship/index.html';
  if (presentation) {
    if (
      pathname === presentation.path ||
      pathname === `${presentation.path}/` ||
      pathname === `${presentation.path}/index.html`
    ) return presentation.wrapper;
    return `${presentation.source}${pathname.slice(presentation.path.length)}`;
  }
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/_astro/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/favicon-') ||
    pathname === '/apple-touch-icon.png'
  ) return pathname;
  return null;
}

async function serveAsset(request, env, assetPath, { noIndex = false } = {}) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
  const headers = responseHeaders(assetResponse.headers, { noIndex, noStore: noIndex });
  if (assetPath === '/fellowship/index.html' && assetResponse.ok && request.method !== 'HEAD') {
    const source = await assetResponse.text();
    const pendingBlock = /<!-- pending-presentations:start -->([\s\S]*?)<!-- pending-presentations:end -->/;
    const cards = source.match(pendingBlock)?.[1] || '';
    const open = [];
    const pending = [];
    for (const match of cards.matchAll(/<a class="agif-link" data-presentation="([^"]+)"[\s\S]*?<\/a>/g)) {
      const presentation = presentationForId(match[1]);
      if (presentation && isPresentationOpen(presentation, env)) {
        open.push(match[0].replace(/<span class="agif-access">[^<]*<\/span>/, '<span class="agif-access">Open</span>'));
      } else {
        pending.push(match[0]);
      }
    }
    let html = source.replace('<!-- open-presentations -->', open.join('\n'))
      .replace(pendingBlock, pending.join('\n'));
    const isOwner = await editorSessionIsValid(request, env);
    html = html.replace('<!-- owner-controls -->', isOwner
      ? '<span>Owner editing enabled</span><form method="post" action="/owner/logout"><button type="submit">Log out</button></form>'
      : '<a href="/owner/login">Owner login</a>');
    if (isOwner) html = html.replaceAll('href="/bibliography/"', 'href="/bibliography/edit/"');
    if (cards && !pending.length) html = html.replace('id="pending-presentations"', 'id="pending-presentations" hidden');
    headers.set('Cache-Control', 'no-store');
    headers.delete('Content-Length');
    headers.delete('ETag');
    return new Response(html, { status: assetResponse.status, headers });
  }
  return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

function robots() {
  const disallowed = [
    ...presentations.map((presentation) => `Disallow: ${presentation.path}/`),
    ...Object.keys(legacyPaths).map((path) => `Disallow: ${path}/`),
    'Disallow: /login',
    'Disallow: /owner/',
    'Disallow: /editor/',
  ].join('\n');
  return new Response(
    `User-agent: *\nAllow: /$\n${disallowed}\nSitemap: https://${FELLOWSHIP_HOST}/sitemap.xml\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'text/plain; charset=utf-8' }) },
  );
}

function sitemap() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${FELLOWSHIP_HOST}/</loc></url><url><loc>https://${FELLOWSHIP_HOST}/bibliography/</loc></url></urlset>\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'application/xml; charset=utf-8' }) },
  );
}

function logoutCookies() {
  return [SESSION_COOKIE_PREFIX, EDITOR_SESSION_COOKIE, ...new Set(presentations.map(sessionCookieName))]
    .map((name) => `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`);
}

async function handleFellowship(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/owner/login') return handleOwnerLogin(request, env);
  if (url.pathname === '/owner/logout') {
    if (request.method !== 'POST') return editorJson({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
    if (request.headers.get('Origin') !== EDITOR_ORIGIN) return editorJson({ error: 'Forbidden' }, 403);
    return redirect('/', 303, { cookies: logoutCookies() });
  }
  if (url.pathname === '/bibliography' || url.pathname.startsWith('/bibliography/')) {
    const ownerMethods = {
      '/bibliography/edit': ['GET', 'HEAD'],
      '/bibliography/edit/': ['GET', 'HEAD'],
      '/bibliography/api/editor/state': ['GET', 'HEAD', 'PUT'],
      '/bibliography/api/editor/suggestions': ['GET'],
    }[url.pathname] || (/^\/bibliography\/api\/editor\/suggestions\/[a-f0-9-]{36}$/.test(url.pathname) ? ['PATCH'] : null);
    const allowedMethods = {
      '/bibliography': ['GET', 'HEAD'],
      '/bibliography/': ['GET', 'HEAD'],
      '/bibliography/api/state': ['GET'],
      '/bibliography/api/suggestions': ['POST'],
    }[url.pathname] || ownerMethods;
    if (!allowedMethods) {
      return new Response('Not found', { status: 404, headers: responseHeaders({}, { noIndex: true }) });
    }
    if (!allowedMethods.includes(request.method)) {
      return new Response('Method not allowed', {
        status: 405,
        headers: responseHeaders({ Allow: allowedMethods.join(', ') }, { noIndex: true }),
      });
    }
    if (ownerMethods && !(await editorSessionIsValid(request, env))) {
      if (url.pathname === '/bibliography/edit/' || url.pathname === '/bibliography/edit') {
        return redirect('/owner/login?next=%2Fbibliography%2Fedit%2F', 303);
      }
      return editorJson({ error: 'Owner authentication required' }, 401);
    }
    if (ownerMethods && !['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') !== EDITOR_ORIGIN) return editorJson({ error: 'Forbidden' }, 403);
    if (url.pathname === '/bibliography') {
      url.pathname = '/bibliography/';
      return redirect(url.href);
    }
    if (!env.BIBLIOGRAPHY) return unavailable();
    // Preserve origin, body, cookies and client IP for the backend's own checks.
    return env.BIBLIOGRAPHY.fetch(request);
  }
  if (url.pathname === '/login') return handleLogin(request, env);
  if (url.pathname === '/logout') {
    return redirect('/', 303, {
      noIndex: true,
      cookies: logoutCookies(),
    });
  }

  if (url.pathname === EDITOR_SESSION_PATH) return handleEditorSession(request, env);

  if (url.pathname.startsWith(EDITOR_PATH_PREFIX)) {
    const deckId = url.pathname.slice(EDITOR_PATH_PREFIX.length);
    const presentation = !deckId.includes('/') ? presentationForId(deckId) : null;
    if (!presentation) return editorJson({ error: 'Not found' }, 404);
    return handleEditor(request, env, presentation);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: responseHeaders({ Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  }
  if (url.pathname === '/robots.txt') return robots();
  if (url.pathname === '/sitemap.xml') return sitemap();

  const canonicalPath = canonicalizeLegacyPath(url.pathname);
  if (canonicalPath !== url.pathname) {
    const target = new URL(url);
    target.pathname = canonicalPath;
    return redirect(target.href);
  }

  const presentation = presentationForPath(url.pathname);
  if (presentation && !(await requestIsAuthorized(request, presentation, env))) {
    if (!presentationPassword(presentation, env)) return unavailable();
    const login = new URL('/login', url);
    login.searchParams.set('next', `${url.pathname}${url.search}`);
    return redirect(login.href, 303, { noIndex: true });
  }

  const assetPath = fellowshipAssetPath(url.pathname, presentation);
  if (!assetPath) {
    return new Response('Not found', {
      status: 404,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  }
  return serveAsset(request, env, assetPath, { noIndex: Boolean(presentation) });
}

export function renderBibliographyMirror(html) {
  return html
    .replace(/<div class="nav-pages" id="siteNav">[\s\S]*?<\/div>\s*<\/nav>/, '<div class="nav-pages" id="siteNav" data-mint-site-nav data-current-id="agi-governance-bibliography"><div class="nav-divider">Resources</div><a class="nav-link nav-page active" href="https://bibliography.mintresearch.org/" aria-current="page">AGI Governance Bibliography</a></div></nav>')
    .replace('</head>', '<style>#bibliographySurface header .publication-caveat{max-width:none;width:100%;box-sizing:border-box}</style><script defer src="https://mintresearch.org/assets/mint-site-nav.v1.js?v=20260909.1"></script></head>')
    .replaceAll('Fellowship navigation', 'MINT navigation')
    .replaceAll('Fellowship menu', 'MINT menu')
    .replace('<a href="https://fellowship.mintresearch.org/">Fellowship</a>', '<a href="https://mintresearch.org/">MINT Lab</a>')
    .replace('id="editor-login" href="https://agi-governance.mintresearch.org/edit/"', 'id="editor-login" href="https://fellowship.mintresearch.org/bibliography/edit/"');
}

async function handleBibliographyMirror(request, env) {
  const { pathname } = new URL(request.url);
  const methods = {
    '/': ['GET', 'HEAD'],
    '/api/state': ['GET', 'HEAD'],
    '/api/suggestions': ['POST'],
    '/edit': ['GET', 'HEAD'],
    '/edit/': ['GET', 'HEAD'],
  }[pathname];
  if (!methods) return new Response('Not found', { status: 404 });
  if (!methods.includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: methods.join(', ') } });
  if (pathname === '/edit' || pathname === '/edit/') return redirect('https://fellowship.mintresearch.org/bibliography/edit/', 302);
  if (!env.BIBLIOGRAPHY) return unavailable();
  // Keep the incoming origin and client headers for backend suggestion validation.
  const response = await env.BIBLIOGRAPHY.fetch(request);
  if (pathname !== '/' || request.method !== 'GET' || response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  return new Response(renderBibliographyMirror(await response.text()), { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);
    const host = incoming.hostname.toLowerCase();

    if (legacyHosts[host]) return redirectToFellowship(request, legacyHosts[host]);

    if (host === 'bibliography.mintresearch.org') return handleBibliographyMirror(request, env);

    if (host === FELLOWSHIP_HOST) return handleFellowship(request, env);

    return new Response('Not found', {
      status: 404,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  },
};
