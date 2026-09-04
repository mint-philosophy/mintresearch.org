const FELLOWSHIP_HOST = 'fellowship.mintresearch.org';
const NO_INDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';
const SESSION_COOKIE = 'mint_fellowship_session';
const SESSION_SECONDS = 12 * 60 * 60;

const legacyHosts = {
  'agif1.mintresearch.org': '/day-1/',
  'agif2.mintresearch.org': '/day-2/',
  'agif3.mintresearch.org': '/day-3/',
};

const mainSiteRoutes = {
  '/agif': '/',
  '/should-we-build-agi': '/day-1/',
  '/agi-institutions': '/day-2/',
  '/societal-adaptation': '/day-3/',
};

const daySources = {
  '/day-1': '/should-we-build-agi',
  '/day-2': '/agi-institutions',
  '/day-3': '/societal-adaptation',
};

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

function redirect(location, status = 308, { noIndex = true, cookie = null } = {}) {
  const headers = responseHeaders({ Location: location }, { noIndex, noStore: status !== 308 });
  if (status === 308) headers.set('Cache-Control', 'public, max-age=300');
  if (cookie) headers.append('Set-Cookie', cookie);
  return new Response(null, { status, headers });
}

function redirectToFellowship(request, path) {
  const incoming = new URL(request.url);
  const target = new URL(path, `https://${FELLOWSHIP_HOST}`);
  target.search = incoming.search;
  return redirect(target.href);
}

function mainSiteDestination(pathname) {
  for (const [prefix, destination] of Object.entries(mainSiteRoutes)) {
    if (hasPrefix(pathname, prefix)) return destination;
  }
  return null;
}

function safeNext(value) {
  try {
    const url = new URL(String(value || ''), `https://${FELLOWSHIP_HOST}`);
    if (url.origin !== `https://${FELLOWSHIP_HOST}`) return '/';
    return Object.keys(daySources).some((prefix) => hasPrefix(url.pathname, prefix))
      ? `${url.pathname}${url.search}`
      : '/';
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

async function sessionSignature(expiry, password) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(`agif:${expiry}`))));
}

async function createSessionCookie(password) {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = await sessionSignature(expiry, password);
  return `${SESSION_COOKIE}=${expiry}.${signature}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return '';
}

async function sessionIsValid(request, password) {
  if (!password) return false;
  const value = cookieValue(request, SESSION_COOKIE);
  const [expiryText, suppliedSignature, ...extra] = value.split('.');
  if (!expiryText || !suppliedSignature || extra.length) return false;
  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false;
  const expectedSignature = await sessionSignature(expiry, password);
  return constantTimeEqual(textEncoder.encode(suppliedSignature), textEncoder.encode(expectedSignature));
}

function ipIsAllowed(request, env) {
  const clientIp = request.headers.get('CF-Connecting-IP') || '';
  return Boolean(clientIp) && csv(env.ALLOWED_IPS).includes(clientIp);
}

async function requestIsAuthorized(request, env) {
  return ipIsAllowed(request, env) || sessionIsValid(request, env.FELLOWSHIP_PASSWORD);
}

function loginPage(next, invalid = false) {
  const nextValue = escapeHtml(safeNext(next));
  const error = invalid
    ? '<p class="login-error" role="alert">That password was not recognized.</p>'
    : '';
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="${NO_INDEX}">
  <title>Fellowship access — MINT Lab</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; --ink:#0d2f2d; --muted:#506867; --accent:#087f75; --line:#b9d7d3; --paper:#f7fbfa; --panel:#fff; }
    * { box-sizing:border-box; }
    html, body { min-height:100%; margin:0; }
    body { display:grid; place-items:center; padding:28px; background:linear-gradient(145deg,#e6f5f2,#f9fcfb 48%,#d9efeb); color:var(--ink); font:14px/1.6 "JetBrains Mono",monospace; }
    .login-shell { width:min(520px,100%); background:var(--panel); border:1px solid var(--line); box-shadow:0 24px 70px rgba(13,47,45,.14); }
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
      <h1>Fellowship materials</h1>
      <p>Enter the shared Fellowship password to open the presentation.</p>
      <form method="post" action="/login">
        <input type="hidden" name="next" value="${nextValue}">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Open presentation</button>
      </form>
      ${error}
      <a class="login-back" href="/">← Fellowship overview</a>
    </div>
  </main>
</body>
</html>`;
}

