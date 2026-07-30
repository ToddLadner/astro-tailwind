# Project Agent Entry Point

This repository is an Astro 5 component and design-system playground built with Tailwind CSS 4.

## Start Here

- Read `AI/projects/astro-tailwind/project.md` for scope and maturity.
- Read `AI/projects/astro-tailwind/stack.md` and `architecture.md` before proposing implementation changes.
- Read `AI/projects/astro-tailwind/design-system.md` for CSS and token conventions.
- Treat `.continue/rules/` as the project-specific rule source for Continue.
- Use the reusable roles, workflow rules, and templates under `AI/` when they match the task.

## Required Validation

Use the narrowest applicable command:

- `npm test` for the Node test suite.
- `npm run lint` for a non-writing Biome check.
- `npm run build` for an Astro production build.

The test, lint, and build baselines were all passing when last verified on 2026-07-27. Check
`AI/projects/astro-tailwind/known-issues.md` before treating a failure as pre-existing, and report every new
failure accurately.

Use `npm run lint:fix` only when formatting or lint fixes are part of the requested edit.

## Important Project Conventions

- Global CSS enters through `src/layouts/Head.astro`, which imports `src/css/main.css`.
- Tailwind is configured in CSS with `@theme`; there is no `tailwind.config.*`.
- Preserve semantic design tokens and check their consumers before changing primitives.
- Prefer Astro and native browser behavior. Alpine is available, but its configured entrypoint is currently inactive.
- Do not treat experimental pages or components as established public APIs without verifying their use.
- Production builds must receive the canonical origin through `SITE_URL`; local builds use `http://localhost:4321`.
