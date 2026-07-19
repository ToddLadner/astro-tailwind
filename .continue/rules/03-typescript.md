---
name: TypeScript Standards
globs: ["**/*.ts", "**/*.tsx", "**/*.astro"]
alwaysApply: false
description: TypeScript safety and maintainability rules.
---

# TypeScript Standards

- Respect the project's current TypeScript configuration and strictness.
- Avoid `any`; use a precise type, `unknown`, or a generic when appropriate.
- Type component props, function parameters, return values, and external data boundaries.
- Prefer clear domain types over large anonymous inline types when reused.
- Narrow nullable and unknown values before use.
- Do not silence type errors with broad assertions unless the reason is documented.
- Preserve readonly data when mutation is unnecessary.
- Keep types close to the code they describe unless they are shared across modules.
