#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VAULT_PATH="${VAULT_PATH:-/Users/yush/Library/CloudStorage/GoogleDrive-yushmgrcode@gmail.com/My Drive/obs}"
QUARTZ_ROOT="${QUARTZ_ROOT:-$REPO_ROOT}"
CONTENT_DIR="${CONTENT_DIR:-$QUARTZ_ROOT/content}"
EXCLUDE_FILE="${EXCLUDE_FILE:-$REPO_ROOT/quartz-publish.exclude}"
PREVIEW_ONLY="${PREVIEW_ONLY:-false}"
SYNC_COMMAND="${SYNC_COMMAND:-npx quartz sync}"

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but not installed."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed."
  exit 1
fi

if [ ! -d "$VAULT_PATH" ]; then
  echo "Vault path does not exist: $VAULT_PATH"
  exit 1
fi

if [ ! -d "$QUARTZ_ROOT" ]; then
  echo "Quartz root does not exist: $QUARTZ_ROOT"
  echo "Run ./scripts/bootstrap-quartz.sh first or set QUARTZ_ROOT."
  exit 1
fi

mkdir -p "$CONTENT_DIR"

RSYNC_ARGS=(
  -av
  --delete
  --delete-excluded
  --exclude-from="$EXCLUDE_FILE"
  "$VAULT_PATH/"
  "$CONTENT_DIR/"
)

echo "Mirroring vault into Quartz content/"
rsync "${RSYNC_ARGS[@]}"

if [ "$PREVIEW_ONLY" = "true" ]; then
  echo "Preview-only mode enabled; skipping Quartz sync."
  echo "Run this from the Quartz repo to preview locally:"
  echo "  cd \"$QUARTZ_ROOT\" && npx quartz build --serve"
  exit 0
fi

echo "Publishing Quartz site"
(cd "$QUARTZ_ROOT" && $SYNC_COMMAND)
