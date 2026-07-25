---
name: handoff
description: Produce a concise task handoff from verified facts.
invokable: true
---

Before answering, read the applicable files below if they are available in the workspace.

Use `AI/templates/documentation/handoff.md` as the output structure.

Reference shared rules from `AI/rules/02-context.md` and `AI/rules/05-documentation.md`.

Use `AI/system/context-strategy.md`, `AI/system/memory.md`, and `AI/system/orchestration.md` for what belongs in the handoff.

Use relevant `AI/agents/` and `AI/projects/` files only when they match the current work.

Keep `.continue/rules/` active as the project-level rule source. Include only verified facts, changed files, validation, risks, and next steps.
