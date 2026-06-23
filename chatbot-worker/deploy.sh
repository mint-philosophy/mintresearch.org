#!/bin/bash
# Minty Chatbot — Secure Deployment Script
# Shows a macOS dialog for the API key so it never touches the transcript.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
VENV_PYTHON="/Volumes/Agents/Active-Research/minty-private/daemons/pipeline/.venv/bin/python"
WRANGLER="$SCRIPT_DIR/node_modules/.bin/wrangler"

echo "=== Minty Chatbot Deployment ==="
echo ""

# -- Step 1: Get API key via environment or secure macOS dialog -------------
echo "Step 1: Getting OpenAI API key..."
if [ -n "${OPENAI_API_KEY:-}" ]; then
  API_KEY="$OPENAI_API_KEY"
  echo "  Using OPENAI_API_KEY from the environment (not shown)."
elif [ -f "$SCRIPT_DIR/.dev.vars" ]; then
  API_KEY=$("$VENV_PYTHON" - "$SCRIPT_DIR/.dev.vars" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
for raw_line in path.read_text().splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    if key.strip() == "OPENAI_API_KEY":
        print(value.strip().strip('"').strip("'"))
        break
PY
)
  echo "  Using OPENAI_API_KEY from .dev.vars (not shown)."
else
  API_KEY=$(osascript -e 'display dialog "Enter your OpenAI API key for Minty chatbot:" default answer "" with hidden answer with title "Minty Chatbot Setup"' -e 'text returned of result' 2>/dev/null)
fi

if [ -z "$API_KEY" ]; then
  echo "ERROR: No API key provided. Aborting."
  exit 1
fi
echo "  Key received (not shown)."

# -- Step 2: Check Cloudflare deploy auth -----------------------------------
echo ""
echo "Step 2: Checking Cloudflare Worker deploy auth..."
CF_TOKEN_WAS_SET="false"
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && command -v security >/dev/null 2>&1; then
  CF_TOKEN="$(security find-generic-password -s "minty-vault-CLOUDFLARE_API_TOKEN" -w 2>/dev/null || true)"
  if [ -n "$CF_TOKEN" ]; then
    export CLOUDFLARE_API_TOKEN="$CF_TOKEN"
    CF_TOKEN_WAS_SET="true"
    echo "  Using CLOUDFLARE_API_TOKEN from Keychain (not shown)."
  fi
fi

if ! "$WRANGLER" deployments list --limit 1 >/dev/null 2>&1; then
  echo "ERROR: Wrangler cannot access minty-chatbot deployments."
  echo "Run wrangler login, or set a CLOUDFLARE_API_TOKEN with Workers deploy access, then retry."
  exit 1
fi
echo "  Cloudflare auth OK."

# -- Step 3: Prepare publications ------------------------------------------
MARKDOWN_DIR="/Volumes/Agents/Active-Research/Resources/Key Infra/markdown"
STAGING_DIR="$SCRIPT_DIR/setup/publications"
GENERATED_DIR=$(mktemp -d "${TMPDIR:-/tmp}/minty-chatbot-site-papers.XXXXXX")

echo ""
echo "Step 3: Generating site-paper records from the homepage CSV..."
"$VENV_PYTHON" "$SCRIPT_DIR/setup/sync_site_papers.py" \
  --csv "$REPO_DIR/public/assets/papers/latest-paper-deliverables.csv" \
  --output-dir "$GENERATED_DIR" \
  --download-arxiv-pdfs

if [ ! -d "$STAGING_DIR" ] || ! find "$STAGING_DIR" -type f \( -name '*.md' -o -name '*.pdf' -o -name '*.txt' \) -print -quit | grep -q .; then
  echo ""
  echo "Step 3b: No curated local publication staging found; extracting from corpus..."
  OPENAI_API_KEY="$API_KEY" "$VENV_PYTHON" "$SCRIPT_DIR/setup/extract_publications.py" \
    --source-dir "$MARKDOWN_DIR" \
    --output-dir "$STAGING_DIR"
else
  echo ""
  STAGED_COUNT=$(find "$STAGING_DIR" -type f \( -name '*.md' -o -name '*.pdf' -o -name '*.txt' \) | wc -l | tr -d ' ')
  echo "Step 3b: Using curated local publications at $STAGING_DIR ($STAGED_COUNT files)."
