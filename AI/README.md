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
- `evals/` — behavioral cases and reviewed result records for detecting instruction regressions.
- `workflows/` — resumable local-first feature orchestration with LM Studio workers and bounded frontier escalation.

## Continue Commands

- `/new-feature` — begin the approval-gated workflow at Discovery.
- `/next` — run one next phase after the current gate is explicitly approved.
- `/discover` — run or revisit Discovery.
- `/plan` — run the Planner phase.
- `/ux-review` — run the UX Critic phase.
- `/architecture` — run the Architecture phase.
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
2. Reply `Approved` at each gate; use the command for the next phase.
3. Use `Return to <phase>` whenever an earlier decision needs revision.
4. Finish with `/handoff` after QA is approved.

The shortest daily path is:

```text
/new-feature <request>
Approved → /next
Approved → /next
Approved → /next
...
```

Each command loads only the orchestrator, one active role, applicable rules, and relevant project files. This keeps prompts practical for local-model context limits.

`/next` never counts as approval and runs only one phase. Use the named phase commands to revisit or invoke a specific role directly.

Keep source-of-truth project files in the project repository. Keep reusable knowledge here.

## Verification

Run `npm run verify:ai` from the repository root to check the expected workspace structure, complete Continue
frontmatter, shell syntax, internal Markdown links, project context, baseline claims, and behavioral evaluation
schemas.

Run `npm run eval:ai` when editing roles, rules, prompts, or evaluation cases. Model responses are reviewed and
recorded separately; CI intentionally performs only deterministic checks.
