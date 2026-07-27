#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CASES="$ROOT/AI/evals/cases"
RESULTS="$ROOT/AI/evals/results"
MODE="${1:-check}"

check_cases() {
  status=0
  count=0

  for file in "$CASES"/*.md; do
    [ -e "$file" ] || continue
    count=$((count + 1))

    if ! sed -n '2,/^---$/p' "$file" | rg -q '^id: [a-z0-9-]+$'; then
      echo "INVALID eval: missing or invalid id in $file" >&2
      status=1
    fi
    if ! sed -n '2,/^---$/p' "$file" | rg -q '^role: .+$'; then
      echo "INVALID eval: missing role in $file" >&2
      status=1
    fi
    if ! sed -n '2,/^---$/p' "$file" | rg -q '^severity: (critical|standard)$'; then
      echo "INVALID eval: missing or invalid severity in $file" >&2
      status=1
    fi
    for heading in "## Scenario" "## Required behavior" "## Prohibited behavior" "## Evidence"; do
      if ! rg -q "^${heading}$" "$file"; then
        echo "INVALID eval: missing '$heading' in $file" >&2
        status=1
      fi
    done
    if ! rg -q '^- \[[ x]\] .+' "$file"; then
      echo "INVALID eval: no observable checklist assertions in $file" >&2
      status=1
    fi
  done

  if [ "$count" -lt 6 ]; then
    echo "INVALID eval: expected at least 6 cases, found $count" >&2
    status=1
  fi

  if [ "$status" -eq 0 ]; then
    echo "OK eval schemas: $count cases"
  fi
  return "$status"
}

record_result() {
  case_id="${2:-}"
  response_file="${3:-}"
  outcome="${4:-}"

  if [ -z "$case_id" ] || [ ! -f "$CASES/$case_id.md" ]; then
    echo "Usage: $0 record <case-id> <response-file> <pass|fail>" >&2
    exit 2
  fi
  if [ -z "$response_file" ] || [ ! -f "$response_file" ]; then
    echo "Response file not found: $response_file" >&2
    exit 2
  fi
  if [ "$outcome" != "pass" ] && [ "$outcome" != "fail" ]; then
    echo "Outcome must be pass or fail." >&2
    exit 2
  fi

  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  destination="$RESULTS/${timestamp}-${case_id}-${outcome}.md"
  {
    echo "---"
    echo "case: $case_id"
    echo "outcome: $outcome"
    echo "reviewed_at: $timestamp"
    echo "---"
    echo
    echo "# Recorded Response"
    echo
    sed -e 's/^/    /' "$response_file"
  } > "$destination"
  echo "Recorded: $destination"
}

case "$MODE" in
  check)
    check_cases
    ;;
  record)
    check_cases
    record_result "$@"
    ;;
  *)
    echo "Usage: $0 <check|record>" >&2
    exit 2
    ;;
esac
