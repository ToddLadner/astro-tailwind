# File editing safety

- Prefer targeted search-and-replace operations over full-file rewrites.
- Never replace an entire existing file when a targeted edit is sufficient.
- Read the relevant file before editing.
- Preserve all unrelated content, formatting, imports, comments, and component APIs.
- After editing, inspect the changed file or git diff.
- Verify that only the requested lines and files changed.
- Do not report success until the written file has been checked.
- For broad changes, explain the intended files and approach before editing.
- Run the relevant build, type-check, lint, or test command after implementation.