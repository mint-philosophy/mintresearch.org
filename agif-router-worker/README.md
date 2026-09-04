# AGI Governance Fellowship site

This Cloudflare Worker serves `fellowship.mintresearch.org` with a public
overview and a shared-password gate around the three presentation routes. The
password and the optional IP bypass list are Worker secrets; neither value is
stored in this repository. A successful password login creates a secure,
HTTP-only, twelve-hour session cookie.

The Worker serves the Fellowship shell and existing presentation assets through
the static-assets binding. The old main-site routes and the former `agif1`,
`agif2`, and `agif3` hosts permanently redirect to the protected Fellowship day
pages. All presentation responses retain HTTP-level no-indexing.

Required production secrets:

- `FELLOWSHIP_PASSWORD`
- `ALLOWED_IPS`

Run `npm test` before `npm run deploy`.
