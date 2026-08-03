import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
	assessEscalation,
	assertCallBudget,
	findCopiedApprovedPhase,
	localPhaseAttempts,
} from "../AI/workflows/escalation.mjs";
import { createContextBundle } from "../AI/workflows/context.mjs";
import { promptFor, retryBackupOnlyImplementation, retryRevertedImplementation } from "../AI/workflows/feature.mjs";
import { phases, transition } from "../AI/workflows/phases.mjs";
import { normalizeResultScores, runCommand, runProvider, structuredResultErrors } from "../AI/workflows/providers.mjs";
import { createState, loadActive, saveState } from "../AI/workflows/state.mjs";
import { collectDiff, ensureWorktreeDependencies, meaningfulImplementationPaths } from "../AI/workflows/validation.mjs";

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

test("phase prompts include approved results, revision notes, and strict boundaries", () => {
	const state = {
		approvals: { discovery: true },
		events: [{ note: "Return an ordered plan.", phase: "planning", type: "revise" }],
		phaseData: {
			discovery: {
				localResult: { confidence: 95, summary: "Confirmed requirements." },
			},
		},
		request: "Add theme polish",
	};
	const prompt = promptFor(state, phases[1]);
	assert.match(prompt, /Confirmed requirements/);
	assert.match(prompt, /Return an ordered plan/);
	assert.match(prompt, /do not claim that implementation has occurred/);
	assert.match(prompt, /Return ONLY one JSON object/);
	assert.match(prompt, /Every item in claims, evidence, decisions, openQuestions, and risks must be a JSON string/);
	assert.match(prompt, /Do not create backup, temporary, \.bak/);
});

test("phase prompts compact approved results to avoid context growth", () => {
	const state = {
		approvals: { discovery: true },
		events: [],
		phaseData: {
			discovery: {
				localResult: {
					claims: ["large claim that should not be forwarded"],
					decisions: ["Keep the approved boundary."],
					evidence: ["large evidence that should not be forwarded"],
					openQuestions: [],
					risks: [],
					summary: "Concise approved result.",
				},
			},
		},
		request: "Add documentation",
	};
	const prompt = promptFor(state, phases[1]);
	assert.match(prompt, /Concise approved result/);
	assert.doesNotMatch(prompt, /Keep the approved boundary/);
	assert.doesNotMatch(prompt, /large claim that should not be forwarded/);
	assert.doesNotMatch(prompt, /large evidence that should not be forwarded/);
});

test("quality gate detects copied phase output and counts local attempts", () => {
	const copied = { claims: ["same"], decisions: [], evidence: [], openQuestions: [], risks: [], summary: "same" };
	const state = {
		approvals: { discovery: true },
		events: [
			{ phase: "planning", provider: "lmstudio", type: "phase-started" },
			{ phase: "planning", provider: "lmstudio", type: "phase-started" },
		],
		phaseData: { discovery: { localResult: copied } },
	};
	assert.equal(findCopiedApprovedPhase(state, phases[1], copied), "discovery");
	assert.equal(localPhaseAttempts(state, phases[1]), 2);
});

test("quality gate does not compare review output with phase output", () => {
	const state = {
		approvals: { architecture: true },
		phaseData: {
			architecture: {
				localResult: { claims: [], decisions: [], evidence: [], openQuestions: [], risks: [], summary: "" },
			},
		},
	};
	const review = { decision: "revise", findings: ["Validation failed"], reason: "Broken build", score: 7 };
	assert.equal(
		findCopiedApprovedPhase(
			state,
			phases.find((phase) => phase.id === "review"),
			review,
		),
		null,
	);
});

test("repair supervisor prompts replace bad phase output using the phase schema", () => {
	const state = {
		approvals: { discovery: true },
		events: [],
		phaseData: { discovery: { localResult: { summary: "requirements" } } },
		request: "Add theme polish",
	};
	const prompt = promptFor(state, phases[1], '{"summary":"copied"}', "repair");
	assert.match(prompt, /Replace it with a correct/);
	assert.match(prompt, /"status":"complete"/);
	assert.doesNotMatch(prompt, /"decision":"pass"/);
});

test("structured output schemas require every declared property", async () => {
	for (const filename of ["phase-result.schema.json", "review-result.schema.json"]) {
		const schema = JSON.parse(await readFile(join(process.cwd(), "AI", "config", "schemas", filename), "utf8"));
		assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
	}
});

test("next approval cannot bypass a pending remote transmission", () => {
	const state = { approvals: {}, phaseIndex: 3, status: "awaiting-remote-approval" };
	assert.throws(() => transition(state, "approve"), /Cannot approve/);
	const approved = transition(state, "approve-remote");
	assert.equal(approved.approvals["remote:architecture"], true);
	assert.equal(approved.phaseIndex, 3);
});

test("revision can reject a pending remote transmission", () => {
	const state = { approvals: {}, phaseIndex: 0, status: "awaiting-remote-approval" };
	const revised = transition(state, "revise");
	assert.equal(revised.status, "ready");
	assert.deepEqual(revised.approvals, {});
});

test("revision can replace a local result before a supervisor gate", () => {
	const state = { approvals: {}, phaseIndex: 3, status: "ready" };
	const revised = transition(state, "revise");
	assert.equal(revised.status, "ready");
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
	assert.ok(result.reasons.includes("validation failed"));
});

