# AGI deck inline editor

This Cloudflare Worker backs the IP-gated inline editor on the unlisted
`/should-we-build-agi/` deck. The public deck remains a static GitHub Pages
artifact. Text overrides are fetched from Workers KV at page load and applied
with `textContent`; no HTML is accepted or rendered.

Security boundaries:

- The editor toolbar is merely a convenience signal. Every save is separately
  restricted by the request's Cloudflare-provided client IP.
- `ALLOWED_IPS` is a Worker secret, never a public JavaScript value or tracked
  configuration value.
- CORS accepts the maintained MINT presentation origins, including
  `fellowship.mintresearch.org` for the password-protected Day 1 shell.
- Saves are revision-checked and bounded by field count, field size, and total
  size. Ninety days of revision snapshots are retained in KV.
- If the Worker is unavailable, the static deck remains readable and the edit
  controls stay hidden.

The exact-IP gate is intentionally the mechanism Seth requested. Anyone using
the same public NAT address would share its authority, and the secret must be
updated when that address changes.

## Commands

```bash
npm test
npm run dev
npm run deploy
```

The production KV namespace is bound as `CONTENT_OVERRIDES`. Set or rotate the
allowlist without printing it:

```bash
printf '%s' "$ALLOWED_IPS" | npx wrangler secret put ALLOWED_IPS
```
