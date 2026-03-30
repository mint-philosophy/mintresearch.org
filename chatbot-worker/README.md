# Minty Chatbot

Cloudflare Worker + OpenAI Assistants API powering the interactive Minty chat on mintresearch.org.

## Architecture

```
User double-clicks Minty sprite
  -> Chat bubble (frontend JS, injected via inject_minty.py)
  -> POST to Cloudflare Worker
  -> Worker: validates origin, checks rate limits, caps tokens
  -> OpenAI Assistants API (GPT-5.4 xhigh + Vector Store)
  -> SSE stream back to chat bubble
```

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

### Step 1: Create OpenAI Assistant

```bash
cd chatbot-worker/setup

# Install the OpenAI SDK if needed
pip install openai

# Set your API key
export OPENAI_API_KEY="sk-..."

# Prepare publications (copy from corpus markdown directory)
python extract_publications.py \
  --source-dir /Volumes/Agents/Active-Research/Resources/markdown \
  --output-dir ./publications

# Review and curate the publications/ directory, then:
python create_assistant.py --publications-dir ./publications
```

This prints an `assistant_id` and saves it to `assistant_config.json`.

### Step 2: Configure Worker

Edit `wrangler.toml`:
- Set `ASSISTANT_ID` to the value from step 1

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

### System prompt
```bash
cd chatbot-worker/setup
# Edit system_prompt.txt, then:
python create_assistant.py --update-prompt --assistant-id asst_xxx
```

### Publications
```bash
python create_assistant.py --publications-dir ./new_papers --assistant-id asst_xxx
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
    create_assistant.py  -- Creates/updates assistant + vector store
    extract_publications.py -- Filters corpus for MINT Lab papers
    assistant_config.json -- Generated: stores assistant/vector store IDs
  README.md              -- This file
```