test("escalation normalizes fractional confidence scores", () => {
	const highConfidence = assessEscalation({
		phase: { id: "discovery", supervisorGate: false },
		profile,
		request: "Document components",
		result: { confidence: 0.95, requestedEscalation: false },
	});
	assert.equal(highConfidence.required, false);

	const lowConfidence = assessEscalation({
		phase: { id: "discovery", supervisorGate: false },
		profile,
		request: "Document components",
		result: { confidence: 0.7, requestedEscalation: false },
	});
	assert.equal(lowConfidence.required, true);
	assert.deepEqual(lowConfidence.reasons, ["score 70 is below 90"]);
});

test("escalation distinguishes a missing score from a real zero", () => {
	const missingScore = assessEscalation({
		phase: { id: "implementation", supervisorGate: false },
		profile,
		request: "Update a component",
		result: { type: "function" },
	});
	assert.deepEqual(missingScore.reasons, ["provider result omitted a numeric score or confidence"]);

	const zeroScore = assessEscalation({
		phase: { id: "implementation", supervisorGate: false },
		profile,
		request: "Update a component",
		result: { confidence: 0 },
	});
	assert.deepEqual(zeroScore.reasons, ["score 0 is below 90"]);
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

test("provider results normalize fractional confidence and review scores", () => {
	assert.deepEqual(normalizeResultScores({ confidence: 0.95, score: 1 }), { confidence: 95, score: 100 });
	assert.deepEqual(normalizeResultScores({ confidence: 95, score: 82 }), { confidence: 95, score: 82 });
});

test("provider result validation rejects tool calls and malformed phase fields", async () => {
	const schema = JSON.parse(
		await readFile(join(process.cwd(), "AI", "config", "schemas", "phase-result.schema.json"), "utf8"),
	);
	const toolCallErrors = structuredResultErrors(
		{ function: { name: "exec_command" }, id: "call_123", type: "function" },
		schema,
	);
	assert.ok(toolCallErrors.some((error) => error.includes('missing required field "confidence"')));
	assert.ok(toolCallErrors.some((error) => error.includes('unexpected field "function"')));

	const malformedErrors = structuredResultErrors(
		{
			claims: ["claim"],
			confidence: 95,
			decisions: [],
			evidence: [42],
			openQuestions: [],
			requestedEscalation: false,
			risks: [],
			status: "complete",
			summary: "done",
		},
		schema,
	);
	assert.deepEqual(malformedErrors, ['field "evidence" item 0 must be string']);
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

test("implementation quality ignores backup-only changes", () => {
	assert.deepEqual(meaningfulImplementationPaths(" A src/components/Button.astro.bak\n?? node_modules\n"), []);
	assert.deepEqual(meaningfulImplementationPaths("?? src/components/Button.astro~\n"), []);
	assert.deepEqual(meaningfulImplementationPaths(" M src/components/Button.astro\n"), ["src/components/Button.astro"]);
	assert.deepEqual(meaningfulImplementationPaths("R  src/old.astro -> src/new.astro\n A notes.tmp\n"), [
		"src/new.astro",
	]);
});

test("stopped workflows can safely retry a backup-only implementation", () => {
	const state = {
		approvals: { implementation: true, planning: true, "remote:review": true },
		pendingEscalation: { reasons: ["score 0 is below 90"] },
		phaseData: {
			implementation: { diff: { diff: "backup patch", status: " A src/Button.astro.bak\n" } },
			review: { localResult: { score: 0 } },
		},
		phaseIndex: phases.findIndex((phase) => phase.id === "review"),
		status: "stopped",
	};
	retryBackupOnlyImplementation(state);
	assert.equal(phases[state.phaseIndex].id, "implementation");
	assert.equal(state.status, "ready");
	assert.equal(state.pendingEscalation, null);
	assert.equal(state.approvals.planning, true);
	assert.equal(state.approvals.implementation, undefined);
	assert.equal(state.approvals["remote:review"], undefined);
	assert.equal(state.phaseData.implementation, undefined);
	assert.equal(state.phaseData.review, undefined);
});

test("stopped workflows cannot automatically rewind a meaningful implementation", () => {
	const state = {
		approvals: { implementation: true },
		phaseData: {
			implementation: { diff: { diff: "real patch", status: " M src/components/Button.astro\n" } },
		},
		phaseIndex: phases.findIndex((phase) => phase.id === "review"),
		status: "stopped",
	};
	assert.throws(() => retryBackupOnlyImplementation(state), /contains meaningful changes/);
	retryRevertedImplementation(state);
	assert.equal(phases[state.phaseIndex].id, "implementation");
	assert.equal(state.status, "ready");
});

test("implementation worktrees reuse installed dependencies", async () => {
	const directory = await mkdtemp(join(tmpdir(), "ai-worktree-dependencies-"));
	const root = join(directory, "root");
	const worktree = join(directory, "worktree");
	try {
		await mkdir(join(root, "node_modules"), { recursive: true });
		await mkdir(worktree);
		assert.equal(await ensureWorktreeDependencies(root, worktree), true);
		assert.equal(await readlink(join(worktree, "node_modules")), join(root, "node_modules"));
		assert.equal(await ensureWorktreeDependencies(root, worktree), true);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
});
