# MINT website maintenance

## Canonical sources and decisions

- Primary site pages, including guide and 404, are static HTML under `public/`.
  Astro builds generated reports and archives. GitHub Pages publishes `main`.
- Shared navigation: `public/assets/mint-site-nav.v1.js`; shared banner:
  `public/assets/mint-banner.css` and `mint-banner.js`. See README and
  `docs/shared-site-contracts.md` for current ownership boundaries.
- Volatile infrastructure facts come from the Minty guide-updater snapshot;
  corpus-map layout fixes must also live in its canonical Minty generator.
- Seth approved replacing FormSubmit with a MINT-owned Cloudflare endpoint,
  preserving the form design and showing confirmation on the website.

## Contact Form

- Implementation: `contact-worker/` and `public/assets/contact-form.js`.
  Activation and verification procedure: `contact-worker/README.md`.
- Endpoint: `https://contact.mintresearch.org/contact`, Worker `mint-contact`.
  Original destination `contact@mintresearch.org` was sourced from delivered
  FormSubmit messages. Real inbox delivery passed on 2026-09-12 (SPF/DMARC pass).
- Cloudflare's free verified-destination sending is used. Do not enable inbound
  Email Routing or replace Google MX records. Sender and recipient are restricted
  in `contact-worker/wrangler.toml`; the visitor supplies only Reply-To.
- Wrangler OAuth was renewed on 2026-09-12. It supports Worker/email operations,
  but DNS edits used the authenticated dashboard. No API token was exported.
- Cleanup: an unused pending Cloudflare destination `seth@mintresearch.org`
  (ID `32aeddd642364e6da4627d612dea8ef7`) could not yet be deleted because
  Cloudflare rejected deletion as too recently created. It is not used by the
  Worker or any routing rule. Retry deletion after the provider cooldown.
