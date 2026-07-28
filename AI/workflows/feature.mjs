import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { createContextBundle } from "./context.mjs";
import { assessEscalation, assertCallBudget } from "./escalation.mjs";
import { currentPhase, phases, transition } from "./phases.mjs";
import { runCommand, runProvider } from "./providers.mjs";
import { createState, loadActive, saveState } from "./state.mjs";
import {
	applyPatch,
	collectDiff,
	createImplementationWorktree,
	removeImplementationWorktree,
	savePatch,
	validateWorktree,
} from "./validation.mjs";

const root = resolve(import.meta.dirname, "../..");
const workflowsRoot = join(root, "AI/workflows");
const runsDirectory = join(workflowsRoot, "runs");
const profilePath = join(root, "AI/config/profiles/balanced-power.json");
const phaseSchema = join(root, "AI/config/schemas/phase-result.schema.json");
const reviewSchema = join(root, "AI/config/schemas/review-result.schema.json");

async function loadProfile() {
	return JSON.parse(await readFile(profilePath, "utf8"));
}

function event(state, type, details = {}) {
	state.events.push({ at: new Date().toISOString(), phase: currentPhase(state)?.id ?? null, type, ...details });
}

function providerFor(profile, phase) {
	return profile[phase.provider] ?? profile.worker;
}

function promptFor(state, phase, localArtifact = "") {
	const outputContract =
		phase.id === "review" || phase.id === "final-review"
			? `Return JSON with score (0-100), decision (pass, revise, or escalate), findings, and reason.`
			: `Return JSON with status, confidence (0-100), claims, evidence, decisions, openQuestions, risks,
requestedEscalation, and summary.`;
	return `You are the ${phase.role} for phase ${phase.id} in a local-first feature workflow.
Read AGENTS.md and the narrowly relevant project guidance available in the current directory.
Do not perform work from a later phase. ${phase.implementation ? "Implement the approved request in this disposable worktree and run narrow validation." : "Do not edit repository files."}

Feature request:
${state.request}

Approved phase artifact to review, when present:
${localArtifact || "(none)"}

${outputContract}`;
}

function ledger(state) {
	const lines = [`# Workflow ${state.id}`, "", `Request: ${state.request}`, "", `Status: ${state.status}`, ""];
	for (const phase of phases) {
		const data = state.phaseData?.[phase.id];
		const mark = state.approvals[phase.id] ? "approved" : data?.completed ? "complete, awaiting approval" : "pending";
		lines.push(`- ${phase.id}: ${mark}`);
	}
	return `${lines.join("\n")}\n`;
}

async function persist(runDirectory, state) {
	await writeFile(join(runDirectory, "ledger.md"), ledger(state));
	await saveState(runDirectory, state);
}

async function assertCleanRoot() {
	const status = await runCommand("git", ["status", "--short"], { cwd: root });
	if (status.code !== 0) throw new Error(status.stderr);
	if (status.stdout.trim()) throw new Error("Commit or stash the main worktree before starting a feature workflow");
}

async function start(args) {
	const mockIndex = args.indexOf("--mock");
	const mock = mockIndex >= 0;
	if (mock) args.splice(mockIndex, 1);
	const request = args.join(" ").trim();
	if (!request) throw new Error('Usage: npm run ai:feature -- start "feature request" [--mock]');
	if (!mock) await assertCleanRoot();
	const profile = await loadProfile();
	const { runDirectory, state } = await createState(runsDirectory, request, profile, mock);
	state.phaseData = {};
	event(state, "workflow-started", { mock, profile: profile.name });
	await persist(runDirectory, state);
	printStatus(state, runDirectory, profile);
}

function printStatus(state, runDirectory, profile) {
	const phase = currentPhase(state);
	console.log(`Workflow: ${state.id}`);
	console.log(`Profile: ${profile.name}`);
	console.log(`Phase: ${phase?.id ?? "complete"}`);
	console.log(`Status: ${state.status}`);
	console.log(
		`Calls: local ${state.callCounts.lmstudio + state.callCounts.ollama}, Codex ${state.callCounts.codex}/${profile.maxCodexCalls}, Claude ${state.callCounts.claude}/${profile.maxClaudeCalls}`,
	);
	console.log(`Run directory: ${runDirectory}`);
	console.log(
		`Budget: local-first, Codex maximum ${profile.maxCodexCalls}, Claude maximum ${profile.maxClaudeCalls}, remote bundle maximum ${profile.maxRemoteContextBytes} bytes`,
	);
	if (state.pendingEscalation?.reasons?.length) {
		console.log(`Escalation: ${state.pendingEscalation.reasons.join("; ")}`);
	}
}

