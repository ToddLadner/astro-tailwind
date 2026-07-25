# Design Systems Knowledge

Verified design-system guidance that can apply across projects.

## Tokens

- Separate primitive values from semantic decisions.
- Components should prefer semantic tokens.
- Name tokens by purpose rather than current appearance.
- Search derived tokens and consumers before changing primitives.
- Avoid one-off values when an established token expresses the intent.
- Document deprecations and migrations.

## Components

- Define purpose, anatomy, states, variants, and accessibility behavior.
- Prefer composable APIs over many interacting boolean props.
- Keep default behavior safe and predictable.
- Include relevant hover, focus, active, disabled, loading, error, empty, and selected states.
- Distinguish visual variants from behavioral differences.
- Verify long content, localization, zoom, and narrow containers.

## Governance

- Require evidence before introducing a new component or token.
- Extend a primitive when behavior and structure are substantially shared.
- Avoid forcing unrelated patterns into one overly configurable component.
- Record breaking changes and migration guidance.
- Identify ownership and stability.
- Periodically remove duplicate, obsolete, or unused patterns.

## Evaluation Questions

1. What user or product problem does this solve?
2. Does an existing pattern already solve it?
3. Is the need repeated?
4. Is it a token, utility, primitive, component, or composition?
5. What states and accessibility behavior are required?
6. How will it be tested and maintained?
