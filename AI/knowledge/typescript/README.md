# TypeScript Knowledge

Verified TypeScript guidance that can apply across projects.

## Type Safety

- Respect the project’s configured strictness.
- Avoid `any`; prefer precise types, `unknown`, or generics.
- Narrow external and nullable values before use.
- Avoid broad assertions that bypass evidence.
- Model impossible states so they are difficult to represent.

## Boundaries

- Validate untrusted runtime data even when a static type exists.
- Type API, storage, environment, and serialization boundaries explicitly.
- Keep internal types aligned with runtime behavior.
- Do not assume generated or third-party types guarantee valid data.

## Type Design

- Prefer clear domain types for reused concepts.
- Keep one-off types close to their implementation.
- Use discriminated unions for related state variants.
- Preserve readonly data when mutation is unnecessary.
- Avoid complex type machinery without a maintenance benefit.

## Functions And Errors

- Type public inputs and outputs while allowing straightforward local inference.
- Avoid optional fields when absence has no defined meaning.
- Treat caught values as unknown and narrow before reading properties.
- Represent expected failure states explicitly where useful.
- Document the runtime invariant behind any necessary assertion.
