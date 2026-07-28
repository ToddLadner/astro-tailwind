import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assessEscalation, assertCallBudget } from "../AI/workflows/escalation.mjs";
import { createContextBundle } from "../AI/workflows/context.mjs";
import { phases, transition } from "../AI/workflows/phases.mjs";
import { runCommand, runProvider } from "../AI/workflows/providers.mjs";
import { createState, loadActive, saveState } from "../AI/workflows/state.mjs";
import { collectDiff } from "../AI/workflows/validation.mjs";

const profile = {
	maxClaudeCalls: 1,
	maxCodexCalls: 2,
	maxLocalRepairAttempts: 2,
	name: "balanced-power",
	scoreThreshold: 90,
};

test("workflow state persists and resumes from the active pointer", async () => {
	const directory = await mkdtemp(join(tmpdir(), "ai-workflow-state-"));
	try {
		const created = await createState(directory, "Test feature", profile, true);
		created.state.phaseData = {};
		await saveState(created.runDirectory, created.state);
		const loaded = await loadActive(directory);
		assert.equal(loaded.state.request, "Test feature");
		assert.equal(loaded.state.status, "ready");
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
});

test("approval advances exactly one phase", () => {
	const state = { approvals: {}, phaseIndex: 0, status: "awaiting-approval" };
	const approved = transition(state, "approve");
	assert.equal(approved.phaseIndex, 1);
	assert.equal(approved.status, "ready");
	assert.equal(approved.approvals.discovery, true);
	assert.equal(phases[approved.phaseIndex].id, "planning");
});

test("next approval cannot bypass a pending remote transmission", () => {
	const state = { approvals: {}, phaseIndex: 3, status: "awaiting-remote-approval" };
	assert.throws(() => transition(state, "approve"), /Cannot approve/);
	const approved = transition(state, "approve-remote");
	assert.equal(approved.approvals["remote:architecture"], true);
	assert.equal(approved.phaseIndex, 3);
});

test("escalation combines score, repair, risk, and supervisor gates", () => {
	const result = assessEscalation({
		phase: { id: "architecture", supervisorGate: true },
		profile,
		request: "Change authentication",
		result: { confidence: 70, requestedEscalation: true },
		validationFailures: 2,
	});
	assert.equal(result.required, true);
	assert.equal(result.reasons.length, 5);
});

test("remote call budgets are hard limits", () => {
	assert.throws(() => assertCallBudget({ callCounts: { codex: 2 } }, profile, "codex"), /Codex call budget exhausted/);
});

test("mock providers return structured phase and review results without model calls", async () => {
	const phase = await runProvider({
		cwd: process.cwd(),
		mock: true,
		phase: phases[0],
		prompt: "ignored",
		provider: "lmstudio",
		schemaPath: "ignored",
	});
	assert.equal(phase.result.status, "complete");
	assert.equal(phase.result.confidence, 94);
	const review = await runProvider({
		cwd: process.cwd(),
		mock: true,
		phase: phases.find((item) => item.id === "review"),
		prompt: "ignored",
		provider: "lmstudio",
		schemaPath: "ignored",
	});
	assert.equal(review.result.decision, "pass");
	assert.equal(review.result.score, 96);
});

test("remote context bundles obey their byte limit", async () => {
	const directory = await mkdtemp(join(tmpdir(), "ai-context-bundle-"));
	try {
		await mkdir(join(directory, "artifacts"), { recursive: true });
		const result = await createContextBundle({
			maxBytes: 200,
			phase: phases[0],
			root: process.cwd(),
			runDirectory: directory,
			state: { request: "Tiny request" },
		});
		assert.ok(result.manifest.totalBytes <= 200);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
});

test("implementation patches include newly created files", async () => {
	const directory = await mkdtemp(join(tmpdir(), "ai-patch-new-file-"));
	try {
		await runCommand("git", ["init", "-q"], { cwd: directory });
		await writeFile(join(directory, "tracked.txt"), "tracked\n");
		await runCommand("git", ["add", "tracked.txt"], { cwd: directory });
		await runCommand(
			"git",
			["-c", "user.name=AI Test", "-c", "user.email=ai@example.test", "commit", "-qm", "fixture"],
			{ cwd: directory },
		);
		await writeFile(join(directory, "new-file.txt"), "new\n");
		const evidence = await collectDiff(directory);
		assert.match(evidence.diff, /new-file\.txt/);
		assert.match(evidence.diff, /new file mode/);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
});
