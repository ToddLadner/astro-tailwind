---
name: Accessibility Standards
globs: ["**/*.astro", "**/*.html", "**/*.vue", "**/*.tsx", "**/*.jsx"]
alwaysApply: false
description: Accessibility requirements for user-facing interface work.
---

# Accessibility Standards

- Target WCAG 2.2 AA where applicable.
- Use native semantic elements before ARIA.
- Ensure all interactive controls work with keyboard input.
- Preserve a logical focus order and clearly visible focus indicators.
- Every form control must have an accessible name and clear error association.
- Do not use placeholder text as the only label.
- Ensure icon-only controls have meaningful accessible names.
- Use headings in a logical hierarchy.
- Provide useful alternative text for meaningful images and empty alt text for decorative images.
- Do not rely on color alone to communicate status or meaning.
- Respect reduced-motion preferences.
- For dynamic updates, use live regions only when necessary and avoid excessive announcements.
- When reviewing accessibility, identify the exact element, issue, impact, and recommended fix.
