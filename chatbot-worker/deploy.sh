#!/bin/bash
# Minty Chatbot — Worker deployment.
#
# Deploys the Cloudflare Worker code (src/index.js + wrangler.toml vars) and
# optionally rotates the OPENAI_API_KEY secret. This script does NOT touch
# vector stores or publication records any more: content freshness is owned by
# the minty-chatbot-sync daemon (minty-private/daemons/minty-chatbot-sync/),
# which publishes the live store ID and lab snapshot at
# https://mintresearch.org/assets/minty/ — the Worker resolves both at request
# time, so routine content updates never need a redeploy.
#
# Auth: run `npx wrangler login` once, or export CLOUDFLARE_API_TOKEN with
# Workers Scripts:Edit permission (the keychain item
# minty-vault-CLOUDFLARE_API_TOKEN lacks Workers scope as of 2026-07-02).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WRANGLER="$SCRIPT_DIR/node_modules/.bin/wrangler"

echo "=== Minty Chatbot Worker deploy ==="

# Prefer an existing wrangler OAuth session; the keychain token is a fallback
# only (as of 2026-07-02 it lacks Workers scope, and an exported
# CLOUDFLARE_API_TOKEN would override a working OAuth login).
if ! "$WRANGLER" whoami >/dev/null 2>&1; then
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && command -v security >/dev/null 2>&1; then
    CF_TOKEN="$(security find-generic-password -s "minty-vault-CLOUDFLARE_API_TOKEN" -w 2>/dev/null || true)"
    if [ -n "$CF_TOKEN" ]; then
      export CLOUDFLARE_API_TOKEN="$CF_TOKEN"
      echo "Using CLOUDFLARE_API_TOKEN from Keychain (not shown)."
    fi
  fi
fi

if ! "$WRANGLER" whoami >/dev/null 2>&1; then
  echo "ERROR: no working Cloudflare auth. Run: npx wrangler login"
  exit 1
fi

cd "$SCRIPT_DIR"
"$WRANGLER" deploy

if [ "${1:-}" = "--set-secret" ]; then
  echo "Setting OPENAI_API_KEY secret from .dev.vars..."
  KEY=$(grep '^OPENAI_API_KEY' .dev.vars | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)
  if [ -z "$KEY" ]; then
    echo "ERROR: OPENAI_API_KEY not found in .dev.vars"
    exit 1
  fi
  printf '%s' "$KEY" | "$WRANGLER" secret put OPENAI_API_KEY
fi

echo ""
echo "=== Deploy complete ==="
echo "Verify: curl -s https://minty-chatbot.mintresearch.workers.dev/health"
echo "Then double-click Minty on https://mintresearch.org and ask about recent preprints."
