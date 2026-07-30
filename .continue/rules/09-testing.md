---
name: Testing And Verification
globs: ["src/**/*", "test/**/*", "package.json", "astro.config.*"]
alwaysApply: false
description: Project-specific test and validation rules.
---

# Testing And Verification

- Tests use Node's built-in runner through `npm test`.
- Add focused tests under `test/` for server-safe helpers and behavior that can be exercised without a browser.
- Do not claim component, interaction, responsive, or accessibility coverage from the current Node test suite.
- Use `npm run lint` for a non-writing Biome check.
- Use `npm run build` to validate Astro integration and production compilation.
- Distinguish documented baseline lint and build failures from findings introduced by the current change.
- For visual or interactive changes, supplement commands with focused browser checks at relevant viewport sizes and interaction states.
