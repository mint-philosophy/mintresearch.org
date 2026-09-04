# AGI Governance Fellowship site

This Cloudflare Worker serves `fellowship.mintresearch.org` with a public
overview and a shared-password gate around four presentation routes: Day 1,
Day 2, Day 3, and Projects. The
password and the optional IP bypass list are Worker secrets; neither value is
stored in this repository. A successful password login creates a secure,
HTTP-only, twelve-hour session cookie.

The Worker serves the Fellowship shell and presentations from the isolated
`site-assets/` tree, so the protected HTML is not also published at the old
GitHub Pages paths. The former `agif1`, `agif2`, and `agif3` hosts permanently
redirect to the protected Fellowship day pages. The old main-site paths publish
small redirect documents because the apex domain goes directly to GitHub Pages.
All presentation responses retain HTTP-level no-indexing.

Required production secrets:

- `FELLOWSHIP_PASSWORD`
- `ALLOWED_IPS`

Run `npm test` before `npm run deploy`.
