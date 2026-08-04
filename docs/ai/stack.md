# Astro Tailwind Stack

## Runtime And Framework

- Astro 5 with strict Astro TypeScript configuration.
- Node.js scripts and the built-in `node:test` runner.
- ESM package configuration.

## Styling

- Tailwind CSS 4 through `@tailwindcss/vite`.
- CSS-first theme configuration in `src/css/main.css`.
- Custom CSS layers, tokens, utilities, and component-local Astro styles.
- Roboto and Roboto Flex font assets served from `public/fonts/`.

## Browser Interaction

- Native browser APIs and Astro scripts.
- Alpine.js is installed and configured through `@astrojs/alpinejs`.
- `src/scripts/alpine-entry.ts` currently registers no Alpine plugins or behavior.

## Astro Integrations

- MDX
- Sitemap
- Alpine.js
- Astro Icon

## Tooling

- Biome for formatting and linting.
- Astro production builds for integration validation.
- npm and `package-lock.json` for dependency management.
