# Orchestration

## Purpose

Use an approval-gated workflow with one active role and a small context. `AI/agents/orchestrator.md` is the source of truth for phases, gates, state, and transitions. Specialist behavior remains in `AI/agents/`.

## Review Modes

The selected mode affects Planner, UX Critic, Architect, and Reviewer:

- **Standard:** Balanced evaluation of meaningful risks and improvements without forced disagreement.
- **Devil’s Advocate:** Attempt to disprove the direction by testing assumptions, failure cases, complexity, and alternatives. Do not manufacture objections.
- **Conservative:** Prefer proven patterns, limited scope, accessibility, predictability, maintainability, and low implementation risk. Flag speculative work.
- **Innovation:** Explore unconventional opportunities while separating practical recommendations from experiments. Preserve the approved problem and constraints.

Default to Standard when no mode is supplied.

## Starting And Revising

Start with `/new-feature` or paste `AI/templates/start-feature.md`. Every new feature begins at Discovery.

Use `Approved`, `Continue`, or `Proceed` to advance through a gate. Use `Revise`, `Return to <phase>`, `Stop`, or `Summarize current status` to control the workflow.

## Context Efficiency

- Load only the active role, applicable rules, approved summaries, and relevant project files.
- Summarize each phase once; do not paste the full request into every response.
- Keep approved decisions and open questions in the compact ledger.
- Preserve verified decisions across phases and flag contradictions.
- Use file paths instead of repeating long source content.
- Create a handoff before context becomes noisy.
