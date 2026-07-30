# Astro Tailwind

An Astro 5 playground for building interface components, interaction patterns, and a CSS-first Tailwind 4 design system.

## Stack

- Astro 5
- Tailwind CSS 4 through the Vite integration
- Alpine.js for optional client behavior
- TypeScript
- Biome
- Node’s built-in test runner

## Development

```sh
npm install
npm run dev
```

The development server uses Astro’s default local address.

## Validation

```sh
npm test
npm run lint
npm run build
```

Use `npm run lint:fix` when you intentionally want Biome to rewrite files.
The repository currently has pre-existing Biome and production-build failures; see `AI/projects/astro-tailwind/known-issues.md`.

## Project Structure

```text
src/
├── components/  Astro UI components and experiments
├── css/         Tailwind theme, tokens, global styles, and utilities
├── layouts/     Shared document and page layouts
├── lib/         Server-safe helpers
├── pages/       Routes and component demonstration pages
└── scripts/     Browser-side modules and integration entrypoints
```

Tailwind is configured in `src/css/main.css` with the Tailwind 4 `@theme` directive. Global styles enter through `src/layouts/Head.astro`.

## AI Workspace

Repository-specific agent guidance starts in `AGENTS.md`. Reusable roles and templates live under `AI/`, project context lives in `AI/projects/astro-tailwind/`, and Continue-specific prompts and rules live under `.continue/`.

## Deployment

Set `SITE_URL` to the production origin when building for deployment:

```sh
SITE_URL=https://example.com npm run build
```

Local builds default to `http://localhost:4321`.
