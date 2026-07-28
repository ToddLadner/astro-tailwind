const highRiskPattern =
	/\b(auth|authentication|authorization|payment|secret|credential|delete|destructive|security)\b/i;

export function assessEscalation({ phase, profile, request, result, validationFailures = 0 }) {
	const reasons = [];
	const score = result.score ?? result.confidence ?? 0;
	if (score < profile.scoreThreshold) reasons.push(`score ${score} is below ${profile.scoreThreshold}`);
	if (result.requestedEscalation) reasons.push("provider requested escalation");
	if (validationFailures >= profile.maxLocalRepairAttempts) reasons.push("local repair limit reached");
	if (highRiskPattern.test(request)) reasons.push("high-risk subject detected");
	if (phase.supervisorGate) reasons.push(`configured supervisor gate: ${phase.id}`);
	return { required: reasons.length > 0, reasons };
}

export function assertCallBudget(state, profile, provider) {
	if (provider === "codex" && state.callCounts.codex >= profile.maxCodexCalls) {
		throw new Error(`Codex call budget exhausted (${profile.maxCodexCalls})`);
	}
	if (provider === "claude" && state.callCounts.claude >= profile.maxClaudeCalls) {
		throw new Error(`Claude call budget exhausted (${profile.maxClaudeCalls})`);
	}
}
