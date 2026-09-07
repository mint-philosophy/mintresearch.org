# AGI Governance Fellowship site

This Cloudflare Worker serves `fellowship.mintresearch.org` with a public
overview and six dated presentation routes: 9.8 Definitions, 9.9 Philosophy,
9.9 Projects, 9.10 Should We Build AGI?, 9.11 AGI Institutions, and 9.14
Adaptation. Each calendar date has its own password gate. Philosophy and
Projects share September 9 access; passwords for other dates do not cross-unlock.
A successful login creates a secure, HTTP-only, twelve-hour date-specific
session cookie.

At 6:00 a.m. US Eastern on each listed date, the Worker begins serving that
date's presentation or presentations without a password. This is evaluated at
request time and does not depend on a scheduler. Exact-IP bypass remains
available, and every presentation response remains noindex before and after
release.

All six decks load the same same-origin, plain-text inline editor. Saved text is
stored in the existing `CONTENT_OVERRIDES` KV namespace and applied before the
Pretext layout pass. Viewing passwords never confer edit authority. The editor
controls appear only from the configured exact IP, and every save additionally
requires a separate `FELLOWSHIP_EDITOR_PASSWORD` session. Editor sessions are
HTTP-only, secure, same-site cookies; saves are revision checked, size bounded,
rendered with `textContent`, and retained in ninety-day history snapshots.

The Worker serves the Fellowship shell and presentations from the isolated
`site-assets/` tree, so the protected HTML is not also published at the old
GitHub Pages paths. The former `agif1`, `agif2`, and `agif3` hosts permanently
redirect to the protected Fellowship day pages. The old main-site paths publish
small redirect documents because the apex domain goes directly to GitHub Pages.
All presentation responses retain HTTP-level no-indexing.

The public bibliography lives at `/bibliography/` and is linked from the overview
and shared Fellowship menu. The `BIBLIOGRAPHY` service binding forwards the
original request to `mint-agi-governance-bibliography`; that backend handles the
prefix and validates its own requests. The router permits only the page
(`GET`/`HEAD`), `/bibliography/api/state` (`GET`), and
`/bibliography/api/suggestions` (`POST`). Editing remains on the existing
`https://agi-governance.mintresearch.org/edit/` endpoint. Deploy the backend's
prefix support before deploying this binding. No presentation gate changes.

Required production secrets:

- `FELLOWSHIP_PASSWORD_SEPTEMBER_8`
- `FELLOWSHIP_PASSWORD_SEPTEMBER_9`
- `FELLOWSHIP_PASSWORD_SEPTEMBER_10`
- `FELLOWSHIP_PASSWORD_SEPTEMBER_11`
- `FELLOWSHIP_PASSWORD_SEPTEMBER_14`
- `FELLOWSHIP_EDITOR_PASSWORD`
- `ALLOWED_IPS`

`FELLOWSHIP_OWNER_IPS` optionally registers the owner's current exact addresses
without replacing the existing allowlist. It never bypasses editor authentication.

Run `npm test` before `npm run deploy`.

Definitions is framed at `/definitions/`; its six-slide deck assets live in
`site-assets/definitions/` and its wrapper in `site-assets/fellowship/definitions/`.
It uses the same date-gate, exact-IP bypass, noindex headers, and presentation
shell as the other decks. No presentation content belongs in `public/`.

Philosophy is framed at `/philosophy/`; its five-slide deck uses deep ochre
(`#856018`, pale `#F3E8CA`) and preserves the latest saved v6.1 source wording,
including the vulnerability-scanning block. Speaker notes are excluded. Its
native editable counterpart is v7, with the same colour-only change. The hub and
shared menu date Philosophy to 9.9 immediately before Projects, the other 9.9
session, following Seth's specified order.

Production deployment belongs to `Seths-M4`, whose Cloudflare account owns the
MINT zone. The M5 OAuth account does not own that zone; do not deploy the MINT
Worker with that account. Run `npm run check:agif-presentations` from the repo
root and `npm --prefix agif-router-worker test` before deployment from the M4.
