# AGI Fellowship presentation router

This Cloudflare Worker gives the three Fellowship presentations stable
subdomains while keeping their static source in this repository:

- `agif1.mintresearch.org` → `public/should-we-build-agi/`
- `agif2.mintresearch.org` → `public/agi-institutions/deck.html`
- `agif3.mintresearch.org` → `public/societal-adaptation/deck.html`

The Worker accepts only `GET` and `HEAD`, preserves paths, query strings, range
requests, response status, and cache validators, and adds `X-Robots-Tag` to
every response. HTML is revalidated rather than held in a browser cache. The
pages also contain HTML `noindex` directives. They are not access-controlled;
they are public and linked from the Fellowship hub, but remain unindexed.

Run `npm test` before `npm run deploy`. Cloudflare custom-domain routes create
and maintain the DNS records and certificates for all three exact hostnames.
