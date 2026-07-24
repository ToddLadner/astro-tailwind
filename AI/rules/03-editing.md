# Editing Rules

Reusable safeguards for filesystem and code edits.

## Before Editing

- Read the relevant file before editing it.
- Explain the intended files and approach before broad changes.
- Preserve unrelated content, formatting, imports, comments, and component APIs.

## During Editing

- Prefer targeted edits over full-file rewrites.
- Do not replace an entire existing file when a targeted edit is sufficient.
- Keep changes limited to the requested behavior or organization.

## After Editing

- Inspect the changed file or git diff.
- Verify that only intended files and lines changed.
- Run the most relevant available build, type-check, lint, or test command when applicable.
