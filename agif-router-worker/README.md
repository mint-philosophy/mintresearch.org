# AGI Governance Fellowship site

This Cloudflare Worker serves `fellowship.mintresearch.org`: an overview and
six presentation routes, 9.8 Definitions, 9.9 Philosophy, 9.9 Projects, 9.10
Should We Build AGI?, 9.11 AGI Institutions, and 9.14 Adaptation. The dates
label teaching sessions only.

Since 23 September 2026 one permanent gate covers the overview and all six
decks, with their assets and saved text. A single viewing password,
`FELLOWSHIP_SLIDES_PASSWORD`, opens all of them, and a successful login creates
a secure, HTTP-only, same-site twelve-hour session cookie. Nothing opens on a
date, no network address bypasses the gate, and the old date-specific passwords
and sessions are rejected. Every presentation response is noindex. Only the
bibliography is public. Do not restore scheduled opening or an IP bypass; the
tests assert that neither exists.

All six decks load the same same-origin, plain-text inline editor. Saved text is
stored in the existing `CONTENT_OVERRIDES` KV namespace and applied before the
Pretext layout pass. Viewing passwords never confer edit authority. The editor
owner login at `/owner/login` uses `FELLOWSHIP_EDITOR_PASSWORD` and grants
viewing and editing across all six decks and the bibliography from any network.
The overview shows Owner login or the signed-in status and a POST logout button.
Every save requires this separate owner session. Editor sessions last thirty days and are
HTTP-only, secure, same-site cookies; saves are revision checked, size bounded,
rendered with `textContent`, and retained in ninety-day history snapshots.

The Worker serves the Fellowship shell and presentations from the isolated
`site-assets/` tree, so the protected HTML is not also published at the old
GitHub Pages paths. The former `agif1`, `agif2`, and `agif3` hosts, and the old
`/day-1/`, `/day-2/` and `/day-3/` paths, permanently redirect to the protected
decks. The old main-site paths (`/agif/`, `/should-we-build-agi/`,
`/agi-institutions/`, `/societal-adaptation/`) publish small redirect documents
with no slide content, because the apex domain goes directly to GitHub Pages.
All presentation responses retain HTTP-level no-indexing.

The public bibliography lives at `/bibliography/` and is linked from the overview
and shared Fellowship menu. The `BIBLIOGRAPHY` service binding forwards the
original request to `mint-agi-governance-bibliography`; that backend handles the
prefix and validates its own requests. The router permits only the page
(`GET`/`HEAD`), `/bibliography/api/state` (`GET`), and
`/bibliography/api/suggestions` (`POST`) publicly. `/bibliography/edit/` and its
editor APIs require the owner cookie; the bibliography backend independently
verifies it using the same secret. Existing email-code editing at
`https://agi-governance.mintresearch.org/edit/` is unchanged. Deploy the backend
before the router and set the same owner password in both Workers.

Required production secrets:

- `FELLOWSHIP_SLIDES_PASSWORD`: viewing the overview and all six decks; if it
  is missing, every gated route fails closed
- `FELLOWSHIP_EDITOR_PASSWORD`: the owner login, for editing
- `FELLOWSHIP_PASSWORD_SEPTEMBER_14`: the private fellows directory only (below)

The other `FELLOWSHIP_PASSWORD_SEPTEMBER_*` secrets are no longer read.

`ALLOWED_IPS`, `FELLOWSHIP_OWNER_IPS` (exact addresses) and
`FELLOWSHIP_OWNER_IPV6_NETWORKS` (explicit `/64` networks only, so IPv6
privacy-address rotation still matches; other sizes are rejected) are optional.
They only decide where a signed-in viewer is shown the editor's controls, which
lead to the owner login. They never open a deck, never bypass editor
authentication, and do not restrict owner sessions.
The `OWNER_LOGIN_LIMITER` binding permits five attempts per minute per network
key (IPv6 grouped by /64) for the viewing and the owner logins alike; missing
rate limiting fails closed.

Run `npm test` before `npm run deploy`.

Definitions is framed at `/definitions/`; its seven-slide deck assets live in
`site-assets/definitions/` and its wrapper in `site-assets/fellowship/definitions/`.
It uses the same gate, noindex headers and presentation shell as the other
decks. No presentation content belongs in `public/`.

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

Exception, approved by Seth on 7 November 2026: Ned Howells-Whitaker may deploy
small maintenance and reliability fixes like the bibliography 503 handling
without asking first. He deploys from his own machine with the shared
`lab@mintresearch.org` Wrangler login. That login can see two Cloudflare
accounts, so set `CLOUDFLARE_ACCOUNT_ID=2b3c6c03e00ea15cd86a45e9f880e74b`. Run
the same checks and tests first, deploy only from `main` once the fix is
merged, and record the deployed version here or in the PR. Larger changes still
go through Seth.

`bibliography.mintresearch.org` is the public bibliography mirror. It uses the
same `BIBLIOGRAPHY` service and stored state as the Fellowship bibliography,
with the main MINT Resources sidebar. Public suggestion requests retain the
incoming origin and client headers for backend validation. Editing links lead
to the existing Fellowship owner login; editor APIs are not exposed on the mirror.

## Private fellows directory

`fellows.mintresearch.org` is a standalone, permanently password-protected
name/profile directory. It reuses `FELLOWSHIP_PASSWORD_SEPTEMBER_14`, with a
separate host-only twelve-hour session, no scheduled release and no IP bypass.
It has no navigation or sitemap entry; every response is noindex/no-store and
robots disallows the entire host. Login uses the existing rate limiter.
The HTML is stored only in `CONTENT_OVERRIDES` key `fellows:directory:html`,
never in this public repository or the static asset bundle. Its canonical
source is the private minty-private repository's
`Thread-Contexts/agi-governance-fellowship/fellows-directory.html`.
Update content with `wrangler kv key put --binding CONTENT_OVERRIDES --remote
fellows:directory:html --path <private-source-file>` and verify readback.
