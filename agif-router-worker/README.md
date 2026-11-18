# Fellowship host router

This Cloudflare Worker, `mint-agif-router`, used to serve the AGI Governance
Fellowship presentations at `fellowship.mintresearch.org`. On Seth's
instruction of 18 November 2026 the presentations were moved off the website
and into his research folder,
`Seth-Work/Research/6 Past Writing/2026/AGI Governance Fellowship decks/`,
together with this Worker's former `site-assets/` tree, its saved deck text and
the retired `agi-editor-worker/`. They were last present in this repository at
commit `94b5c57b`. Do not add presentation content back here.

The Worker now serves:

- `fellowship.mintresearch.org/`: a short, content-free `noindex` notice that
  the Fellowship's presentations are no longer online. Every former
  presentation, viewer-login, deck-editor and deck-asset path (`/definitions/`,
  `/philosophy/`, `/projects/`, `/should-we-build-agi/`, `/agi-institutions/`,
  `/adaptation/`, `/day-1/` to `/day-3/`, `/login`, `/editor/`, `/assets/` and
  the like) returns the same notice with HTTP 410. The former `agif1`, `agif2`
  and `agif3` hosts redirect to it.
- `fellowship.mintresearch.org/bibliography/`: the AGI Governance Bibliography
  (below).
- `fellowship.mintresearch.org/owner/login`: the owner login used for
  bibliography editing.
- `bibliography.mintresearch.org`: the public bibliography mirror.
- `fellows.mintresearch.org`: the private fellows directory (below).

The Worker has no static assets binding. Saved deck text is still stored in the
`CONTENT_OVERRIDES` KV namespace under `deck:<id>:current`, but nothing reads it;
a copy is in the research folder. Do not delete that namespace: it also holds
the fellows directory.

## Bibliography

The public bibliography lives at `/bibliography/`. The `BIBLIOGRAPHY` service
binding forwards the original request to `mint-agi-governance-bibliography`;
that backend handles the prefix and validates its own requests. The router
permits only the page (`GET`/`HEAD`), `/bibliography/api/state` (`GET`), and
`/bibliography/api/suggestions` (`POST`) publicly. `/bibliography/edit/` and its
editor APIs require the owner cookie; the bibliography backend independently
verifies it using the same secret. Existing email-code editing at
`https://agi-governance.mintresearch.org/edit/` is unchanged. Deploy the backend
before the router and set the same owner password in both Workers.

The owner login at `/owner/login` uses `FELLOWSHIP_EDITOR_PASSWORD` and creates
a thirty-day, HTTP-only, secure, same-site session cookie that works from any
network. POST `/owner/logout` clears it. The `OWNER_LOGIN_LIMITER` binding
permits five attempts per minute per network key (IPv6 grouped by /64); missing
rate limiting fails closed.

`bibliography.mintresearch.org` is the public bibliography mirror. It uses the
same `BIBLIOGRAPHY` service and stored state as the Fellowship bibliography,
with the main MINT Resources sidebar. Public suggestion requests retain the
incoming origin and client headers for backend validation. Editing links lead
to the owner login; editor APIs are not exposed on the mirror.

## Secrets

- `FELLOWSHIP_EDITOR_PASSWORD`: the owner login, for bibliography editing
- `FELLOWSHIP_PASSWORD_SEPTEMBER_14`: the private fellows directory only

`FELLOWSHIP_SLIDES_PASSWORD`, the other `FELLOWSHIP_PASSWORD_SEPTEMBER_*`
secrets, `ALLOWED_IPS`, `FELLOWSHIP_OWNER_IPS` and
`FELLOWSHIP_OWNER_IPV6_NETWORKS` are no longer read and can be deleted.

## Deployment

Run `npm test` before `npm run deploy`. This repository's GitHub Actions do not
deploy the Worker.

Production deployment belongs to `Seths-M4`, whose Cloudflare account owns the
MINT zone. The M5 OAuth account does not own that zone; do not deploy the MINT
Worker with that account.

Exception, approved by Seth on 7 November 2026: Ned Howells-Whitaker may deploy
small maintenance and reliability fixes like the bibliography 503 handling
without asking first. He deploys from his own machine with the shared
`lab@mintresearch.org` Wrangler login. That login can see two Cloudflare
accounts, so set `CLOUDFLARE_ACCOUNT_ID=2b3c6c03e00ea15cd86a45e9f880e74b`. Run
the tests first, deploy only from `main` once the fix is merged, and record the
deployed version here or in the PR. Larger changes still go through Seth.

## Private fellows directory

`fellows.mintresearch.org` is a standalone, permanently password-protected
name/profile directory. It reuses `FELLOWSHIP_PASSWORD_SEPTEMBER_14`, with a
separate host-only twelve-hour session, no scheduled release and no IP bypass.
It has no navigation or sitemap entry; every response is noindex/no-store and
robots disallows the entire host. Login uses the existing rate limiter.
The HTML is stored only in `CONTENT_OVERRIDES` key `fellows:directory:html`,
never in this public repository. Its canonical source is the private
minty-private repository's
`Thread-Contexts/agi-governance-fellowship/fellows-directory.html`.
Update content with `wrangler kv key put --binding CONTENT_OVERRIDES --remote
fellows:directory:html --path <private-source-file>` and verify readback.
