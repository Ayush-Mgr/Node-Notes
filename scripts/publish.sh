#!/usr/bin/env bash
# publish.sh — optional Google Drive -> repo sync helper.
# For Vault Manager flows, notes arrive directly through git-backed edits.
#
# Usage:
#   ./scripts/publish.sh
#   ./scripts/publish.sh "optional commit message"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VAULT_PATH="${OBSIDIAN_VAULT_PATH:-/Users/yush/Library/CloudStorage/GoogleDrive-yushmgrcode@gmail.com/My Drive/obs}"
EXCLUDE_FILE="$REPO_ROOT/publish.exclude"
VAULT_DIR="$REPO_ROOT/vault"

echo "→ Syncing vault from: $VAULT_PATH"
rsync -a --delete --delete-excluded \
  --exclude-from="$EXCLUDE_FILE" \
  "$VAULT_PATH/" \
  "$VAULT_DIR/"

cd "$REPO_ROOT"

if git diff --quiet && git diff --cached --quiet; then
  echo "→ No changes in vault. Nothing to commit."
  exit 0
fi

COMMIT_MSG="${1:-sync: $(date '+%Y-%m-%d %H:%M')}"
git add vault/
git commit -m "$COMMIT_MSG"
git push

echo "✓ Pushed. GitHub Actions will rebuild and deploy the site (~60s)."
