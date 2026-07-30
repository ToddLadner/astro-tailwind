# Vue Knowledge

Verified Vue guidance that can apply across Vue projects.

## Components

- Prefer focused components with explicit props and emitted events.
- Keep templates declarative and semantically meaningful.
- Avoid mutating props and preserve one-way data flow.
- Use slots when callers own content structure.

## Composition API

- Group logic by responsibility.
- Use composables for genuinely reusable stateful behavior.
- Keep composable side effects explicit.
- Clean up subscriptions, observers, and global listeners.
- Avoid destructuring reactive objects when doing so loses reactivity.

## State And Lifecycle

- Keep state local until shared ownership is required.
- Use computed values for derived state.
- Avoid watchers when computed state or explicit events are clearer.
- Use stores for application-level shared state, not every reusable value.
- Guard browser-only behavior during server rendering.
- Handle asynchronous races and component disposal.

## Accessibility And Testing

- Preserve native element behavior.
- Test emitted behavior and user-visible results.
- Prefer accessible roles and names in tests.
- Verify keyboard interaction and focus for custom controls.
