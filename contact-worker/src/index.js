const ORIGINS = new Set(['https://mintresearch.org', 'https://www.mintresearch.org']);
const MAX_BYTES = 48 * 1024;
const EMAIL = /^[^\s<>@,;\x00-\x1f\x7f]+@[^\s<>@,;\x00-\x1f\x7f]+\.[^\s<>@,;\x00-\x1f\x7f]+$/;
const SUCCESS = 'Thank you. Your message has been submitted to the lab.';

class FormError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function readForm(request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES) {
    throw new FormError(413, 'Your message is too long. Please shorten it and try again.');
  }
  const type = request.headers.get('content-type')?.split(';')[0].trim();
  if (type !== 'application/x-www-form-urlencoded') {
    throw new FormError(415, 'Unsupported submission format. Please use the website form.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new FormError(400, 'Please fill in the contact form.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new FormError(413, 'Your message is too long. Please shorten it and try again.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const form = new URLSearchParams(new TextDecoder().decode(bytes));
  for (const key of ['name', 'email', 'affiliation', 'message', '_honey']) {
    if (form.getAll(key).length > 1) throw new FormError(400, 'Please submit each field once.');
  }
  return form;
}

function field(form, key, limit, required = true) {
  const value = (form.get(key) || '').trim();
  if ((required && !value) || value.length > limit || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) {
    throw new FormError(400, `Please check the ${key} field (maximum ${limit} characters).`);
  }
  if (key !== 'message' && /[\r\n]/.test(value)) {
    throw new FormError(400, `Please keep the ${key} field on one line.`);
  }
  return value;
}

function reply(request, status, message) {
  const origin = request.headers.get('origin');
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' });
  if (ORIGINS.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  if (status === 429) headers.set('Retry-After', '60');
  if (request.headers.get('accept')?.includes('application/json')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ ok: status === 200, message }), { status, headers });
  }
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  // Messages are fixed server text; never reflect submitted content into HTML.
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact | MINT Research</title><style>body{font:18px/1.6 system-ui;margin:64px auto;padding:0 24px;max-width:640px;color:#202124}a{color:#006b56}</style><h1>MINT Research</h1><p>${message}</p><a href="https://mintresearch.org/#contact">Return to the contact form</a></html>`, { status, headers });
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/contact') return reply(request, 404, 'Page not found.');
    if (!ORIGINS.has(request.headers.get('origin'))) return reply(request, 403, 'Please submit through mintresearch.org.');
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin'),
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store', Vary: 'Origin',
      } });
    }
    if (request.method !== 'POST') return reply(request, 405, 'Please use the contact form to send a message.');
    try {
      if (!env.CONTACT_RATE_LIMIT || !env.EMAIL || !EMAIL.test(env.CONTACT_TO || '') || !EMAIL.test(env.CONTACT_FROM || '')) {
        throw new Error('Contact service not configured');
      }
      // IP limits suit this anonymous, low-volume form; shared networks get five attempts/minute.
      const { success } = await env.CONTACT_RATE_LIMIT.limit({ key: `contact:${request.headers.get('cf-connecting-ip') || 'unknown'}` });
      if (!success) return reply(request, 429, 'Too many attempts. Please wait a minute and try again.');
      const form = await readForm(request);
      if (form.get('_honey')) return reply(request, 200, SUCCESS);
      const name = field(form, 'name', 160);
      const email = field(form, 'email', 254);
      const affiliation = field(form, 'affiliation', 240, false);
      const message = field(form, 'message', 8000);
      if (!EMAIL.test(email)) throw new FormError(400, 'Please enter a valid email address.');
      const result = await env.EMAIL.send({
        to: env.CONTACT_TO,
        from: { email: env.CONTACT_FROM, name: 'MINT Research contact form' },
        replyTo: email,
        subject: 'New inquiry from mintresearch.org',
        text: `Website contact submission\n\nName: ${name}\nEmail: ${email}\nAffiliation: ${affiliation || '(not supplied)'}\n\n${message}`,
      });
      if (!result?.messageId) throw new Error('No email acceptance receipt');
      return reply(request, 200, SUCCESS);
    } catch (error) {
      if (error instanceof FormError) return reply(request, error.status, error.message);
      // Do not log message contents, addresses, or provider errors containing personal data.
      console.error('Contact submission failed');
      return reply(request, 503, 'We could not confirm submission. Please keep your message and try again later.');
    }
  },
};
