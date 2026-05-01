#!/usr/bin/env bash

set -euo pipefail

VAULT_PATH="${VAULT_PATH:-/Users/yush/Library/CloudStorage/GoogleDrive-yushmgrcode@gmail.com/My Drive/obs}"
QUARTZ_ROOT="${QUARTZ_ROOT:-$HOME/Desktop/notes}"
QUARTZ_REPO_URL="${QUARTZ_REPO_URL:-https://github.com/jackyzha0/quartz.git}"

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

if [ -e "$QUARTZ_ROOT" ]; then
  echo "Target Quartz directory already exists: $QUARTZ_ROOT"
  echo "Set QUARTZ_ROOT to a different path or remove the existing directory."
  exit 1
fi

echo "Cloning Quartz into $QUARTZ_ROOT"
git clone "$QUARTZ_REPO_URL" "$QUARTZ_ROOT"

echo "Installing Quartz dependencies"
npm --prefix "$QUARTZ_ROOT" install

mkdir -p "$QUARTZ_ROOT/content"

echo "Bootstrap complete."
echo "Next step:"
echo "  QUARTZ_ROOT=\"$QUARTZ_ROOT\" VAULT_PATH=\"$VAULT_PATH\" ./scripts/publish-quartz.sh"