function renderLogin(next, invalid = false) {
  return new Response(loginPage(next, invalid), {
    status: invalid ? 401 : 200,
    headers: responseHeaders({ 'Content-Type': 'text/html; charset=utf-8' }, { noIndex: true, noStore: true }),
  });
}

async function handleLogin(request, env) {
  const url = new URL(request.url);
  if (request.method === 'GET' || request.method === 'HEAD') {
    const next = safeNext(url.searchParams.get('next'));
    if (await requestIsAuthorized(request, env)) return redirect(next, 303, { noIndex: true });
    const response = renderLogin(next);
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
  if (!env.FELLOWSHIP_PASSWORD) {
    return new Response('Fellowship access is temporarily unavailable.', {
      status: 503,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true, noStore: true }),
    });
  }
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 8_192) return renderLogin('/', true);
  const body = await request.text();
  if (body.length > 8_192) return renderLogin('/', true);
  const form = new URLSearchParams(body);
  const next = safeNext(form.get('next'));
  if (!(await passwordMatches(form.get('password'), env.FELLOWSHIP_PASSWORD))) return renderLogin(next, true);
  return redirect(next, 303, {
    noIndex: true,
    cookie: await createSessionCookie(env.FELLOWSHIP_PASSWORD),
  });
}

function fellowshipAssetPath(pathname) {
  if (pathname === '/') return '/fellowship/index.html';
  for (const [prefix, source] of Object.entries(daySources)) {
    if (pathname === prefix || pathname === `${prefix}/`) return `/fellowship${prefix}/index.html`;
    if (pathname === `${prefix}/index.html`) return `/fellowship${prefix}/index.html`;
    if (pathname.startsWith(`${prefix}/`)) return `${source}${pathname.slice(prefix.length)}`;
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
  return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

function robots() {
  return new Response(
    `User-agent: *\nAllow: /$\nDisallow: /day-1/\nDisallow: /day-2/\nDisallow: /day-3/\nDisallow: /login\nSitemap: https://${FELLOWSHIP_HOST}/sitemap.xml\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'text/plain; charset=utf-8' }) },
  );
}

function sitemap() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${FELLOWSHIP_HOST}/</loc></url></urlset>\n`,
    { headers: responseHeaders({ 'Cache-Control': 'public, max-age=600', 'Content-Type': 'application/xml; charset=utf-8' }) },
  );
}

async function handleFellowship(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/login') return handleLogin(request, env);
  if (url.pathname === '/logout') {
    return redirect('/', 303, {
      noIndex: true,
      cookie: `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`,
    });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: responseHeaders({ Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  }
  if (url.pathname === '/robots.txt') return robots();
  if (url.pathname === '/sitemap.xml') return sitemap();

  const protectedDay = Object.keys(daySources).find((prefix) => hasPrefix(url.pathname, prefix));
  if (protectedDay && !(await requestIsAuthorized(request, env))) {
    const login = new URL('/login', url);
    login.searchParams.set('next', `${url.pathname}${url.search}`);
    return redirect(login.href, 303, { noIndex: true });
  }

  const assetPath = fellowshipAssetPath(url.pathname);
  if (!assetPath) {
    return new Response('Not found', {
      status: 404,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  }
  return serveAsset(request, env, assetPath, { noIndex: Boolean(protectedDay) });
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);
    const host = incoming.hostname.toLowerCase();

    if (legacyHosts[host]) return redirectToFellowship(request, legacyHosts[host]);

    if (host === 'mintresearch.org' || host === 'www.mintresearch.org') {
      const destination = mainSiteDestination(incoming.pathname);
      if (destination) return redirectToFellowship(request, destination);
      return new Response('Not found', {
        status: 404,
        headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
      });
    }

    if (host === FELLOWSHIP_HOST) return handleFellowship(request, env);

    return new Response('Not found', {
      status: 404,
      headers: responseHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }, { noIndex: true }),
    });
  },
};
