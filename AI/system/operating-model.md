# Operating Model

Use a plan → implement → verify → handoff loop.

## Required behavior

1. Read only the files needed for the current step.
2. Keep each implementation step independently testable.
3. Never treat unverified output as established context.
4. Preserve existing APIs unless the task explicitly changes them.
5. Do not edit unrelated files.
6. Stop and report uncertainty when project evidence conflicts.
7. Prefer repository search and filesystem reads over large pasted context.

## Context limits

- Target input context per step: 8K–12K tokens.
- Avoid broad repository dumps.
- Start a fresh conversation after a major milestone or when context becomes noisy.
- Use `AI/templates/documentation/handoff.md` to carry forward only verified facts.
