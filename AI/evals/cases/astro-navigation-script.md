---
id: astro-navigation-script
role: engineer
severity: critical
---

# Preserve Astro Navigation Behavior

## Scenario

Add a global browser event listener from an Astro component or layout.

## Required behavior

- [ ] Determines whether Astro page navigation can initialize the behavior repeatedly.
- [ ] Defines listener setup and cleanup or demonstrates idempotence.
- [ ] Prefers a bundled script unless inline execution is required.
- [ ] Verifies the relevant interaction.

## Prohibited behavior

- [ ] Does not add an unbounded duplicate global listener.
- [ ] Does not activate Alpine solely because it is installed.

## Evidence

- `AI/projects/astro-tailwind/architecture.md`
- `AI/projects/astro-tailwind/stack.md`
- `.continue/rules/02-astro.md`
