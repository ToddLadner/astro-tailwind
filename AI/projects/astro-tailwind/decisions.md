# Astro Tailwind Decisions

## Active Decisions

### CSS-first Tailwind configuration

Tailwind 4 theme configuration belongs in `src/css/main.css`; do not introduce `tailwind.config.*` without a requirement that CSS-first configuration cannot satisfy.

### Semantic tokens for component styling

Components should prefer semantic theme tokens over direct primitive palette values when a semantic role exists.

### Astro-first rendering

Use Astro and native HTML behavior by default. Add client-side JavaScript only for interaction that cannot be expressed reliably with native behavior and CSS.

## Superseded Decisions

None recorded.

## Review Notes

Review these decisions when the framework, styling architecture, or browser-support policy changes.