async function executeNext(runDirectory, state, profile) {
	if (state.status !== "ready") throw new Error(`Cannot run next phase while status is ${state.status}`);
	const phase = currentPhase(state);
	if (!phase) throw new Error("Workflow is complete");
	const phaseData = state.phaseData[phase.id] ?? {};
	if (phase.id === "review" && state.worktree) {
		throw new Error("Apply or discard the approved implementation worktree before starting Review");
	}
	const hasLocalResult = Boolean(phaseData.localResult);
	const remoteApproved = Boolean(state.approvals[`remote:${phase.id}`]);
	const requiresSupervisor = hasLocalResult && (phase.supervisorGate || state.pendingEscalation?.reasons?.length);
	const needsSupervisor = requiresSupervisor && remoteApproved;

	if (requiresSupervisor && profile.requireApprovalBeforeRemote && !remoteApproved) {
		const context = await createContextBundle({
			maxBytes: profile.maxRemoteContextBytes,
			phase,
			root,
			runDirectory,
			state,
		});
		state.pendingEscalation = {
			bundle: context.bundle,
			manifest: context.manifest,
			reasons: [`configured supervisor gate: ${phase.id}`],
		};
		state.status = "awaiting-remote-approval";
		event(state, "remote-approval-requested", { bytes: context.manifest.totalBytes });
		await persist(runDirectory, state);
		console.log(`Remote review bundle prepared: ${join(context.bundle, "manifest.json")}`);
		console.log("Inspect it, then run: npm run ai:feature -- approve-remote");
		return;
	}

	let provider = providerFor(profile, phase);
	let cwd = root;
	const schemaPath =
		phase.id === "review" || phase.id === "final-review" || needsSupervisor ? reviewSchema : phaseSchema;
	let localArtifact = "";
	let writable = false;
	if (needsSupervisor) {
		provider = state.pendingEscalation?.provider ?? profile.supervisor;
		assertCallBudget(state, profile, provider);
		cwd = state.pendingEscalation.bundle;
		localArtifact = JSON.stringify(phaseData.localResult, null, 2);
	}
	if (phase.implementation && !state.mock) {
		if (!state.worktree) state.worktree = await createImplementationWorktree(root, state.id);
		cwd = state.worktree.path;
		writable = true;
	}
	state.status = "working";
	event(state, "phase-started", { provider, supervisor: needsSupervisor });
	await persist(runDirectory, state);
	const run = await runProvider({
		cwd,
		mock: state.mock,
		outputDirectory: join(runDirectory, "artifacts"),
		phase,
		prompt: promptFor(state, phase, localArtifact),
		provider,
		schemaPath,
		writable,
	});
	if (needsSupervisor && !profile.retainRemoteBundles) {
		await rm(cwd, { force: true, recursive: true });
	}
	state.callCounts[provider] = (state.callCounts[provider] ?? 0) + (state.mock ? 0 : 1);
	const artifactName = `${phase.id}${needsSupervisor ? "-supervisor" : ""}.json`;
	await writeFile(join(runDirectory, "artifacts", artifactName), JSON.stringify(run.result, null, 2));
	phaseData.completed = true;
	phaseData.provider = provider;
	phaseData.model = run.model ?? null;
	phaseData.durationMs = run.durationMs;
	if (needsSupervisor) phaseData.supervisorResult = run.result;
	else phaseData.localResult = run.result;
	if (phase.implementation) {
		if (state.mock) {
			phaseData.diff = { diff: "mock implementation patch", status: "mock" };
			phaseData.validation = { passed: true, results: [] };
		} else {
			const patchPath = join(runDirectory, "artifacts", "implementation.patch");
			phaseData.diff = await savePatch(state.worktree.path, patchPath);
			phaseData.validation = await validateWorktree(state.worktree.path, profile.validationCommands);
		}
		await writeFile(join(runDirectory, "artifacts", "validation.json"), JSON.stringify(phaseData.validation, null, 2));
	}
	state.phaseData[phase.id] = phaseData;
	const assessment = assessEscalation({
		phase: needsSupervisor ? { ...phase, supervisorGate: false } : phase,
		profile,
		request: state.request,
		result: run.result,
		validationFailures: phaseData.validation?.passed === false ? 1 : 0,
	});
	if (phase.supervisorGate && !needsSupervisor) {
		state.status = "ready";
		state.pendingEscalation = { reasons: assessment.reasons };
		console.log(`Local ${phase.id} complete; supervisor review is required.`);
	} else if (assessment.required && !needsSupervisor) {
		const context = await createContextBundle({
			maxBytes: profile.maxRemoteContextBytes,
			phase,
			root,
			runDirectory,
			state,
		});
		state.pendingEscalation = { bundle: context.bundle, manifest: context.manifest, reasons: assessment.reasons };
		state.status = "awaiting-remote-approval";
		console.log(`Escalation required: ${assessment.reasons.join("; ")}`);
	} else {
		state.pendingEscalation = null;
		state.status = "awaiting-approval";
		console.log(`${phase.id} complete with ${provider}; awaiting your approval.`);
	}
	event(state, "phase-completed", { provider, status: state.status });
	await persist(runDirectory, state);
}

