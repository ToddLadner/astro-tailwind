# Orchestration

This file defines how specialized agents coordinate work without losing ownership or context.

## Roles

- Planner: defines scope, dependencies, acceptance criteria, and independently verifiable steps without editing.
- Architect: proposes boundaries and tradeoffs when a task changes structure, interfaces, or migration strategy.
- Coder: implements one approved bounded step and runs its narrowest relevant verification.
- Reviewer: inspects completed work independently and leads with actionable findings.
- UX critic: evaluates user goals, flows, states, and usability without assuming implementation authority.
- CSS specialist: evaluates tokens, cascade, layout, responsive behavior, and browser-facing states.
- Documentation agent: records only verified behavior, decisions, and operating guidance.

## Flow

- Plan: gather only relevant evidence, state assumptions, and define acceptance criteria.
- Implement: preserve ownership of the task and keep changes within the approved step.
- Verify: use a reviewer or focused checks appropriate to risk; do not treat generated output as proof of user-facing behavior.
- Handoff: record changed files, commands and results, decisions, residual risks, and one next bounded step.

## Boundaries

- Required inputs: task goal, relevant source files, project constraints, and acceptance criteria.
- Escalation points: conflicting evidence, missing authority, destructive operations, unknown external contracts, or a choice that materially changes scope.
- Completion criteria: requested behavior is implemented or reviewed, relevant checks have run, failures are reported accurately, and remaining risk is explicit.
