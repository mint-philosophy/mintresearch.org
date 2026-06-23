# Minty Chatbot

Cloudflare Worker + OpenAI Responses API file search powering the interactive Minty chat on mintresearch.org.

## Architecture

```
User double-clicks Minty sprite
  -> Chat bubble (frontend JS, injected via inject_minty.py)
  -> POST to Cloudflare Worker
  -> Worker: validates origin, checks rate limits, caps tokens
  -> OpenAI Responses API (GPT-5.4 + Vector Store)
  -> SSE stream back to chat bubble
```

The public Papers feed on the homepage is the default source for chatbot paper
metadata. Before each full deploy, `setup/sync_site_papers.py` reads
`../public/assets/papers/latest-paper-deliverables.csv`, generates a markdown
paper index for every public homepage paper, and downloads public arXiv PDFs
where available. The deploy script uploads those generated files together with
any locally curated full-text files under `setup/publications/`.

## Rate Limiting (3 layers)

| Layer | Limit | Configurable |
|-------|-------|-------------|
| Client-side | 15 messages/session, 3s cooldown | CHAT_JS in inject_minty.py |
| Worker (per-IP) | 10/hour, 30/day | wrangler.toml vars |
| Worker (global) | 500/day | wrangler.toml vars |
| OpenAI project | Monthly spending cap | OpenAI dashboard |

## Deployment

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`
- OpenAI API key (dedicated project recommended)
- Python 3.10+ with `openai` package
- Cloudflare auth for Worker deploys: run `wrangler login`, or set
  `CLOUDFLARE_API_TOKEN` to a token with access to the `minty-chatbot` Worker.
  The deploy script checks this before uploading a new vector store.

### Step 1: Prepare publications and create a vector store

```bash
cd chatbot-worker

# Install the OpenAI SDK if needed
pip install openai

# Set your API key, or put it in the gitignored .dev.vars file.
export OPENAI_API_KEY="sk-..."

# Generate public paper records from the website CSV.
npm run sync:site-papers

# Optional: review/curate full-text local files in setup/publications/.

# Create a fresh vector store from curated full text plus generated site records.
npm run refresh:vector-store
```

This prints a `vector_store_id` and saves it to `setup/assistant_config.json`.

### Step 2: Configure Worker

Edit `wrangler.toml`:
- Set `VECTOR_STORE_ID` to the value from step 1

Create the KV namespace:
```bash
cd chatbot-worker
wrangler kv namespace create RATE_LIMIT
```

Copy the returned `id` into the `[[kv_namespaces]]` section of `wrangler.toml`.

### Step 3: Deploy Worker

```bash
# Login to Cloudflare
wrangler login

# Set the API key as a secret (never in code!)
wrangler secret put OPENAI_API_KEY

# Deploy
wrangler deploy
```

The worker will be available at `https://minty-chatbot.<account>.workers.dev`.

### Step 4: Update Frontend

In `scripts/inject_minty.py`, update `CHAT_WORKER_URL` to your worker URL:

```python
CHAT_WORKER_URL = 'https://minty-chatbot.<account>.workers.dev'
```

Then re-inject all pages:
```bash
python scripts/inject_minty.py
```

### Step 5: Set OpenAI Spending Limit

In the [OpenAI dashboard](https://platform.openai.com/settings/organization/limits):
- Set a monthly budget on the project associated with your API key

## Updating

### Publications and vector store

Use the deployment script for the normal refresh path:

```bash
cd chatbot-worker
./deploy.sh
```

The script:
- regenerates public paper metadata from the homepage CSV;
- downloads arXiv PDFs for public Papers-feed rows where possible;
- uses any curated full-text files already present in `setup/publications/`;
- creates a fresh vector store;
- writes the new `VECTOR_STORE_ID` into `wrangler.toml`;
- deploys the Cloudflare Worker.

For a local preparation pass without deploy:

```bash
cd chatbot-worker
npm run sync:site-papers
```

### System prompt
```bash
cd chatbot-worker/setup
# Edit system_prompt.txt, then:
python create_assistant.py --update-prompt --assistant-id asst_xxx
```

### Rate limits
Edit the `[vars]` section in `wrangler.toml`, then `wrangler deploy`.

### Greetings
Edit the `GREETINGS` array in `CHAT_JS` within `scripts/inject_minty.py`, then re-inject pages.

## Security

- API key stored in Cloudflare Workers Secrets (encrypted at rest)
- Never committed to git, never in client-side code
- CORS restricts to mintresearch.org origin
- Input length capped at 1000 characters
- Output tokens capped at 500 per response
- Rate limiting at IP and global level
- OpenAI project spending cap as ultimate safety net

## Files

```
chatbot-worker/
  wrangler.toml          -- Worker config + env vars
  package.json           -- Dependencies (wrangler)
  src/index.js           -- Worker code
  setup/
    system_prompt.txt    -- Minty persona + instructions
    sync_site_papers.py  -- Generates chatbot paper records from the site CSV
    create_assistant.py  -- Creates/updates vector store; legacy assistant support
    extract_publications.py -- Filters corpus for MINT Lab papers
    assistant_config.json -- Generated: stores vector store/assistant IDs
    generated-site-papers/ -- Generated: site CSV records + arXiv PDFs
  README.md              -- This file
```
