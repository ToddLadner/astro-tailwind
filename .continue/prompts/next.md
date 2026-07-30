---
name: next
description: Run the next approved workflow phase without chaining phases.
invokable: true
---

Read `AI/agents/orchestrator.md` and the latest workflow ledger in this conversation.

Proceed only when the conversation contains explicit approval for the current gate. `/next` is routing, not approval. If approval is missing, report the current gate and stop with Status `awaiting approval`.

Select exactly one next step from the orchestrator transitions. Load only:

- the next specialist file under `AI/agents/`;
- rules and templates applicable to that specialist;
- approved summaries from the ledger;
- project files needed for the phase.

Run one phase only. Use the required status header and compact ledger, then stop at the next approval gate. Never chain phases or claim autonomous agents were called.

If a review or QA blocker requires Engineering, route back to the Engineer. If an earlier phase was revised, invalidate dependent later decisions before continuing.
