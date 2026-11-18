import { fellowsHead, fellowsBanner, fellowsCSS } from './fellows-style.js';

// The Fellowship presentations were moved off the website on 18 November 2026
// (see README.md). This Worker still serves the bibliography on the Fellowship
// host and its public mirror, the owner login that bibliography editing uses,
// and the private fellows directory. Every former presentation route returns a
// short content-free notice.
const FELLOWSHIP_HOST = 'fellowship.mintresearch.org';
const NO_INDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';
const SESSION_COOKIE_PREFIX = 'mint_fellowship_session';
const SESSION_SECONDS = 12 * 60 * 60;
const EDITOR_ORIGIN = `https://${FELLOWSHIP_HOST}`;
const EDITOR_SESSION_COOKIE = 'mint_fellowship_editor';
const EDITOR_SESSION_SECONDS = 30 * 24 * 60 * 60;

const legacyHosts = {
  'agif1.mintresearch.org': '/',
  'agif2.mintresearch.org': '/',
  'agif3.mintresearch.org': '/',
};

// Former presentation, viewer-login, deck-editor and deck-asset routes.
const retiredPrefixes = [
  '/definitions', '/philosophy', '/projects', '/should-we-build-agi', '/agi-institutions',
  '/adaptation', '/societal-adaptation', '/day-1', '/day-2', '/day-3', '/fellowship',
  '/login', '/logout', '/editor', '/assets', '/_astro',
];

const textEncoder = new TextEncoder();

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

function safeNext(value) {
  try {
    const url = new URL(String(value || ''), `https://${FELLOWSHIP_HOST}`);
    if (url.origin !== `https://${FELLOWSHIP_HOST}`) return '/';
    return url.pathname === '/bibliography/edit/' ? `${url.pathname}${url.search}` : '/';
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

const PAGE_CSS = `
    :root { color-scheme:light; --ink:#0d2f2d; --muted:#506867; --accent:#087f75; --line:#b9d7d3; --paper:#f7fbfa; --panel:#fff; }
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
    .login-back { display:inline-block; margin:22px 18px 0 0; color:var(--accent); text-decoration:none; }
    @media (max-width:520px) { body{padding:14px}.login-body{padding:25px 20px}.login-bar{flex-direction:column;gap:2px} }`;

function pageShell(title, barLabel, body) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="${NO_INDEX}">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/x-icon" href="https://mintresearch.org/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <style>${PAGE_CSS}
  </style>
</head>
<body>
  <main class="login-shell">
    <div class="login-bar"><span>MINT Research Lab</span><span>${escapeHtml(barLabel)}</span></div>
    <div class="login-body">
${body}
    </div>
  </main>
</body>
</html>`;
}

function loginPage(next, invalid = false) {
  const error = invalid
    ? '<p class="login-error" role="alert">That password was not recognized.</p>'
    : '';
  return pageShell('Owner login — AGI Governance Bibliography', 'AGI Governance Bibliography', `      <h1>Owner login</h1>
      <p>Log in to edit the AGI Governance Bibliography. Stay signed in for 30 days on this browser.</p>
      <form method="post" action="/owner/login">
        <input type="hidden" name="next" value="${escapeHtml(next)}">
        <label for="password">Owner password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Log in</button>
      </form>
      ${error}
      <a class="login-back" href="/bibliography/">Public bibliography</a>`);
}

function noticePage() {
  return pageShell('AGI Governance Fellowship — MINT Research Lab', 'AGI Governance Fellowship', `      <h1>AGI Governance Fellowship</h1>
      <p>The AGI Governance Fellowship ran at the Johns Hopkins School of Government and Policy from 8 to 25 September 2026. Its presentations are no longer online.</p>
      <a class="login-back" href="https://bibliography.mintresearch.org/">AGI Governance Bibliography</a>
      <a class="login-back" href="https://mintresearch.org/">MINT Research Lab</a>`);
}

function notice(request, status) {
  const headers = responseHeaders({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https://mintresearch.org; frame-ancestors 'none'; base-uri 'none'",
  }, { noIndex: true });
  return new Response(request.method === 'HEAD' ? null : noticePage(), { status, headers });
}

function unavailable() {
  return new Response('Fellowship access is temporarily unavailable.', {
    status: 503,
    headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true, noStore: true }),
  });
}

// The service-binding call rejects when the backend dies (for example over its CPU
// limit). Answer 503 instead of letting the router throw too.
async function fetchBibliography(request, env) {
  if (!env.BIBLIOGRAPHY) return unavailable();
  try {
    return await env.BIBLIOGRAPHY.fetch(request);
  } catch (error) {
    console.error('Bibliography backend failed:', error?.message || error);
    return unavailable();
  }
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

async function ownerLoginLimit(request, env, purpose = 'owner') {
  if (!env.OWNER_LOGIN_LIMITER) return editorJson({ error: 'Login is temporarily unavailable' }, 503);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const network = ipv6NetworkPrefix(ip) || ip;
  const key = bytesToBase64Url(await digest(`fellowship-${purpose}-login:${network}`));
  const { success } = await env.OWNER_LOGIN_LIMITER.limit({ key });
  return success ? null : editorJson({ error: 'Too many login attempts. Please wait one minute.' }, 429, { 'Retry-After': '60' });
}

async function handleOwnerLogin(request, env) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get('next'));
  const render = (target, invalid = false) => new Response(loginPage(target, invalid), {
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

function robots() {
  return new Response(
    `User-agent: *\nDisallow: /$\nDisallow: /owner/\nAllow: /bibliography/\nSitemap: https://${FELLOWSHIP_HOST}/sitemap.xml\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'text/plain; charset=utf-8' }) },
  );
}

