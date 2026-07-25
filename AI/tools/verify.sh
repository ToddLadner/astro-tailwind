#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

status=0

check_dir() {
  if [ -d "$1" ]; then
    echo "OK dir: $1"
  else
    echo "MISSING dir: $1" >&2
    status=1
  fi
}

check_file() {
  if [ -f "$1" ]; then
    echo "OK file: $1"
  else
    echo "MISSING file: $1" >&2
    status=1
  fi
}

for dir in \
  AI/agents \
  AI/system \
  AI/knowledge \
  AI/memory \
  AI/projects \
  AI/rules \
  AI/templates \
  AI/tools \
  .continue/rules \
  .continue/prompts
do
  check_dir "$dir"
done

for file in \
  AI/agents/architect.md \
  AI/agents/coder.md \
  AI/agents/css-specialist.md \
  AI/agents/documentation.md \
  AI/agents/planner.md \
  AI/agents/reviewer.md \
  AI/agents/ux-critic.md \
  AI/rules/01-general.md \
  AI/rules/02-context.md \
  AI/rules/03-editing.md \
  AI/rules/04-review.md \
  AI/rules/05-documentation.md \
  .continue/prompts/architecture.md \
  .continue/prompts/css-review.md \
  .continue/prompts/document.md \
  .continue/prompts/handoff.md \
  .continue/prompts/implement.md \
  .continue/prompts/plan.md \
  .continue/prompts/review.md \
  .continue/prompts/ux-review.md
do
  check_file "$file"
done

if command -v ruby >/dev/null 2>&1 && [ -f "$HOME/.continue/config.yaml" ]; then
  ruby -e 'require "yaml"; YAML.load_file(ARGV.fetch(0))' "$HOME/.continue/config.yaml"
  echo "OK yaml: $HOME/.continue/config.yaml"
else
  echo "SKIP yaml: ruby unavailable or $HOME/.continue/config.yaml missing"
fi

exit "$status"
