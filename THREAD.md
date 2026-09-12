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

## Open contact-form work

- Implementation: `contact-worker/` and `public/assets/contact-form.js`.
  Activation and verification procedure: `contact-worker/README.md`.
- Cloudflare Wrangler's saved OAuth session was expired on 2026-09-12; Chrome
  was also signed out. The v2 daemon vault has no `CLOUDFLARE_API_TOKEN`.
  A supervised 1Password lookup timed out without returning any credentials.
- Seth has been asked to sign in to Cloudflare and identify the destination
  inbox. The existing FormSubmit action contains only an opaque token.
- Do not activate the homepage replacement until the endpoint is deployed and
  the confirmed inbox receives a test message. The current homepage still
  uses FormSubmit. Live deployment, mailbox verification, and browser QA remain.
