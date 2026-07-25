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

- `/new-feature` — begin the approval-gated workflow at Discovery.
- `/discover` — run or revisit Discovery.
- `/plan` — run the Planner phase.
- `/ux-review` — run the UX Critic phase.
- `/architect` — run the Architecture phase.
- `/implement` — create an Engineer plan, wait for approval, then implement.
- `/review` — use the reviewer agent and code review template.
- `/qa` — run the QA phase.
- `/handoff` — produce the final documentation and handoff.
- `/status` — summarize the compact phase ledger.
- `/css-review` — use the CSS specialist agent and CSS review template.
- `/document` — use the documentation agent and documentation templates.

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

1. Start with `/new-feature`.
2. Approve Discovery, Planning, UX, Architecture, and the Engineer plan separately.
3. Implement, review, and QA the approved scope.
4. Finish with `/handoff`.

Keep source-of-truth project files in the project repository. Keep reusable knowledge here.

## Verification

Run `bash AI/tools/verify.sh .` from the repository root to check the expected workspace structure, Continue frontmatter, shell syntax, internal Markdown references, and active context placeholders.
