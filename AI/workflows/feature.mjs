import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createContextBundle } from "./context.mjs";
import { assessEscalation, assertCallBudget, findCopiedApprovedPhase, localPhaseAttempts } from "./escalation.mjs";
import { currentPhase, phases, transition } from "./phases.mjs";
import { runCommand, runProvider } from "./providers.mjs";
import { createState, loadActive, saveState } from "./state.mjs";
import {
	applyPatch,
	collectDiff,
	createImplementationWorktree,
	ensureWorktreeDependencies,
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

function approvedPhaseContext(state) {
	const approved = phases.flatMap((approvedPhase) => {
		if (!state.approvals[approvedPhase.id]) return [];
		const data = state.phaseData?.[approvedPhase.id];
		const result = data?.supervisorResult ?? data?.localResult;
		return result ? [{ phase: approvedPhase.id, result }] : [];
	});
	return approved.length ? JSON.stringify(approved, null, 2) : "(none)";
}

function latestRevisionNote(state, phase) {
	return (
		state.events
			?.toReversed()
			.find((item) => item.type === "revise" && item.phase === phase.id && typeof item.note === "string")?.note ??
		"(none)"
	);
}

export function promptFor(state, phase, localArtifact = "", supervisorMode = "") {
	const reviewOutput =
		phase.id === "review" || phase.id === "final-review" || (localArtifact && supervisorMode !== "repair");
	const outputContract = reviewOutput
		? `Return ONLY one JSON object with this exact shape:
{"score":0,"decision":"pass","findings":[],"reason":""}
decision must be pass, revise, or escalate.`
		: `Return ONLY one JSON object with this exact shape:
{"status":"complete","confidence":0,"claims":[],"evidence":[],"decisions":[],"openQuestions":[],"risks":[],"requestedEscalation":false,"summary":""}
Do not wrap the JSON in Markdown fences and do not include text before or after it.`;
	const repairInstruction =
		supervisorMode === "repair"
			? "The local candidate copied or failed its phase. Replace it with a correct, evidence-based phase result; do not merely review it."
			: "";
	return `You are the ${phase.role} for phase ${phase.id} in a local-first feature workflow.
Read AGENTS.md and the narrowly relevant project guidance available in the current directory.
Stay strictly within the ${phase.id} phase. ${
		phase.implementation
			? "Implement the approved request in this disposable worktree and run narrow validation."
			: `Do not edit repository files and do not claim that implementation has occurred. Complete only ${phase.id} work.`
	}
${repairInstruction}

Feature request:
${state.request}

Approved earlier phase results:
${approvedPhaseContext(state)}

Revision request for this phase:
${latestRevisionNote(state, phase)}

Supervisor artifact to review, when present:
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
			mode: state.pendingEscalation?.mode ?? "review",
			reasons:
				state.pendingEscalation?.reasons?.length > 0
					? state.pendingEscalation.reasons
					: [`configured supervisor gate: ${phase.id}`],
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
	const supervisorMode = needsSupervisor ? (state.pendingEscalation?.mode ?? "review") : "";
	const schemaPath =
		phase.id === "review" || phase.id === "final-review" || (needsSupervisor && supervisorMode !== "repair")
			? reviewSchema
			: phaseSchema;
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
		else await ensureWorktreeDependencies(root, state.worktree.path);
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
		prompt: promptFor(state, phase, localArtifact, supervisorMode),
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
	if (phase.implementation && !state.mock && !phaseData.diff.diff.trim()) {
		delete state.phaseData[phase.id];
		state.pendingEscalation = null;
		state.status = "ready";
		event(state, "revise", {
			note: "The previous implementation produced no file changes. Edit the feature files and leave a non-empty diff.",
			reason: "empty implementation patch",
		});
		await persist(runDirectory, state);
		console.log("Implementation produced no file changes and was rejected. Run next to retry locally.");
		return;
	}
	const copiedPhase = needsSupervisor ? null : findCopiedApprovedPhase(state, phase, run.result);
	const localAttempts = localPhaseAttempts(state, phase);
	const assessment = assessEscalation({
		phase: needsSupervisor ? { ...phase, supervisorGate: false } : phase,
		profile,
		request: state.request,
		result: run.result,
		validationFailures: phaseData.validation?.passed === false ? 1 : 0,
	});
	if (copiedPhase && (phase.supervisorGate || localAttempts >= profile.maxLocalRepairAttempts)) {
		assessment.required = true;
		assessment.reasons.push(`local result duplicates approved ${copiedPhase} output after ${localAttempts} attempts`);
	}
	if (phase.supervisorGate && !needsSupervisor) {
		state.status = "ready";
		state.pendingEscalation = { mode: copiedPhase ? "repair" : "review", reasons: assessment.reasons };
		console.log(`Local ${phase.id} complete; supervisor review is required.`);
	} else if (assessment.required && !needsSupervisor) {
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
			mode: copiedPhase ? "repair" : "review",
			reasons: assessment.reasons,
		};
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
		const mode = args[0] === "repair" ? "repair" : "review";
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
			mode,
			provider: profile.independentReviewer,
			reasons: [
				mode === "repair" ? "user requested independent frontier repair" : "user requested independent frontier review",
			],
		};
		state.status = "awaiting-remote-approval";
		event(state, mode === "repair" ? "independent-repair-requested" : "independent-review-requested", {
			provider: profile.independentReviewer,
		});
		await persist(runDirectory, state);
		console.log(`Claude ${mode} bundle prepared: ${join(context.bundle, "manifest.json")}`);
		console.log("Inspect it, then run: npm run ai:feature -- approve-remote");
		return;
	}
	if (command === "request-codex") {
		const phase = currentPhase(state);
		if (state.status !== "awaiting-approval" || !state.phaseData?.[phase.id]?.localResult) {
			throw new Error("A completed local phase must be awaiting approval before requesting Codex repair");
		}
		assertCallBudget(state, profile, profile.supervisor);
		const context = await createContextBundle({
			maxBytes: profile.maxRemoteContextBytes,
			phase,
			root,
			runDirectory,
			state,
		});
		const copiedPhase = findCopiedApprovedPhase(state, phase, state.phaseData[phase.id].localResult);
		state.pendingEscalation = {
			bundle: context.bundle,
			manifest: context.manifest,
			mode: "repair",
			provider: profile.supervisor,
			reasons: [
				copiedPhase ? `local result duplicates approved ${copiedPhase} output` : "user requested frontier repair",
			],
		};
		state.status = "awaiting-remote-approval";
		event(state, "frontier-repair-requested", { provider: profile.supervisor });
		await persist(runDirectory, state);
		console.log(`Codex repair bundle prepared: ${join(context.bundle, "manifest.json")}`);
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
		await ensureWorktreeDependencies(root, state.worktree.path);
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(`AI feature workflow failed: ${error.message}`);
		process.exitCode = 1;
	});
}
