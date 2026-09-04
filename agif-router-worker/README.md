# AGI Fellowship legacy redirects

The Fellowship presentations are canonical framed pages on the main MINT site:

- `mintresearch.org/should-we-build-agi/`
- `mintresearch.org/agi-institutions/`
- `mintresearch.org/societal-adaptation/`

This Cloudflare Worker keeps the former `agif1`, `agif2`, and `agif3`
subdomains only as permanent redirects to those pages. It does not proxy or
host standalone decks. Redirects preserve query strings, discard obsolete
paths, and carry `X-Robots-Tag` so search engines prefer the main-site URLs.

The Worker accepts only `GET` and `HEAD`. Run `npm test` before
`npm run deploy`. The custom-domain routes remain in `wrangler.toml` so old
links keep working while the main-site framed pages are canonical.
