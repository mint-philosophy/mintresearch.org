# Contact endpoint

MINT-owned replacement for the homepage's FormSubmit action. The Worker accepts
URL-encoded POSTs at `/contact` and sends plain-text email with Cloudflare's
native `EMAIL` binding. The recipient and sender are server configuration;
visitors can only set Reply-To. It sends no automatic replies to visitors.

Endpoint: `https://contact.mintresearch.org/contact`. The homepage opts into
this endpoint. The original destination, `contact@mintresearch.org`, was sourced
from delivered FormSubmit mail and verified in Cloudflare. Both sender and
destination are restricted to that address. No paid plan was enabled.

Live delivery was verified on 2026-09-12 in the original destination's inbox,
with SPF and DMARC passing and the visitor address preserved as Reply-To.
Cloudflare's DKIM public key is published at `cf2024-1._domainkey`; initial Gmail
delivery still used a cached negative DKIM lookup. The existing SPF record was
extended with `include:_spf.mx.cloudflare.net`. Google MX records were preserved;
Cloudflare inbound Email Routing was not enabled.

## Configuration and activation

1. Authenticate Wrangler to the existing MINT Cloudflare account. Pin that
   account ID in `wrangler.toml` after verifying it.
2. Inspect Email Service configuration. Source the destination inbox from Seth
   or the existing form configuration; the FormSubmit token is opaque. Verify
   that destination and a permitted sender, and configure `CONTACT_TO` and
   `CONTACT_FROM` through `wrangler secret put`. Never commit mailbox credentials.
3. Confirm Email Sending is available for the sender domain. Preserve existing
   inbound mail routing; do not replace the domain's mail-provider MX records.
4. Restrict `send_email` with `allowed_destination_addresses` and
   `allowed_sender_addresses` for those verified addresses. Check that the
   chosen rate-limit namespace does not collide with another account binding.
5. Configure a MINT custom domain for this Worker, deploy, and submit one
   Minty-labelled test inquiry to the confirmed recipient. Check both the
   service acceptance and receipt before activating the homepage.
6. In `public/index.html`, replace the contact form action with the verified
   Worker URL ending in `/contact`, add `data-mint-contact`, remove FormSubmit's
   `_subject`, `_captcha`, `_next`, and `_template` inputs, and retain `_honey`
   with `tabindex="-1"` and `autocomplete="off"`. Add a deferred script loading
   `/assets/contact-form.js`. Set input maxlengths to 160 (name), 254 (email),
   240 (affiliation), and 8000 (message).
7. Verify desktop/mobile success and failure states, native submission without
   JavaScript, then build and publish the homepage. Update this status and
   `THREAD.md` with the deployed endpoint and verified delivery state.

The client only binds to `form[data-mint-contact]`. With JavaScript, confirmation
is inline above the send button. Without JavaScript, the
Worker renders an ad-free HTML receipt with a link back to the contact section.

## Checks

```sh
npm ci
npm test
npm run test:browser
npx wrangler deploy --dry-run
```

The tests mock email acceptance and rate limiting; they do not prove live inbox
delivery. Rate limits are five attempts per IP per minute per Cloudflare
location, with Cloudflare's documented eventual consistency. Origin checks and
a honeypot provide basic additional filtering, not proof a sender is human.
The endpoint caps streamed request bodies at 48 KiB and message text at 8000
characters. It stores no submissions and logs no message contents or addresses.

References: [email binding](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/),
[binding restrictions](https://developers.cloudflare.com/email-service/configuration/send-bindings/),
[rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