async function main() {
	await mkdir(runsDirectory, { recursive: true });
	const [command = "status", ...args] = process.argv.slice(2);
	if (command === "start") return start(args);
	const profile = await loadProfile();
	const { runDirectory, state } = await loadActive(runsDirectory);
	if (command === "status") return printStatus(state, runDirectory, profile);
	if (command === "next") return executeNext(runDirectory, state, profile);
	if (command === "resume") {
		if (!["working", "blocked", "stopped"].includes(state.status)) {
			throw new Error(`Workflow does not need recovery while status is ${state.status}`);
		}
		state.status = "ready";
		event(state, "workflow-resumed");
		await persist(runDirectory, state);
		return printStatus(state, runDirectory, profile);
	}
	if (command === "request-claude") {
		const phase = currentPhase(state);
		if (!state.phaseData?.[phase.id]?.localResult) throw new Error("Run the local phase before requesting Claude");
		assertCallBudget(state, profile, profile.independentReviewer);
		const context = await createContextBundle({
			maxBytes: profile.maxRemoteContextBytes,
			phase,
			root,
			runDirectory,
			state,
		});
		state.pendingEscalation = {
			bundle: context.bundle,
			manifest: context.manifest,
			provider: profile.independentReviewer,
			reasons: ["user requested independent frontier review"],
		};
		state.status = "awaiting-remote-approval";
		event(state, "independent-review-requested", { provider: profile.independentReviewer });
		await persist(runDirectory, state);
		console.log(`Claude review bundle prepared: ${join(context.bundle, "manifest.json")}`);
		console.log("Inspect it, then run: npm run ai:feature -- approve-remote");
		return;
	}
	if (["approve", "approve-remote", "revise", "stop"].includes(command)) {
		if (command === "revise") {
			const phase = currentPhase(state);
			delete state.phaseData?.[phase.id];
			delete state.approvals[`remote:${phase.id}`];
			state.pendingEscalation = null;
		}
		const updated = transition(state, command);
		event(updated, command, { note: args.join(" ") || undefined });
		await persist(runDirectory, updated);
		return printStatus(updated, runDirectory, profile);
	}
	if (command === "diff") {
		if (!state.worktree) throw new Error("No implementation worktree exists");
		console.log((await collectDiff(state.worktree.path)).diff);
		return;
	}
	if (command === "validate") {
		if (!state.worktree) throw new Error("No implementation worktree exists");
		const result = await validateWorktree(state.worktree.path, profile.validationCommands);
		console.log(JSON.stringify(result, null, 2));
		if (!result.passed) process.exitCode = 1;
		return;
	}
	if (command === "apply") {
		if (!state.approvals.implementation) throw new Error("Approve implementation before applying its patch");
		await applyPatch(root, join(runDirectory, "artifacts", "implementation.patch"));
		await removeImplementationWorktree(root, state.worktree);
		state.worktree = null;
		event(state, "patch-applied");
		await persist(runDirectory, state);
		console.log("Approved implementation patch applied to the main worktree.");
		return;
	}
	if (command === "discard") {
		await removeImplementationWorktree(root, state.worktree);
		state.worktree = null;
		event(state, "worktree-discarded");
		await persist(runDirectory, state);
		console.log("Disposable implementation worktree removed.");
		return;
	}
	throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
	console.error(`AI feature workflow failed: ${error.message}`);
	process.exitCode = 1;
});
