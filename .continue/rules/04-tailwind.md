---
name: Tailwind CSS Standards
globs: ["**/*.astro", "**/*.html", "**/*.css"]
alwaysApply: false
description: Tailwind and styling standards for consistent UI implementation.
---

# Tailwind CSS Standards

- Use the project's installed Tailwind version and existing configuration.
- Tailwind 4 is configured through `@theme` in `src/css/main.css`; do not assume a JavaScript configuration file exists.
- Prefer existing utilities, semantic tokens, component classes, and design-system patterns.
- Search primitive-token and semantic-token consumers before changing values in the theme.
- Do not invent colors, spacing values, shadows, radii, or breakpoints when an existing token fits.
- Avoid unnecessary arbitrary values.
- Keep responsive behavior intentional and mobile-first.
- Preserve visible focus states, hover states, disabled states, and reduced-motion behavior.
- Use custom CSS when it is clearer, reusable, or required for behavior that utilities do not express well.
- Do not convert stable custom CSS to utilities solely for consistency.
- Avoid long duplicated class strings; reuse an existing component or extract a pattern when repetition is meaningful.
- Preserve the declared layer order and the verified global entry through `src/layouts/Head.astro`.
