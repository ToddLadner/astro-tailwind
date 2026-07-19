---
name: Tailwind CSS Standards
globs: ["**/*.astro", "**/*.html", "**/*.vue", "**/*.tsx", "**/*.css"]
alwaysApply: false
description: Tailwind and styling standards for consistent UI implementation.
---

# Tailwind CSS Standards

- Use the project's installed Tailwind version and existing configuration.
- Prefer existing utilities, semantic tokens, component classes, and design-system patterns.
- Do not invent colors, spacing values, shadows, radii, or breakpoints when an existing token fits.
- Avoid unnecessary arbitrary values.
- Keep responsive behavior intentional and mobile-first.
- Preserve visible focus states, hover states, disabled states, and reduced-motion behavior.
- Use custom CSS when it is clearer, reusable, or required for behavior that utilities do not express well.
- Do not convert stable custom CSS to utilities solely for consistency.
- Avoid long duplicated class strings; reuse an existing component or extract a pattern when repetition is meaningful.
