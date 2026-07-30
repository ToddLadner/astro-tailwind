# React Knowledge

Verified React guidance that can apply across React projects.

## Components And State

- Keep rendering pure and prefer composition over deep configuration.
- Keep state as local as practical and store only the minimum required.
- Use stable keys derived from data.
- Avoid copying props into state without a synchronization requirement.
- Derive inexpensive deterministic values during rendering.
- Treat server, URL, form, and local UI state as different concerns.
- Model related transitions together when separate values can become inconsistent.

## Effects

- Use effects to synchronize with external systems.
- Do not use effects for values that can be calculated during rendering.
- Declare complete dependencies.
- Clean up subscriptions and global listeners.
- Ensure effects tolerate development-time remounting.
- Avoid data-fetch races and stale asynchronous updates.

## Performance

- Measure before adding memoization.
- Do not use memoization to hide incorrect state ownership.
- Keep expensive work away from frequently changing render paths.
- Use code splitting when bundle evidence supports it.

## Accessibility And Testing

- Preserve semantic HTML and native control behavior.
- Test observable behavior rather than implementation details.
- Prefer queries based on roles and accessible names.
- Verify keyboard behavior, focus, and asynchronous states.
