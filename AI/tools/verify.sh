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

check_frontmatter() {
  if [ "$(sed -n '1p' "$1")" = "---" ]; then
    echo "OK frontmatter: $1"
  else
    echo "INVALID frontmatter: $1" >&2
    status=1
  fi
}

check_shell() {
  if bash -n "$1"; then
    echo "OK shell: $1"
  else
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
  AI/evals \
  AI/evals/cases \
  AI/evals/results \
  AI/tools \
  .continue/rules \
  .continue/prompts
do
  check_dir "$dir"
done

for file in \
  AI/agents/architect.md \
  AI/agents/discovery.md \
  AI/agents/engineer.md \
  AI/agents/css-specialist.md \
  AI/agents/documentation.md \
  AI/agents/orchestrator.md \
  AI/agents/planner.md \
  AI/agents/qa.md \
  AI/agents/reviewer.md \
  AI/agents/ux-critic.md \
  AI/rules/01-general.md \
  AI/rules/02-context.md \
  AI/rules/03-editing.md \
  AI/rules/04-review.md \
  AI/rules/05-documentation.md \
  AI/projects/astro-tailwind/project.md \
  AI/projects/astro-tailwind/stack.md \
  AI/projects/astro-tailwind/architecture.md \
  AI/projects/astro-tailwind/design-system.md \
  AI/projects/astro-tailwind/commands.md \
  AI/projects/astro-tailwind/known-issues.md \
  AI/projects/astro-tailwind/decisions.md \
  AGENTS.md \
  AI/templates/feature-request.md \
  AI/templates/start-feature.md \
  AI/templates/design-review.md \
  AI/templates/bug-investigation.md \
  AI/templates/architecture-proposal.md \
  AI/evals/README.md \
  AI/evals/run.sh \
  AI/evals/results/README.md \
  AI/tools/verify-content.mjs \
  AI/templates/ux-research.md \
  .continue/prompts/architecture.md \
  .continue/prompts/css-review.md \
  .continue/prompts/discover.md \
  .continue/prompts/document.md \
  .continue/prompts/handoff.md \
  .continue/prompts/implement.md \
  .continue/prompts/new-feature.md \
  .continue/prompts/next.md \
  .continue/prompts/plan.md \
  .continue/prompts/qa.md \
  .continue/prompts/review.md \
  .continue/prompts/status.md \
  .continue/prompts/ux-review.md
do
  check_file "$file"
done

for file in .continue/prompts/*.md .continue/rules/*.md; do
  [ -e "$file" ] || continue
  check_frontmatter "$file"
done

for file in AI/tools/*.sh; do
  [ -e "$file" ] || continue
  check_shell "$file"
done

check_shell AI/evals/run.sh

if node AI/tools/verify-content.mjs; then
  echo "OK content: links, frontmatter, baseline, and evaluation schemas"
else
  status=1
fi

if bash AI/evals/run.sh check; then
  echo "OK evals: deterministic behavioral case checks"
else
  status=1
fi

referenced_paths="$(
  rg -o --no-filename 'AI/[A-Za-z0-9_./-]+\.md' AI .continue AGENTS.md README.md 2>/dev/null |
    sort -u
)"
while IFS= read -r file; do
  [ -n "$file" ] || continue
  check_file "$file"
done <<< "$referenced_paths"

if rg -n '^- $' AI/memory AI/projects/astro-tailwind >/dev/null 2>&1; then
  echo "PLACEHOLDER entries found in active memory or project context" >&2
  status=1
else
  echo "OK active context: no empty list placeholders"
fi

if command -v ruby >/dev/null 2>&1 && [ -f "$HOME/.continue/config.yaml" ]; then
  ruby -e 'require "yaml"; YAML.load_file(ARGV.fetch(0))' "$HOME/.continue/config.yaml"
  echo "OK yaml: $HOME/.continue/config.yaml"
else
  echo "SKIP yaml: ruby unavailable or $HOME/.continue/config.yaml missing"
fi

exit "$status"
