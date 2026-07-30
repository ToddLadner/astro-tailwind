---
title: Feature Workflow Prompt Examples
description: Example prompts for starting a feature and continuing an active workflow.
---

# Feature Workflow Prompt Examples

## Contents

1. Detailed prompt for starting a feature
2. Short prompt for starting a feature
3. Commands for continuing an active feature

## Usage

Use `/new-feature` to begin a new approval-gated workflow at Discovery.

After starting:

- Remain in the same conversation to preserve approved decisions.
- Approve or revise each phase explicitly.
- Use `/status` to summarize the current phase.
- Do not run `/new-feature` when continuing an active feature because it restarts Discovery.

You may also copy `AI/templates/start-feature.md` and fill it in.

## 1. Detailed prompt for starting a feature

```md
/new-feature

# New Feature

## Problem

Users cannot quickly tell which form fields contain errors after submitting
a long form. Errors appear beside individual fields, but users must scroll
around to find them.

## Background

The form is built with Astro and uses the shared `Field.astro` component.

Current behavior:

- Validation runs after submission.
- Invalid fields show inline messages.
- Focus remains on the submit button.
- There is no error summary.
- The form may contain 15-20 fields.

The feature should improve error discovery without replacing existing inline
validation.

## Constraints

- Use existing Astro components and design tokens.
- Meet WCAG 2.2 AA.
- Work with keyboard and screen readers.
- Avoid adding another frontend framework.
- Preserve the current `Field.astro` API when possible.
- Support narrow mobile layouts and 200% text zoom.
- Do not change server-side validation behavior.

## Desired Outcome

After an unsuccessful submission, users should understand how many errors
occurred, move directly to an invalid field, and recover without losing
entered data.

## Success Criteria

- An error summary appears after unsuccessful submission.
- The summary identifies the number of errors.
- Each summary item links to the corresponding field.
- Focus moves to the summary after submission.
- Inline field errors remain available.
- Entered values are preserved.
- Keyboard and screen-reader navigation work correctly.
- The layout works at mobile widths and 200% text zoom.
- Existing successful submission behavior remains unchanged.

## Review Mode

Conservative

Begin Phase 0 — Discovery. Do not advance without approval.
```

## 2. Short prompt for starting a feature

Use this version when the repository and its conventions already provide most
of the background:

```md
/new-feature

Problem: Users cannot locate errors in long forms after submission.

Background: This is an Astro form using the shared `Field.astro` component.
Inline errors already exist.

Constraints: Meet WCAG 2.2 AA, add no new frontend framework, preserve entered
values, and preserve the existing `Field.astro` API where possible.

Desired outcome: Provide an accessible error summary that links to invalid
fields.

Success criteria: Focus reaches the summary, links move to their fields,
inline errors remain, and the layout works at mobile widths and 200% text
zoom.

Review mode: Conservative.

Begin Phase 0 — Discovery. Do not advance without approval.
```

## 3. Commands for continuing an active feature

Continue in the same conversation so the approved decisions and phase history
remain available. Use the command or response that matches your intent.

Check progress:

```text
/status
```

Approve the current phase:

```text
Approved. Move to the next phase.
```

Request a revision before approval:

```text
Revise the proposed interaction so the error summary receives focus only
after an unsuccessful submission. Keep the remaining decisions unchanged.
```

Return to an earlier phase when a decision needs reconsideration:

```text
Return to UX. Reconsider the mobile behavior at 200% text zoom.
```

```text
Return to Architecture. Re-evaluate whether the existing Field API can remain
unchanged.
```

Authorize implementation after the required plans are approved:

```text
Approved. Implement the Engineer plan.
```

Pause with a useful handoff:

```text
Stop. Summarize the current phase, approved decisions, open questions, and
recommended next action.
```
