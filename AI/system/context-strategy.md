# Context Strategy

This file defines how agents should gather, limit, and hand off context across tasks.

## Intake

- Read the repository entry point and applicable project context.
- Locate defining files before consumers.
- Record the existing behavior, requested outcome, constraints, and validation surface.
- Treat project summaries as navigation aids and verify material claims against source.

## Working Context

- Keep verified facts separate from assumptions and open questions.
- Load files on demand and avoid full repository dumps.
- Drop incidental context after a bounded step is complete.
- Re-check facts that may have changed during implementation.

## Handoff

- Include decisions and their rationale.
- List changed files and user-visible effects.
- Record exact validation commands and outcomes.
- State residual risk, open questions, and the next bounded step.
- Include a `Do not assume` note when an apparent convention remains unverified.
