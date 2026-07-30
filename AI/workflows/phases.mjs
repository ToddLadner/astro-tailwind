export const phases = [
	{ id: "discovery", role: "discovery", provider: "worker" },
	{ id: "planning", role: "planner", provider: "worker" },
	{ id: "ux", role: "ux-critic", provider: "worker" },
	{ id: "architecture", role: "architect", provider: "worker", supervisorGate: true },
	{ id: "engineering-plan", role: "engineer", provider: "worker" },
	{ id: "implementation", role: "engineer", provider: "worker", implementation: true },
	{ id: "review", role: "reviewer", provider: "localJudge" },
	{ id: "qa", role: "qa", provider: "worker" },
	{ id: "final-review", role: "reviewer", provider: "localJudge", supervisorGate: true },
	{ id: "handoff", role: "documentation", provider: "worker" },
];

export function currentPhase(state) {
	return phases[state.phaseIndex] ?? null;
}

export function transition(state, action) {
	if (action === "stop") return { ...state, status: "stopped" };
	if (action === "revise") {
		if (!["awaiting-approval", "awaiting-remote-approval", "blocked"].includes(state.status)) {
			throw new Error(`Cannot revise while status is ${state.status}`);
		}
		return { ...state, status: "ready" };
	}
	if (action === "approve-remote") {
		if (state.status !== "awaiting-remote-approval") {
			throw new Error(`No remote transmission is awaiting approval`);
		}
		return {
			...state,
			approvals: { ...state.approvals, [`remote:${currentPhase(state).id}`]: true },
			status: "ready",
		};
	}
	if (action === "approve") {
		if (state.status !== "awaiting-approval") {
			throw new Error(`Cannot approve while status is ${state.status}`);
		}
		const approvals = { ...state.approvals, [currentPhase(state).id]: true };
		const nextIndex = state.phaseIndex + 1;
		return {
			...state,
			approvals,
			phaseIndex: nextIndex,
			status: nextIndex >= phases.length ? "complete" : "ready",
		};
	}
	throw new Error(`Unknown transition: ${action}`);
}
