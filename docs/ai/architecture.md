# Astro Tailwind Architecture

## Request And Rendering Model

Astro pages in `src/pages/` render through layouts in `src/layouts/`. Most pages use `Layout.astro`, which composes `Head.astro` and the shared header. `LayoutClaude.astro` is used by isolated messaging experiments and should not be assumed to follow the primary layout conventions.

## Styling Flow

`src/layouts/Head.astro` imports `src/css/main.css`. That stylesheet declares the layer order and imports reset, Tailwind theme, project base styles, and Tailwind utilities.

```text
Head.astro
└── src/css/main.css
    ├── src/css/reset.css
    ├── tailwindcss/theme.css
    ├── src/css/base.css
    └── tailwindcss/utilities.css
```

`src/css/media.css` defines custom media examples but is not imported by the verified global CSS entrypoint.

## Components

Reusable and experimental Astro components live together in `src/components/`. Before changing a component API, search its imports and usages to determine whether it is shared, isolated, or unused.

## Client-Side Code

Browser behavior appears in:

- Bundled Astro `<script>` blocks.
- Explicit module scripts imported from `src/scripts/`.
- `is:inline` scripts for behavior that intentionally executes without Astro processing.
- Alpine integration, whose current entrypoint is inactive.

Prefer bundled scripts unless inline execution is required. Preserve lifecycle behavior across Astro page navigation when introducing new global listeners.

## Tests

Tests live under `test/` and execute with Node’s built-in test command. Current coverage is limited and a passing test suite does not validate component behavior or browser accessibility.
