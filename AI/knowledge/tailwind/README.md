# Tailwind Knowledge

Verified Tailwind guidance that can apply across projects.

## Configuration

- Verify the installed Tailwind version before applying guidance.
- Tailwind 4 commonly uses CSS-first configuration; do not assume a JavaScript config exists.
- Preserve the project’s theme source and CSS layer order.
- Prefer project tokens over defaults when a custom theme is established.

## Utilities And Tokens

- Use utilities when they express intent clearly.
- Avoid arbitrary values when an existing token fits.
- Do not produce unreadable class strings merely to avoid component CSS.
- Keep responsive and state variants intentional.
- Prefer semantic utilities and tokens in product components.
- Search consumers before changing theme values.
- Extract repeated patterns only when they represent a shared concept.

## Custom CSS

Use custom CSS when behavior is difficult to express clearly with utilities, a selector represents a real project pattern, complex states benefit from local organization, or component-local styles improve ownership. Do not convert stable custom CSS solely for stylistic consistency.

## Verification

- Confirm generated classes are discoverable by Tailwind.
- Test responsive variants and interaction states.
- Inspect conflicts between custom layers and generated utilities.
- Verify production builds, where detection and minification may differ.
