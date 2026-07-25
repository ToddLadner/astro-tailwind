# Orchestration

## Purpose

Use an approval-gated feature workflow from discovery through developer handoff. One role is active at a time so local models receive a focused contract and a small, relevant context.

The orchestrator simulates role changes within one conversation when delegation is unavailable. It must label the active role and must never claim that autonomous agents were called.

## Phases And Gates

```text
Discovery → Planner → UX Critic → Architect → Engineer plan
    → Engineer implementation → Reviewer → QA → Documentation
```

Require explicit approval after Discovery, Planning, UX, Architecture, and the Engineer plan. Do not auto-advance.

- Blocking review issues return to Engineer.
- QA release blockers return to Engineer.
- Revised earlier decisions invalidate dependent later decisions.
- The user may stop, request status, revise, or return to an earlier phase.

The phase behavior and compact ledger are defined in `AI/agents/orchestrator.md`.

## Review Modes

The selected mode affects Planner, UX Critic, Architect, and Reviewer:

- **Standard:** Balanced evaluation of meaningful risks and improvements without forced disagreement.
- **Devil’s Advocate:** Attempt to disprove the direction by testing assumptions, failure cases, complexity, and alternatives. Do not manufacture objections.
- **Conservative:** Prefer proven patterns, limited scope, accessibility, predictability, maintainability, and low implementation risk. Flag speculative work.
- **Innovation:** Explore unconventional opportunities while separating practical recommendations from experiments. Preserve the approved problem and constraints.

Default to Standard when no mode is supplied.

## Starting And Revising

Start with `/new-feature` or paste `AI/templates/start-feature.md`. Every new feature begins at Discovery.

Use `Approved`, `Continue`, or `Proceed` to advance through a gate. Use `Revise`, `Return to UX`, `Return to Architecture`, `Stop`, or `Summarize current status` to control the workflow.

## Context Efficiency

- Load only the active role, applicable rules, approved summaries, and relevant project files.
- Summarize each phase once; do not paste the full request into every response.
- Keep approved decisions and open questions in the compact ledger.
- Preserve verified decisions across phases and flag contradictions.
- Use file paths instead of repeating long source content.
- Create a handoff before context becomes noisy.

## Example

1. User submits `start-feature.md`.
2. Orchestrator performs Discovery and waits.
3. Planner proposes direction and waits.
4. UX Critic challenges it; user revises or approves.
5. Architect defines the design and waits.
6. Engineer proposes an implementation plan and waits.
7. Engineer edits and validates.
8. Reviewer reviews; blocking issues return to Engineer.
9. QA tests; release blockers return to Engineer.
10. Documentation produces the handoff and closes the workflow.
