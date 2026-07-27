# AI Behavioral Evaluations

These cases detect regressions in the repository's agent roles, rules, prompts, and project context. They test
observable behavior rather than exact wording.

## Case Format

Every file in `cases/` must contain:

- Frontmatter fields: `id`, `role`, and `severity`.
- `## Scenario`: the task and relevant context.
- `## Required behavior`: independently testable expectations.
- `## Prohibited behavior`: actions that make the case fail.
- `## Evidence`: files or commands that establish the expected behavior.

Use `critical` severity when violating the case could corrupt work, conceal a regression, or change an established
API. Otherwise use `standard`.

## Commands

Run deterministic schema checks:

```sh
npm run eval:ai
```

Record a response after reviewing it:

```sh
bash AI/evals/run.sh record <case-id> <response-file> pass
bash AI/evals/run.sh record <case-id> <response-file> fail
```

The record command copies the response into `results/` with a timestamp and writes review metadata beside it.
Do not record `pass` until every required behavior is present and every prohibited behavior is absent.

## Change Policy

When roles, rules, prompts, or project instructions change:

1. Run the deterministic checks.
2. Exercise every affected case with the intended agent or model.
3. Review responses against their assertions.
4. Record before-and-after results when behavior changes materially.
5. Add a case when fixing an instruction failure that existing cases did not catch.

CI checks case structure only. It does not call a model, spend credentials, or treat nondeterministic output as a
stable build signal.
