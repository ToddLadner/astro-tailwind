---
name: implement
description: Implement one approved coding step using the coder agent.
invokable: true
---

Before answering, read the applicable files below if they are available in the workspace.

Use `AI/agents/orchestrator.md` for phase state and `AI/agents/coder.md` as the active role contract.

Reference shared rules from `AI/rules/01-general.md`, `AI/rules/02-context.md`, and `AI/rules/03-editing.md`.

Use `AI/system/agent-contract.md` and `AI/system/operating-model.md` for execution boundaries.

Use `AI/templates/frontend/component.md`, `AI/templates/frontend/page.md`, or `AI/templates/frontend/refactor.md` only when they fit the task.

Keep `.continue/rules/` active as the project-level rule source. Do not change application code outside the requested scope.
Read the applicable project context under `AI/projects/astro-tailwind/` and validate with the commands documented there.

First produce the Engineer implementation plan and stop for explicit approval. Edit only when the conversation contains approval of both Architecture and the Engineer plan.
