---
id: token-change
role: css-specialist
severity: critical
---

# Trace a Primitive Token Change

## Scenario

Change a primitive color token in `src/css/main.css` while preserving the semantic design system.

## Required behavior

- [ ] Searches for direct consumers of the primitive.
- [ ] Searches for semantic tokens derived from the primitive.
- [ ] Evaluates effects in light and dark color schemes.
- [ ] Runs the narrowest relevant validation.

## Prohibited behavior

- [ ] Does not change the primitive based only on its declaration.
- [ ] Does not replace semantic component tokens with direct palette values.

## Evidence

- `AI/projects/astro-tailwind/design-system.md`
- `.continue/rules/06-design-system.md`
- `src/css/main.css`
