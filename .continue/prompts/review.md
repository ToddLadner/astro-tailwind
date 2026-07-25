---
name: review
description: Review code or implementation changes using the reviewer agent.
invokable: true
---

Before answering, read the applicable files below if they are available in the workspace.

Use `AI/agents/reviewer.md` as the role contract.

Reference shared rules from `AI/rules/01-general.md`, `AI/rules/02-context.md`, and `AI/rules/04-review.md`.

Use `AI/templates/reviews/code-review.md` as the review structure.

Use relevant knowledge folders under `AI/knowledge/` only when they match the reviewed technology or domain.

Keep `.continue/rules/` active as the project-level rule source. Lead with findings and cite exact files or lines when available.
Use `AI/projects/astro-tailwind/known-issues.md` only as a starting point and verify each relevant issue against source.
