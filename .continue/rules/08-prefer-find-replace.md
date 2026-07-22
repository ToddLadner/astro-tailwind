---
description: Prefer exact find-and-replace edits over full-file regeneration for small changes
alwaysApply: true
---

For small edits — adding, removing, or changing a few lines, appending a line, fixing a typo, changing a single value — always use the `single_find_and_replace` tool with an exact `old_string`/`new_string` pair.

Only use `edit_existing_file` (abbreviated diff with placeholder markers) for large, sweeping changes that touch many non-contiguous parts of a file.

Never attempt to regenerate or reproduce an entire file's contents unless explicitly asked to rewrite the whole file.
