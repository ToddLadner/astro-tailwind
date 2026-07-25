# AI Workspace

Reusable local-agent workspace for coding, UX, review, and documentation tasks.

## Structure

- `agents/` — role definitions invoked for a specific type of work.
- `system/` — shared operating instructions and workflow contracts.
- `knowledge/` — reusable reference material.
- `projects/` — project-specific context, links, and overrides.
- `rules/` — enforceable behavior and implementation constraints.
- `templates/` — repeatable task, plan, review, and handoff formats.
- `tools/` — setup scripts and integrations.

## Continue Commands

- `/plan` — use the planner agent and planning templates before implementation.
- `/implement` — use the coder agent for one approved coding step.
- `/review` — use the reviewer agent and code review template.
- `/ux-review` — use the UX critic agent and UX templates.
- `/css-review` — use the CSS specialist agent and CSS review template.
- `/architecture` — use the architect agent and architecture templates.
- `/document` — use the documentation agent and documentation templates.
- `/handoff` — summarize verified context with the handoff template.

## Rules

- `.continue/rules/` contains active project-level Continue rules for this Astro workspace.
- `AI/rules/` contains reusable cross-project rules referenced by Continue and agents.
- Do not duplicate full rule content in prompts; prompts should point agents to the relevant files.

## Memory And Projects

- `memory/` stores durable cross-project preferences, patterns, mistakes, decisions, and prompts.
- `projects/` stores verified project-specific context only.
- Do not record guesses or planned behavior as if they are facts.
- This repository's verified context begins in `projects/astro-tailwind/project.md`.

## Recommended workflow

1. Start with `/plan` or `agents/planner.md`.
2. Implement one bounded step with `/implement` or the relevant agent.
3. Run the matching reviewer.
4. Create a handoff before the conversation becomes large.

Keep source-of-truth project files in the project repository. Keep reusable knowledge here.

## Verification

Run `bash AI/tools/verify.sh .` from the repository root to check the expected workspace structure, Continue frontmatter, shell syntax, internal Markdown references, and active context placeholders.