fi

# -- Step 4: Create fresh OpenAI Vector Store -------------------------------
echo ""
echo "Step 4: Creating fresh OpenAI vector store and uploading publications..."
OPENAI_API_KEY="$API_KEY" "$VENV_PYTHON" "$SCRIPT_DIR/setup/create_assistant.py" \
  --vector-store-only \
  --fresh-vector-store \
  --publications-dir "$STAGING_DIR" "$GENERATED_DIR"

# Read the vector store ID from config
VECTOR_STORE_ID=$("$VENV_PYTHON" -c "import json; print(json.load(open('$SCRIPT_DIR/setup/assistant_config.json'))['vector_store_id'])")
echo "  Vector Store ID: $VECTOR_STORE_ID"

# -- Step 5: Deploy Cloudflare Worker ---------------------------------------
echo ""
echo "Step 5: Deploying Cloudflare Worker..."

# Update VECTOR_STORE_ID in wrangler.toml
"$VENV_PYTHON" - "$SCRIPT_DIR/wrangler.toml" "$VECTOR_STORE_ID" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
vector_store_id = sys.argv[2]
text = path.read_text()
lines = []
replaced = False
for line in text.splitlines():
    if line.startswith("VECTOR_STORE_ID = "):
        lines.append(f'VECTOR_STORE_ID = "{vector_store_id}"')
        replaced = True
    else:
        lines.append(line)
if not replaced:
    raise SystemExit("VECTOR_STORE_ID not found in wrangler.toml")
path.write_text("\n".join(lines) + "\n")
PY

# Check if KV namespace exists; create if not
KV_ID=$(grep '^id = ' "$SCRIPT_DIR/wrangler.toml" | head -1 | sed 's/id = "\(.*\)"/\1/')
if [ -z "$KV_ID" ]; then
  echo "  Creating KV namespace..."
  KV_OUTPUT=$("$WRANGLER" kv namespace create RATE_LIMIT 2>&1)
  KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | sed 's/id = "\(.*\)"/\1/')
  if [ -n "$KV_ID" ]; then
    sed -i '' "s/^id = .*/id = \"$KV_ID\"/" "$SCRIPT_DIR/wrangler.toml"
    echo "  KV namespace created: $KV_ID"
  else
    echo "  WARNING: Could not parse KV namespace ID. You may need to set it manually."
    echo "  Output: $KV_OUTPUT"
  fi
fi

# Deploy
"$WRANGLER" deploy

# Set the API key as a secret (piped from variable, never shown)
echo "$API_KEY" | "$WRANGLER" secret put OPENAI_API_KEY

# -- Step 6: Get worker URL and update frontend -----------------------------
echo ""
echo "Step 6: Updating frontend worker URL..."
WORKER_URL=$("$WRANGLER" deployments list --limit 1 2>&1 | grep -o 'https://[^ ]*workers.dev' | head -1 || true)

if [ -z "$WORKER_URL" ]; then
  # Fallback: construct from wrangler.toml name
  WORKER_NAME=$(grep '^name = ' "$SCRIPT_DIR/wrangler.toml" | sed 's/name = "\(.*\)"/\1/')
  echo "  Could not auto-detect worker URL."
  echo "  After deployment, update CHAT_WORKER_URL in $REPO_DIR/scripts/inject_minty.py"
  echo "  Expected format: https://$WORKER_NAME.<account>.workers.dev"
else
  sed -i '' "s|CHAT_WORKER_URL = '.*'|CHAT_WORKER_URL = '$WORKER_URL'|" "$REPO_DIR/scripts/inject_minty.py"
  echo "  Worker URL: $WORKER_URL"
fi

# -- Step 7: Re-inject pages ------------------------------------------------
echo ""
echo "Step 7: Re-injecting Minty overlay into pages..."
cd "$REPO_DIR"
python3 scripts/inject_minty.py

# -- Cleanup ----------------------------------------------------------------
unset API_KEY
if [ "$CF_TOKEN_WAS_SET" = "true" ]; then
  unset CLOUDFLARE_API_TOKEN
fi
echo ""
echo "=== Deployment complete ==="
echo "  Test: open https://mintresearch.org and double-click Minty"
