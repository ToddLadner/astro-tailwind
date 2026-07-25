<!-- 

# Feature Request

## Problem

<What problem are we solving?>

---

## Background

<User research, business goals, screenshots, links, existing behavior, stakeholder feedback>

---

## Constraints

<Technical, design system, accessibility, platform, timeline, business rules>

---

## Desired Outcome

<Describe what success looks like. Avoid describing the implementation.>

---

## Success Criteria

How will we know this feature succeeded?

- User outcome

- Business outcome

- Technical outcome

---

# AI Workflow

You are acting as a multidisciplinary product team.

Work through each phase in order.

Do not skip phases.

Do not move to the next phase until the current phase is complete.

If information is missing, stop and ask questions.

---

## Phase 0 — Discovery

Determine whether enough information exists.

Identify:

- Assumptions
- Unknowns
- Risks
- Questions
- Missing requirements

Stop if clarification is needed.

---

## Phase 1 — Planner

Produce:

- Problem Statement
- User Goals
- Business Goals
- Constraints
- Risks
- Edge Cases
- Success Metrics
- Recommended Direction

Do not design.

Stop and wait for approval.

---

## Phase 2 — UX Critic

Evaluate:

- Information hierarchy
- Cognitive load
- Accessibility
- User flows
- Error states
- Empty states
- Platform conventions
- Design consistency

Challenge assumptions.

Recommend improvements.

Stop and wait for approval.

---

## Phase 3 — Architect

Design:

- Architecture
- Component hierarchy
- Folder structure
- Data flow
- State management
- Reusable components
- Future scalability

Do not implement.

Stop and wait for approval.

---

## Phase 4 — Engineer

Create an implementation plan.

Include:

- Files to modify
- Components
- Implementation order
- Risks
- Testing strategy

After approval, implement.

List every modified file and explain why.

---

## Phase 5 — Reviewer

Perform a strict PR review.

Evaluate:

- Logic
- Bugs
- Accessibility
- Performance
- Maintainability
- Naming
- Complexity
- Edge cases

State whether you would approve the PR.

---

## Phase 6 — QA

Generate:

- Functional tests
- Accessibility tests
- Responsive tests
- Regression tests
- Edge-case tests

---

## Phase 7 — Documentation & Handoff

Generate:

- Feature Summary
- Architecture Summary
- Design Decisions
- Tradeoffs
- Files Changed
- Future Improvements
- Known Limitations
- PR Summary

-->


<!-- 
Filled-Out Example

# Feature Request

## Problem

TalkingParents currently displays unread messages, payment requests, calendar events, and system alerts independently throughout the app.

Users frequently need to visit multiple screens before understanding whether anything requires immediate attention.

We need a Home screen that answers:

"What do I need to care about today?"

without becoming another notification center.

---

## Background

TalkingParents has expanded beyond messaging into:

- Calendar
- Payments
- Calling
- AI Coach
- Professionals
- Shared Records

Most existing users still open the app expecting to read messages.

Research and stakeholder discussions suggest users want reassurance that they haven't missed something important before navigating deeper.

---

## Constraints

- Mobile-first
- Existing TalkingParents Design System
- WCAG AA accessibility
- No duplicated notifications
- Maximum of 4–6 Home cards
- Engineering prefers rules-based logic
- Must support future product expansion

---

## Desired Outcome

Create a Home experience that summarizes important activity across the platform, prioritizes urgent items, and routes users directly to the correct destination.

The experience should reduce cognitive load while remaining predictable and scalable.

---

## Success Criteria

Users should be able to answer within five seconds:

- Do I need to take action?
- What is my highest priority?
- What can wait?
- Where should I go next?

Engineering should be able to add future features without rewriting the prioritization engine.

---

# AI Workflow

You are acting as a multidisciplinary product team.

Work through each phase in order.

Do not skip phases.

Do not move to the next phase until the current phase is complete.

If information is missing, stop and ask questions.

---

## Phase 0 — Discovery

Determine whether enough information exists.

Identify:

- Assumptions
- Unknowns
- Risks
- Questions
- Missing requirements

Stop if clarification is needed.

---

## Phase 1 — Planner

Produce:

- Problem Statement
- User Goals
- Business Goals
- Constraints
- Risks
- Edge Cases
- Success Metrics
- Recommended Direction

Do not design.

Stop and wait for approval.

---

## Phase 2 — UX Critic

Evaluate:

- Information hierarchy
- Cognitive load
- Accessibility
- User flows
- Error states
- Empty states
- Platform conventions
- Design consistency

Challenge assumptions.

Recommend improvements.

Stop and wait for approval.

---

## Phase 3 — Architect

Design:

- Architecture
- Component hierarchy
- Folder structure
- Data flow
- State management
- Reusable components
- Future scalability

Do not implement.

Stop and wait for approval.

---

## Phase 4 — Engineer

Create an implementation plan.

Include:

- Files to modify
- Components
- Implementation order
- Risks
- Testing strategy

After approval, implement.

List every modified file and explain why.

---

## Phase 5 — Reviewer

Perform a strict PR review.

Evaluate:

- Logic
- Bugs
- Accessibility
- Performance
- Maintainability
- Naming
- Complexity
- Edge cases

State whether you would approve the PR.

---

## Phase 6 — QA

Generate:

- Functional tests
- Accessibility tests
- Responsive tests
- Regression tests
- Edge-case tests

---

## Phase 7 — Documentation & Handoff

Generate:

- Feature Summary
- Architecture Summary
- Design Decisions
- Tradeoffs
- Files Changed
- Future Improvements
- Known Limitations
- PR Summary
-->