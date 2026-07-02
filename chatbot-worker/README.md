# Minty Chatbot

Cloudflare Worker + OpenAI Responses API file search powering the interactive
Minty chat on mintresearch.org.

## Architecture

```
User double-clicks Minty sprite
  -> Chat bubble (frontend JS, injected via scripts/inject_minty.py)
  -> POST to Cloudflare Worker (minty-chatbot.mintresearch.workers.dev)
  -> Worker: validates origin, rate-limits, then fetches two site assets:
       /assets/minty/vector-store-id.txt   (which vector store to search)
       /assets/minty/snapshot.txt          (current-lab snapshot -> system prompt)
  -> OpenAI Responses API (GPT-5.4 + file_search over the vector store)
  -> SSE stream back to chat bubble
```

**Freshness is fully automated.** The `minty-chatbot-sync` daemon
(`minty-private/daemons/minty-chatbot-sync/`, daily 05:15) syncs the papers
CSV from Notion, regenerates all chatbot records, rebuilds the vector store
when content changes, and publishes the new store ID + snapshot via the site.
Because the Worker resolves both at request time (5-minute edge cache),
content updates never require a Worker redeploy.

The snapshot is what makes recency questions ("what are your latest
preprints?") reliable: it is a dated, authoritative top-10 list appended to
the system prompt, regenerated on every sync.

### Vector store contents (~162 files)

- `setup/publications/` — curated full text of Seth's publications (121 files,
  local-only, not in git: copyright)
- `setup/generated-site-papers/` — paper index generated from the homepage CSV
  + public arXiv PDFs (generated, not in git)
- `setup/generated-site-content/` — website content records: newsletters,
  research reports, the lab guide, people, CV, site pages (generated, not in git)

### Why fresh stores instead of in-place updates

As of 2026-07-02, OpenAI's `DELETE /vector_stores/{id}/files/{file_id}`
returns `deleted: true` without detaching the file (verified via raw REST).
In-place updates would accumulate stale duplicates, so the daemon rebuilds a
fresh store on content change and swaps the published pointer, then garbage-
collects superseded stores. `setup/sync_vector_store.py --adds-only` remains
safe for manual additive fixes.

## Rate Limiting (3 layers)

| Layer | Limit | Configurable |
|-------|-------|-------------|
| Client-side | 15 messages/session, 3s cooldown | CHAT_JS in inject_minty.py |
| Worker (per-IP) | 10/hour, 30/day | wrangler.toml vars |
| Worker (global) | 500/day | wrangler.toml vars |
| OpenAI project | Monthly spending cap | OpenAI dashboard |

## Deploying the Worker (code changes only)

```bash
cd chatbot-worker
npx wrangler login          # once; or export a Workers-scoped CLOUDFLARE_API_TOKEN
./deploy.sh                 # add --set-secret to (re)set OPENAI_API_KEY from .dev.vars
```

Note: the keychain item `minty-vault-CLOUDFLARE_API_TOKEN` lacks Workers
permissions as of 2026-07-02; mint a token with Workers Scripts:Edit if you
want unattended code deploys too.

## Manual content refresh (normally unnecessary)

```bash
/Volumes/Agents/Active-Research/minty-private/daemons/pipeline/.venv/bin/python \
  /Volumes/Agents/Active-Research/minty-private/daemons/minty-chatbot-sync/sync_chatbot.py
```

## Updating the system prompt

The prompt is baked into `src/index.js` (`DEFAULT_SYSTEM_PROMPT`) and can be
overridden with a `SYSTEM_PROMPT` var in wrangler.toml. Edit, then `./deploy.sh`.
(`setup/system_prompt.txt` is the legacy Assistants-API copy — not used by the
Worker.)

## Security

- API key stored in Cloudflare Workers Secrets (encrypted at rest)
- CORS restricts to mintresearch.org origin; input capped at 1000 chars
- Rate limiting at IP and global level; OpenAI project spending cap as backstop
- The daemon reads its keys from the macOS keychain daemon tier
  (`minty-vault-MINTY_CHATBOT_OPENAI_KEY`, `minty-vault-NOTION_TOKEN`)

## Files

```
chatbot-worker/
  wrangler.toml            -- Worker config; VECTOR_STORE_ID is the FALLBACK store
                              (normally overridden by the published pointer)
  src/index.js             -- Worker code (prompt, snapshot fetch, pointer fetch)
  deploy.sh                -- Worker code deploy (auth check + wrangler deploy)
  setup/
    sync_site_papers.py    -- paper index + arXiv PDFs from the homepage CSV
    sync_site_content.py   -- website content records (newsletters, reports, ...)
    build_snapshot.py      -- current-lab snapshot -> public/assets/minty/snapshot.txt
    sync_vector_store.py   -- hash-diffed store sync (see --adds-only caveat above)
    create_assistant.py    -- legacy full-rebuild path (superseded by the daemon)
    extract_publications.py-- corpus extraction helper for curated publications
    publications/          -- curated full text (local-only)
    generated-site-papers/ -- generated (local-only)
    generated-site-content/-- generated (local-only)
```
