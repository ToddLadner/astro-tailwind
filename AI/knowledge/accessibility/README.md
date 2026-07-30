# Accessibility Knowledge

Verified accessibility guidance that can apply across projects.

## Core Standard

- Target WCAG 2.2 AA unless a project defines a stricter requirement.
- Prefer native HTML semantics before adding ARIA.
- Treat accessibility as part of implementation and acceptance criteria.
- Test behavior, not merely attribute presence.

## Interaction

- Every interactive element must work with a keyboard.
- Preserve logical focus order and visible focus indicators.
- Move focus only when required by an established interaction pattern.
- Ensure dialogs, menus, tabs, disclosures, and tooltips follow expected keyboard behavior.
- Avoid positive `tabindex` values.

## Forms

- Give every control a persistent accessible name.
- Associate instructions and errors programmatically.
- Do not use placeholders as the only labels.
- Preserve entered data after validation errors.
- Identify errors clearly and explain how to correct them.

## Content And Visuals

- Maintain logical heading structure.
- Use useful alternative text for meaningful images and empty alternative text for decorative images.
- Do not communicate meaning through color alone.
- Support text resizing, reflow, zoom, long content, and supported color schemes.

## Dynamic Interfaces

- Announce important asynchronous changes only when necessary.
- Avoid excessive live-region announcements.
- Respect reduced-motion and forced-color preferences.
- Ensure loading, empty, error, and success states remain understandable.

## Verification

Combine keyboard testing, accessibility-tree inspection, automated checks, zoom and reflow testing, and screen-reader testing for complex interactions. Automated checks do not establish full accessibility.
