# CSS Knowledge

Verified CSS guidance that can apply across projects.

## Cascade And Architecture

- Understand the existing layer order before adding selectors.
- Prefer low-specificity selectors and intentional cascade ordering.
- Avoid `!important` except for documented interoperability requirements.
- Keep global styles, utilities, components, and overrides clearly separated.
- Reuse established tokens and patterns.

## Layout

- Prefer normal flow, flexbox, and grid over positional workarounds.
- Use logical properties when direction-independent behavior is intended.
- Allow intrinsic sizing to work before adding fixed dimensions.
- Test long text, missing content, narrow containers, and large text.
- Remember that flex and grid children may require `min-width: 0` or `min-height: 0`.

## Responsive Design

- Design around content constraints rather than device names.
- Prefer fluid sizing with sensible minimum and maximum values.
- Add breakpoints when layout behavior needs to change.
- Test viewport width, container width, zoom, and text resizing separately.
- Do not hide essential content merely to make a narrow layout fit.

## States And Preferences

- Define visible focus, hover, active, disabled, error, loading, and selected states.
- Do not rely on hover for essential information.
- Respect reduced motion, forced colors, contrast preferences, and color schemes.
- Avoid animating layout when transform or opacity can express the effect safely.

## Maintainability And Verification

- Use semantic tokens for repeated decisions and avoid unexplained magic values.
- Document browser workarounds with an affected browser and removal condition.
- Check cascade, overflow, long content, themes, focus, reduced motion, zoom, and supported browsers.
