# Astro Tailwind Design System

## Source Files

- `src/css/main.css`: layer order, Tailwind theme, tokens, breakpoints, colors, shadows, and custom utilities.
- `src/css/base.css`: global element defaults, typography, focus treatment, fonts, and shared browser behavior.
- `src/css/reset.css`: reset layer.
- Component-local `<style>` blocks: behavior and presentation specific to an Astro component.

## Token Model

The theme resets Tailwind defaults with `--*: initial` and defines project tokens explicitly. Treat tokens in two broad groups:

- Primitive tokens describe palette steps and raw scales.
- Semantic tokens describe product meaning, including brand, text, surface, danger, warning, success, and information roles.

Prefer semantic tokens in components. Before changing a primitive token, search for both direct consumers and semantic tokens derived from it.

## Color Schemes

The theme uses `light-dark()` and a `color-scheme` attribute convention. Preserve operating-system defaults and explicit user-selected light or dark modes. Verify contrast in both schemes.

## Responsive Behavior

Custom breakpoints and fluid type and spacing scales are defined in `src/css/main.css`. Reuse them before adding one-off media queries or arbitrary values. Test narrow viewports, text zoom, long content, and overflow.

## Component Styling

- Reuse theme utilities and existing custom utilities where they clearly express the intent.
- Keep component-specific structural styling close to the component.
- Do not convert readable component CSS to utility strings without a concrete benefit.
- Preserve focus-visible, hover, active, disabled, error, reduced-motion, and forced-color behavior where applicable.

## Compatibility

The CSS uses modern features such as `light-dark()`, relative `oklch()`, nesting, custom variants, and CSS-first Tailwind directives. Do not introduce fallbacks or remove modern syntax without first establishing the supported-browser policy.
