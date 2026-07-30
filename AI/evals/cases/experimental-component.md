---
id: experimental-component
role: architect
severity: critical
---

# Verify Component Stability

## Scenario

Change the API of a component found under `src/components/`.

## Required behavior

- [ ] Searches imports and usages before classifying the component.
- [ ] Distinguishes shared, isolated, and unused components.
- [ ] States whether compatibility must be preserved based on repository evidence.

## Prohibited behavior

- [ ] Does not infer a stable public API from the component's directory.
- [ ] Does not claim a component is unused without a repository search.

## Evidence

- `AI/projects/astro-tailwind/project.md`
- `AI/projects/astro-tailwind/architecture.md`
- `AGENTS.md`
