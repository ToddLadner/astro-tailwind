---
name: Astro 5 Standards
globs: ["**/*.astro", "astro.config.*", "src/**/*.ts", "src/**/*.js"]
alwaysApply: false
description: Architecture and implementation standards for this Astro 5 project.
---

# Astro 5 Standards

- Use Astro 5 conventions and the project's existing architecture.
- Prefer `.astro` components and server-rendered HTML by default.
- Do not introduce React, Vue, Svelte, or another client framework unless it is already configured or explicitly requested.
- Minimize client-side JavaScript and hydration.
- Use client directives only when interactivity requires them.
- Keep frontmatter focused on data preparation, imports, and server-side logic.
- Keep component props explicitly typed.
- Prefer reusable components for repeated interface patterns, but do not abstract one-off markup prematurely.
- Preserve content collection schemas and existing routing conventions.
- Use semantic HTML before adding ARIA.
- Verify assumptions against `package.json`, `astro.config.*`, and the relevant source files.
