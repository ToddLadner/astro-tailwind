# Astro Tailwind Known Issues

## Verified Issues

- `src/css/media.css` is not imported by the verified global stylesheet entrypoint.
- `src/scripts/alpine-entry.ts` is configured as the Alpine entrypoint but currently contains no active registration.
- Automated tests cover only a small server-side helper and do not cover components, interactions, responsive behavior, or accessibility.
- The component and page folders include experiments, so stability cannot be inferred from file location alone.

## Maintenance

Record only reproduced or source-verified issues here. Remove an entry in the same change that resolves it.
