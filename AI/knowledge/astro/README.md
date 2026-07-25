# Astro Knowledge

Verified Astro guidance that can apply across projects.

## Architecture

- Prefer server-rendered Astro components by default.
- Add client-side JavaScript only when interaction requires it.
- Verify the installed Astro version before applying version-specific guidance.
- Follow established layout, routing, rendering, and content conventions.
- Keep page files focused on route composition.
- Extract components only when repetition or ownership justifies it.

## Components

- Type component props explicitly.
- Keep frontmatter focused on imports, data preparation, and server-side logic.
- Prefer semantic HTML in templates.
- Preserve slot contracts and public props when refactoring.
- Search component usage before changing an interface.

## Client Scripts

- Prefer processed Astro scripts for bundled and deduplicated behavior.
- Use `is:inline` only when unprocessed execution is intentional.
- Minimize global listeners and clean up persistent browser state.
- Consider behavior across Astro page transitions.
- Do not add a UI framework solely for isolated interactivity.

## Routing And Data

- Verify static versus server rendering before introducing runtime assumptions.
- Keep `getStaticPaths()` deterministic where practical.
- Handle external build-time data failures explicitly.
- Avoid making builds depend unnecessarily on unstable external services.
- Validate route parameters and external data boundaries.

## Verification

- Run the project’s Astro build.
- Test generated routes and dynamic paths.
- Inspect client bundles when adding browser code.
- Verify hydration, navigation, and error states in a browser.
