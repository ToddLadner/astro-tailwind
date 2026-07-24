# AI Workspace

Reusable local-agent workspace for coding, UX, review, and documentation tasks.

## Structure

- `agents/` — role definitions invoked for a specific type of work.
- `core/` — shared operating instructions and workflow contracts.
- `knowledge/` — reusable reference material.
- `projects/` — project-specific context, links, and overrides.
- `rules/` — enforceable behavior and implementation constraints.
- `templates/` — repeatable task, plan, review, and handoff formats.
- `tools/` — setup scripts and integrations.

## Recommended workflow

1. Start with `agents/planner.md`.
2. Implement one bounded step with the relevant engineer agent.
3. Run the matching reviewer.
4. Create a handoff before the conversation becomes large.

Keep source-of-truth project files in the project repository. Keep reusable knowledge here.
