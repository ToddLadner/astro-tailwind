# Astro Tailwind Commands

Run commands from the repository root.

| Command | Purpose | Writes source files |
| --- | --- | --- |
| `npm install` | Install locked dependencies | No |
| `npm run dev` | Start the Astro development server | No |
| `npm test` | Run Node tests | No |
| `npm run lint` | Check formatting and lint rules with Biome | No |
| `npm run lint:fix` | Apply safe Biome formatting and lint fixes | Yes |
| `npm run verify:ai` | Validate the local AI workspace and evaluation cases | No |
| `npm run eval:ai` | Run and report the local behavioral AI evaluation suite | Only ignored evaluation reports |
| `npm run ai:calibrate` | Measure judge agreement against human-scored golden responses | Only ignored calibration results |
| `npm run ai:doctor` | Check provider, privacy, evaluation, worktree, and reporting readiness | No |
| `npm run ai:dashboard` | Serve the local evaluation-history dashboard | Only an ignored generated dashboard |
| `npm run build` | Create a local-origin Astro production build | Only generated output |
| `SITE_URL=https://example.com npm run build` | Build with a production canonical origin | Only generated output |

Choose the narrowest command that validates the changed behavior. Browser interaction, responsive layout, and accessibility still require focused browser or manual verification.

Set `SITE_URL` in deployment environments so sitemap and canonical metadata use the production origin.

The test, lint, and build commands were passing when last reproduced on 2026-07-27. See `known-issues.md` for the
current validation baseline; never assume a new failure is pre-existing without a matching entry there.
