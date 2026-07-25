# Astro Tailwind Commands

Run commands from the repository root.

| Command | Purpose | Writes source files |
| --- | --- | --- |
| `npm install` | Install locked dependencies | No |
| `npm run dev` | Start the Astro development server | No |
| `npm test` | Run Node tests | No |
| `npm run lint` | Check formatting and lint rules with Biome | No |
| `npm run lint:fix` | Apply safe Biome formatting and lint fixes | Yes |
| `npm run build` | Create an Astro production build | Only generated output |

Choose the narrowest command that validates the changed behavior. Browser interaction, responsive layout, and accessibility still require focused browser or manual verification.

`npm run lint` and `npm run build` currently report baseline failures recorded in `known-issues.md`. Do not claim clean results until those are resolved.
