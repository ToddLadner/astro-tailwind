# Astro Tailwind Known Issues

## Verified Issues

- `astro.config.mjs` contains the placeholder site URL `https://sites-deployed.url`; sitemap and canonical deployment assumptions are not trustworthy until it is replaced.
- `src/css/media.css` is not imported by the verified global stylesheet entrypoint.
- `src/scripts/alpine-entry.ts` is configured as the Alpine entrypoint but currently contains no active registration.
- Automated tests cover only a small server-side helper and do not cover components, interactions, responsive behavior, or accessibility.
- The component and page folders include experiments, so stability cannot be inferred from file location alone.
- `npm run lint` currently reports existing formatting violations and CSS findings in `src/components/Avatar.astro`, `src/css/main.css`, `src/css/reset.css`, and `src/pages/messaging.astro`.
- `npm run build` fetches PokeAPI data and then fails while rendering `/tabs/` because `src/pages/tabs.astro` references undefined `Tabs`.
- The build also warns that `src/scripts/alpine-entry.ts` has no default export and reports generated CSS containing an unexpected closing parenthesis.

## Maintenance

Record only reproduced or source-verified issues here. Remove an entry in the same change that resolves it.
