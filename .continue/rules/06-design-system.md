---
name: Design System Standards
globs: ["src/components/**/*", "src/css/**/*", "**/*.astro"]
alwaysApply: false
description: Rules for preserving and extending the existing design system.
---

# Design System Standards

- Read `docs/ai/design-system.md` before changing theme tokens or shared component styling.
- Reuse existing components, primitives, tokens, and variants before creating new ones.
- Do not introduce a new visual pattern when an established pattern already solves the problem.
- Preserve component consistency across states, sizes, breakpoints, and platforms.
- Treat primitive tokens as stable unless the task explicitly concerns token changes.
- Prefer semantic tokens over direct primitive values in product-facing components.
- Search all derived tokens and component consumers before changing a primitive.
- Do not invent new colors or status meanings without a stated product requirement.
- Keep component APIs understandable and avoid excessive boolean props.
- Include default, hover, focus, active, disabled, loading, error, and empty states when relevant.
- Flag any requested change that conflicts with the current design system instead of silently bypassing it.
