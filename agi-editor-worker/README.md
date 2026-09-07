# Legacy AGI deck inline-editor endpoint

This compatibility Worker now serves saved text overrides read-only. All writes
have moved to the same-origin editor at `fellowship.mintresearch.org`, where
every save requires both the exact-IP allowlist and the separate Fellowship
editor credential. Keeping this endpoint readable preserves older cached pages;
returning HTTP 410 for every PUT prevents it from bypassing the current editor's
two-lock authorization.

CORS remains limited to the maintained MINT presentation origins. This service
has no write authority regardless of origin, IP, or payload.

## Commands

```bash
npm test
npm run dev
npm run deploy
```

The production KV namespace remains bound as `CONTENT_OVERRIDES` for read-only
compatibility.
