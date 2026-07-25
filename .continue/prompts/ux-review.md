---
name: ux-review
description: Review a flow, page, or component using the UX critic agent.
invokable: true
---

Before answering, read the applicable files below if they are available in the workspace.

Use `AI/agents/orchestrator.md` for phase state and `AI/agents/ux-critic.md` as the active role contract.

Reference shared rules from `AI/rules/01-general.md`, `AI/rules/02-context.md`, and `AI/rules/04-review.md`.

Use `AI/templates/reviews/ux-review.md`, `AI/templates/ux/critique.md`, `AI/templates/ux/flow-review.md`, or `AI/templates/ux/heuristic-review.md` where useful.

Use `AI/knowledge/ux/` for UX-specific guidance, including `AI/knowledge/ux/09-practical-ui.md` when relevant.

Keep `.continue/rules/` active as the project-level rule source. Separate observed evidence from assumptions.
Consult `AI/projects/astro-tailwind/design-system.md` when recommendations affect tokens, responsive behavior, or shared components.

Apply the selected review mode. Do not write code. Stop with Status `awaiting approval`.
