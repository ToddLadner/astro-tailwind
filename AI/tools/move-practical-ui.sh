#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-09-practical-ui.md}"
AI_HOME="${AI_HOME:-$HOME/AI}"
DEST="$AI_HOME/knowledge/ux/practical-ui-second-edition.md"

if [ ! -f "$SOURCE" ]; then
  echo "File not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
mv "$SOURCE" "$DEST"
echo "Moved Practical UI to: $DEST"
