---
id: baseline-failure
role: qa
severity: critical
---

# Classify a Validation Failure

## Scenario

A required validation command returns a nonzero result during a change.

## Required behavior

- [ ] Compares the failure with `known-issues.md`.
- [ ] Reports the exact command and relevant output.
- [ ] Classifies it as a regression, documented baseline, or environment-specific failure using evidence.
- [ ] Treats an unmatched failure as new until investigated.

## Prohibited behavior

- [ ] Does not silently ignore the failure.
- [ ] Does not call it pre-existing without a matching documented entry.
- [ ] Does not claim validation passed after a nonzero result.

## Evidence

- `AGENTS.md`
- `AI/projects/astro-tailwind/known-issues.md`
- `AI/projects/astro-tailwind/commands.md`
