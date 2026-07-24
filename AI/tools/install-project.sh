#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-$PWD}"
AI_HOME="${AI_HOME:-$HOME/AI}"

mkdir -p "$TARGET/.continue/rules" "$TARGET/.continue/prompts" "$TARGET/knowledge"

for file in "$AI_HOME"/rules/*.md; do
  [ -e "$file" ] || continue
  ln -sfn "$file" "$TARGET/.continue/rules/$(basename "$file")"
done

cat > "$TARGET/AGENTS.md" <<EOT
# Project Agent Entry Point

Shared AI workspace: $AI_HOME

Start with:
- $AI_HOME/agents/planner.md
- $AI_HOME/system/operating-model.md
- $AI_HOME/rules/

Project-specific context belongs in:
- $TARGET/knowledge/
EOT

echo "Installed shared AI rules into: $TARGET"