function sitemap() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${FELLOWSHIP_HOST}/bibliography/</loc></url></urlset>\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'application/xml; charset=utf-8' }) },
  );
}

// Also clears the retired viewing cookie, which no route reads any more.
function logoutCookies() {
  return [EDITOR_SESSION_COOKIE, `${SESSION_COOKIE_PREFIX}_slides`]
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
    // Preserve origin, body, cookies and client IP for the backend's own checks.
    return fetchBibliography(request, env);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: responseHeaders({ Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  }
  if (url.pathname === '/robots.txt') return robots();
  if (url.pathname === '/sitemap.xml') return sitemap();
  if (url.pathname === '/' || url.pathname === '/index.html') return notice(request, 200);
  if (retiredPrefixes.some((prefix) => hasPrefix(url.pathname, prefix))) return notice(request, 410);
  return new Response('Not found', {
    status: 404,
    headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
  });
}

export function renderBibliographyMirror(html) {
  return html
    .replace(/<div class="nav-pages" id="siteNav">[\s\S]*?<\/div>\s*<\/nav>/, '<div class="nav-pages" id="siteNav" data-mint-site-nav data-current-id="agi-governance-bibliography"><div class="nav-divider">Resources</div><a class="nav-link nav-page active" href="https://bibliography.mintresearch.org/" aria-current="page">AGI Governance Bibliography</a></div></nav>')
    .replace('</head>', '<style>#bibliographySurface header .publication-caveat{max-width:none;width:100%;box-sizing:border-box}</style><script defer src="https://mintresearch.org/assets/mint-site-nav.v1.js?v=20261118.1"></script></head>')
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
  // Keep the incoming origin and client headers for backend suggestion validation.
  const response = await fetchBibliography(request, env);
  if (pathname !== '/' || request.method !== 'GET' || response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  return new Response(renderBibliographyMirror(await response.text()), { status: response.status, headers });
}

const fellowsAccess = { accessGroup: 'fellows-directory', passwordBinding: 'FELLOWSHIP_PASSWORD_SEPTEMBER_14' };

async function handleFellows(request, env) {
  const url = new URL(request.url);
  const headers = responseHeaders({ 'Content-Type': 'text/html; charset=utf-8' }, { noIndex: true, noStore: true });
  headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https://mintresearch.org; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  const reply = (body, status = 200) => new Response(request.method === 'HEAD' ? null : body, { status, headers });
  if (url.pathname === '/robots.txt') {
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return reply('User-agent: *\nDisallow: /\n');
  }
  if (!['/', '/login', '/logout'].includes(url.pathname)) return reply('Not found', 404);
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) return reply('Method not allowed', 405);
  const password = presentationPassword(fellowsAccess, env);
  if (!password) return reply('Directory temporarily unavailable', 503);
  if (request.method === 'POST') {
    if (request.headers.get('Origin') !== url.origin) return reply('Forbidden', 403);
    if (url.pathname === '/logout') {
      headers.set('Set-Cookie', sessionCookieName(fellowsAccess) + '=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict');
      headers.set('Location', '/'); return reply(null, 303);
    }
    if (url.pathname !== '/login') return reply('Method not allowed', 405);
    const limited = await ownerLoginLimit(request, env);
    if (limited) return limited;
    const body = await request.text();
    if (body.length > 4096) return reply('Request too large', 413);
    const supplied = new URLSearchParams(body).get('password');
    if (await passwordMatches(supplied, password)) {
      headers.set('Set-Cookie', await createSessionCookie(fellowsAccess, password, env));
      headers.set('Location', '/'); return reply(null, 303);
    }
  }
  if (await sessionIsValid(request, fellowsAccess, password, env)) {
    const html = await env.CONTENT_OVERRIDES.get('fellows:directory:html');
    return html ? reply(html) : reply('Directory temporarily unavailable', 503);
  }
  const error = request.method === 'POST' ? '<p role="alert">Password not recognised. Please try again.</p>' : '';
  return reply('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Fellows · MINT</title>' + fellowsHead + '<style>' + fellowsCSS + '</style></head><body>' + fellowsBanner + '<main class="login"><small>AGI GOVERNANCE FELLOWSHIP</small><h1>Fellows directory</h1><form method="post" action="/login"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button>View fellows →</button></form>' + error + '</main></body></html>', request.method === 'POST' ? 401 : 200);
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);
    const host = incoming.hostname.toLowerCase();

    if (host === 'fellows.mintresearch.org') return handleFellows(request, env);

    if (legacyHosts[host]) return redirectToFellowship(request, legacyHosts[host]);

    if (host === 'bibliography.mintresearch.org') return handleBibliographyMirror(request, env);

    if (host === FELLOWSHIP_HOST) return handleFellowship(request, env);

    return new Response('Not found', {
      status: 404,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  },
};
