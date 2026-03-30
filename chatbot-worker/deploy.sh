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

# ── Step 1: Get API key via secure macOS dialog ────────────────────────────
echo "Step 1: Requesting OpenAI API key..."
API_KEY=$(osascript -e 'display dialog "Enter your OpenAI API key for Minty chatbot:" default answer "" with hidden answer with title "Minty Chatbot Setup"' -e 'text returned of result' 2>/dev/null)

if [ -z "$API_KEY" ]; then
  echo "ERROR: No API key provided. Aborting."
  exit 1
fi
echo "  Key received (not shown)."

# ── Step 2: Extract publications from corpus ───────────────────────────────
MARKDOWN_DIR="/Volumes/Agents/Active-Research/Resources/Key Infra/markdown"
STAGING_DIR="$SCRIPT_DIR/setup/publications"

if [ ! -d "$STAGING_DIR" ] || [ -z "$(ls -A "$STAGING_DIR" 2>/dev/null)" ]; then
  echo ""
  echo "Step 2: Extracting MINT Lab publications..."
  OPENAI_API_KEY="$API_KEY" "$VENV_PYTHON" "$SCRIPT_DIR/setup/extract_publications.py" \
    --source-dir "$MARKDOWN_DIR" \
    --output-dir "$STAGING_DIR"
else
  echo ""
  echo "Step 2: Publications already staged at $STAGING_DIR ($(ls "$STAGING_DIR" | wc -l | tr -d ' ') files). Skipping extraction."
fi

# ── Step 3: Create OpenAI Assistant + Vector Store ─────────────────────────
echo ""
echo "Step 3: Creating OpenAI Assistant + uploading publications..."
OPENAI_API_KEY="$API_KEY" "$VENV_PYTHON" "$SCRIPT_DIR/setup/create_assistant.py" \
  --publications-dir "$STAGING_DIR"

# Read the assistant ID from config
ASSISTANT_ID=$(python3 -c "import json; print(json.load(open('$SCRIPT_DIR/setup/assistant_config.json'))['assistant_id'])")
echo "  Assistant ID: $ASSISTANT_ID"

# ── Step 4: Deploy Cloudflare Worker ───────────────────────────────────────
echo ""
echo "Step 4: Deploying Cloudflare Worker..."

# Update ASSISTANT_ID in wrangler.toml
sed -i '' "s/^ASSISTANT_ID = .*/ASSISTANT_ID = \"$ASSISTANT_ID\"/" "$SCRIPT_DIR/wrangler.toml"

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

# ── Step 5: Get worker URL and update frontend ────────────────────────────
echo ""
echo "Step 5: Updating frontend worker URL..."
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

# ── Step 6: Re-inject pages ───────────────────────────────────────────────
echo ""
echo "Step 6: Re-injecting Minty overlay into pages..."
cd "$REPO_DIR"
python3 scripts/inject_minty.py

# ── Cleanup ───────────────────────────────────────────────────────────────
unset API_KEY
echo ""
echo "=== Deployment complete ==="
echo "  Test: open https://mintresearch.org and double-click Minty"
