#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-09-practical-ui.md}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_HOME="${AI_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"
DEST="$AI_HOME/knowledge/ux/practical-ui-second-edition.md"
MOVE="${MOVE:-0}"

if [ ! -f "$SOURCE" ]; then
  echo "File not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
if [ -e "$DEST" ] || [ -L "$DEST" ]; then
  echo "Destination already exists: $DEST" >&2
  exit 1
fi

if [ "$MOVE" = "1" ]; then
  mv "$SOURCE" "$DEST"
  echo "Moved Practical UI to: $DEST"
else
  cp "$SOURCE" "$DEST"
  echo "Copied Practical UI to: $DEST"
  echo "Set MOVE=1 to move instead of copy."
fi
