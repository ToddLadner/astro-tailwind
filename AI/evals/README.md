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

## Evaluation Lab

Run the complete suite through Codex, judge every assertion, compare it with the latest prior run, and generate
terminal, Markdown, JSON, and HTML reports:

```sh
npm run eval:ai
```

Useful options:

```sh
npm run eval:ai -- --case baseline-failure
npm run eval:ai -- --provider claude
npm run eval:ai -- --provider ollama
npm run eval:ai -- --provider lmstudio
npm run eval:ai -- --provider ollama --judge-provider codex
npm run eval:ai -- --model <model> --judge-model <model>
npm run eval:ai -- --jobs 2
npm run eval:ai -- --dry-run
```

Each agent run is ephemeral, non-interactive, and read-only. A separate structured judge grades every required and
prohibited assertion and cites response evidence. The configured Codex model service receives the case, applicable
repository guidance, and generated response; review those inputs before running the lab against a private workspace.
Reports are written beneath `results/runs/`, which is ignored by Git because responses may be large or contain local
repository context.

The HTML report is self-contained and includes the overall score, role scores, regressions, improvements, failed
expectations, response excerpts, duration, and token usage when the provider reports it.

Provider modes:

- `codex` is the default remote mode and uses the configured Codex model service.
- `claude` uses the installed Claude Code CLI in non-interactive, no-session-persistence mode. Advisory cases receive
  read-only tools; implementation cases receive scoped edit and validation tools inside the disposable worktree.
- `ollama` keeps generation and judging on the local Ollama endpoint.
- `lmstudio` keeps generation and judging on the local LM Studio endpoint.
- A local `--provider` with `--judge-provider codex` creates hybrid mode: implementation stays local while the
  generated response and evaluation assertions are sent to the configured remote judge.
- Agent and judge engines can be mixed freely, for example `--provider claude --judge-provider codex` or
  `--provider codex --judge-provider claude`.

Cases with `mode: implementation` run in disposable detached Git worktrees. The agent receives workspace-write
access only inside that worktree. The judge receives the final response, Git status, diff, validation command, exit
code, and output. The worktree is force-removed after evidence is collected.

Calibrate the judge against human-scored golden responses:

```sh
npm run ai:calibrate
npm run ai:calibrate -- --provider ollama
```

Agreement below 90% fails calibration. The latest calibration result is stored locally and shown by the doctor.

Before a run, inspect readiness, privacy mode, model-call count, worktree state, and calibration:

```sh
npm run ai:doctor
npm run ai:doctor -- --provider claude
npm run ai:doctor -- --provider ollama
```

Browse score history, per-case trends, failures, and individual reports:

```sh
npm run ai:dashboard
```

Then open `http://127.0.0.1:4177`. Use `npm run ai:dashboard -- --build-only` to generate the dashboard without
starting a server.

Run deterministic schema checks without calling a model:

```sh
bash AI/evals/run.sh check
```

The older manual `record` mode remains available for reviewed external responses.

## Change Policy

When roles, rules, prompts, or project instructions change:

1. Run the deterministic checks.
2. Exercise every affected case with the intended agent or model.
3. Review responses against their assertions.
4. Record before-and-after results when behavior changes materially.
5. Add a case when fixing an instruction failure that existing cases did not catch.

CI checks case structure and lab syntax only. It does not call a model, spend credentials, or treat nondeterministic
output as a stable build signal.
