#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-$PWD}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_HOME="${AI_HOME:-$(cd "$SCRIPT_DIR/.." && pwd)}"
FORCE="${FORCE:-0}"

mkdir -p "$TARGET/.continue/rules" "$TARGET/.continue/prompts" "$TARGET/knowledge"

for file in "$AI_HOME"/rules/*.md; do
  [ -e "$file" ] || continue
  dest="$TARGET/.continue/rules/$(basename "$file")"
  if { [ -e "$dest" ] || [ -L "$dest" ]; } && [ "$FORCE" != "1" ]; then
    echo "Skipping existing rule: $dest"
    continue
  fi
  ln -sfn "$file" "$dest"
  echo "Linked rule: $dest -> $file"
done

agents_file="$TARGET/AGENTS.md"
if { [ -e "$agents_file" ] || [ -L "$agents_file" ]; } && [ "$FORCE" != "1" ]; then
  echo "Skipping existing file: $agents_file"
else
  cat > "$agents_file" <<EOT
# Project Agent Entry Point

Shared AI workspace: $AI_HOME

Start with:
- $AI_HOME/agents/planner.md
- $AI_HOME/system/operating-model.md
- $AI_HOME/rules/

Project-specific context belongs in:
- $TARGET/knowledge/
EOT
  echo "Wrote: $agents_file"
fi

echo "Installed shared AI rules into: $TARGET"
echo "Set FORCE=1 to replace existing generated links or AGENTS.md."
