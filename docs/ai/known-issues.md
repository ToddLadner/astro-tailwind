# Astro Tailwind Known Issues

## Verified Issues

- `src/css/media.css` is not imported by the verified global stylesheet entrypoint.
- `src/scripts/alpine-entry.ts` is configured as the Alpine entrypoint but currently contains no active registration.
- Automated tests cover only a small server-side helper and do not cover components, interactions, responsive behavior, or accessibility.
- The component and page folders include experiments, so stability cannot be inferred from file location alone.

## Validation Baseline

Last reproduced on 2026-08-03 from the repository root after migration to AI Workbench:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm test` | Pass | 5 application tests passed; 24 retired orchestration tests were removed with the legacy workflow |
| `npm run lint` | Pass | 73 files checked with no fixes required |
| `npm run build` | Pass | 117 pages built; Vite reported a non-failing unused-import warning from Astro dependencies |

There are no documented baseline command failures. A nonzero result from any command above must be investigated as
a new regression or an environment-specific failure; it must not be silently attributed to the baseline.

## Maintenance

Record only reproduced or source-verified issues here. For command failures, include the command, reproduction date,
relevant output, affected files, impact, agent handling, and removal condition. Remove an entry in the same change
that resolves it.
