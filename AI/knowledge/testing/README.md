# Testing Knowledge

Verified testing guidance that can apply across projects.

## Strategy

- Test behavior at the narrowest level that provides meaningful confidence.
- Favor valuable tests over broad low-signal coverage.
- Match test type to risk: unit, integration, browser, accessibility, or end-to-end.
- Include failure, empty, boundary, and recovery behavior.
- Treat flaky tests as defects.

## Unit And Integration Tests

- Use unit tests for deterministic logic with clear inputs and outputs.
- Avoid mocking the behavior under test.
- Keep fixtures small and assert observable results.
- Exercise real boundaries where practical.
- Mock unstable systems at a documented boundary.
- Do not allow mocks to drift silently from production contracts.

## Browser And End-To-End Tests

- Test critical journeys and high-risk interactions.
- Prefer accessible roles and names as selectors.
- Avoid selectors coupled to presentation details.
- Verify loading, error, success, and interrupted flows.
- Control external data and time when determinism matters.

## Accessibility And Reporting

- Combine automated scanning with keyboard and screen-reader checks.
- Validate focus, accessible names, zoom, reflow, contrast, and motion preferences.
- Record exact commands and results.
- Distinguish skipped tests, existing failures, and introduced regressions.
- State what remains untested.
