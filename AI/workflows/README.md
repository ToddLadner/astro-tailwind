# Balanced-Power Feature Workflows

The workflow engine keeps orchestration deterministic, delegates routine work to LM Studio, and requests explicit
approval before sending a bounded context bundle to Codex or Claude.

## Start And Advance

Commit or stash the main worktree, then run:

```sh
npm run ai:feature -- start "Build a three-state theme preference control"
npm run ai:feature -- next
npm run ai:feature -- status
npm run ai:feature -- approve
```

`next` runs one phase and never implies approval. Use `revise "note"` to rerun the current phase. Supervisor gates
prepare a manifest and stop before transmitting anything remotely:

```sh
npm run ai:feature -- approve-remote
npm run ai:feature -- next
```

## Implementation Safety

Implementation happens in a detached disposable worktree. The main worktree remains unchanged until:

```sh
npm run ai:feature -- diff
npm run ai:feature -- validate
npm run ai:feature -- approve
npm run ai:feature -- apply
```

Use `discard` to remove the implementation worktree without applying its patch.

If a provider exits or stalls after completing implementation edits, use `capture` from the `ready` implementation
state to save and validate the existing worktree without another model call.

Use `resume` after an interrupted provider call. Use `request-claude` after a local result when an independent
frontier opinion is valuable. Use `request-claude repair` when Claude should replace a failed phase result rather
than review it. Both commands stop for remote-bundle approval before calling Claude.

Use `request-codex` when a completed local phase needs frontier repair. Copied output is detected automatically
after the configured local repair limit. Both paths prepare a bounded bundle and stop before remote transmission.

## Deterministic Test Mode

After committing the workflow engine, exercise transitions without model calls:

```sh
npm run ai:feature -- start "Test workflow" --mock
npm run ai:feature -- next
```

Run state under `AI/workflows/runs/` is ignored by Git. Each run contains state, an event log, a phase ledger,
artifacts, validation output, and remote context manifests.

## Cost And Privacy

The `balanced-power` profile allows at most two Codex calls and one Claude call. LM Studio handles normal phases.
Remote bundles have a 50 KB limit and include only the request, approved ledger, active role, and selected project
context. A remote call cannot occur until `approve-remote` is recorded.
