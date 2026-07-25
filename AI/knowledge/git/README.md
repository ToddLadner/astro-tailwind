# Git Knowledge

Verified Git workflow guidance that can apply across projects.

## Safety

- Inspect the working tree before switching branches or editing overlapping files.
- Treat existing changes as user-owned unless proven otherwise.
- Prefer reversible recovery operations.
- Do not rewrite shared history without explicit authorization.
- Never commit secrets, credentials, local configuration, or unrelated generated files.

## Branching

- Follow documented naming and base-branch conventions.
- Keep branches focused on one coherent outcome.
- Confirm the current branch before committing or publishing.
- Update from the correct base using the project’s preferred strategy.
- Do not assume `main` is always the correct base branch.

## Commits

- Make each commit coherent and reviewable.
- Describe intent and outcome rather than file operations.
- Stage intentionally and inspect the staged diff.
- Do not mix unrelated cleanup with functional changes.
- Include tests and documentation with the behavior they support.

## Reviews And Pull Requests

- Review the diff against the actual base branch.
- Summarize behavior, validation, risks, and follow-up work.
- Separate pre-existing failures from introduced regressions.
- Address feedback in focused changes.
- Resolve review conversations only after the concern is handled.

## Release Notes And Recovery

- Describe user-visible or operator-visible effects and identify breaking changes.
- Derive release notes from verified changes rather than commit titles alone.
- Prefer `git status`, `git diff`, `git reflog`, and targeted restoration for recovery.
- Confirm exact paths and commits before restoring or deleting anything.
- Create a backup branch when recovery is uncertain.
