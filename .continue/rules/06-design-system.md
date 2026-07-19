---
name: Design System Standards
globs: ["src/components/**/*", "src/styles/**/*", "**/*.astro", "**/*.vue", "**/*.tsx"]
alwaysApply: false
description: Rules for preserving and extending the existing design system.
---

# Design System Standards

- Reuse existing components, primitives, tokens, and variants before creating new ones.
- Do not introduce a new visual pattern when an established pattern already solves the problem.
- Preserve component consistency across states, sizes, breakpoints, and platforms.
- Treat primitive tokens as stable unless the task explicitly concerns token changes.
- Prefer semantic tokens over direct primitive values in product-facing components.
- Do not invent new colors or status meanings without a stated product requirement.
- Keep component APIs understandable and avoid excessive boolean props.
- Include default, hover, focus, active, disabled, loading, error, and empty states when relevant.
- Flag any requested change that conflicts with the current design system instead of silently bypassing it.
