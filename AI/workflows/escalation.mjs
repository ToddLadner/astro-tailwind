const highRiskPattern =
	/\b(auth|authentication|authorization|payment|secret|credential|delete|destructive|security)\b/i;

export function assessEscalation({ phase, profile, request, result, validationFailures = 0 }) {
	const reasons = [];
	const reportedScore = result.score ?? result.confidence;
	if (typeof reportedScore !== "number" || !Number.isFinite(reportedScore)) {
		reasons.push("provider result omitted a numeric score or confidence");
	} else {
		const score = reportedScore > 0 && reportedScore <= 1 ? reportedScore * 100 : reportedScore;
		if (score < profile.scoreThreshold) reasons.push(`score ${score} is below ${profile.scoreThreshold}`);
	}
	if (result.requestedEscalation) reasons.push("provider requested escalation");
	if (validationFailures > 0) reasons.push("validation failed");
	if (highRiskPattern.test(request)) reasons.push("high-risk subject detected");
	if (phase.supervisorGate) reasons.push(`configured supervisor gate: ${phase.id}`);
	return { required: reasons.length > 0, reasons };
}

function resultFingerprint(result) {
	if (!result) return "";
	if ("decision" in result || "findings" in result || "reason" in result || "score" in result) {
		return JSON.stringify({
			kind: "review",
			decision: result.decision ?? "",
			findings: result.findings ?? [],
			reason: result.reason ?? "",
			score: result.score ?? null,
		});
	}
	return JSON.stringify({
		kind: "phase",
		claims: result.claims ?? [],
		decisions: result.decisions ?? [],
		evidence: result.evidence ?? [],
		openQuestions: result.openQuestions ?? [],
		risks: result.risks ?? [],
		summary: result.summary ?? "",
	});
}

export function findCopiedApprovedPhase(state, phase, result) {
	const fingerprint = resultFingerprint(result);
	if (!fingerprint) return null;
	for (const [phaseId, approved] of Object.entries(state.approvals ?? {})) {
		if (!approved || phaseId.startsWith("remote:") || phaseId === phase.id) continue;
		const data = state.phaseData?.[phaseId];
		const approvedResult = data?.supervisorResult ?? data?.localResult;
		if (resultFingerprint(approvedResult) === fingerprint) return phaseId;
	}
	return null;
}

export function localPhaseAttempts(state, phase, providers = ["lmstudio", "ollama"]) {
	return (state.events ?? []).filter(
		(item) => item.type === "phase-started" && item.phase === phase.id && providers.includes(item.provider),
	).length;
}

export function assertCallBudget(state, profile, provider) {
	if (provider === "codex" && state.callCounts.codex >= profile.maxCodexCalls) {
		throw new Error(`Codex call budget exhausted (${profile.maxCodexCalls})`);
	}
	if (provider === "claude" && state.callCounts.claude >= profile.maxClaudeCalls) {
		throw new Error(`Claude call budget exhausted (${profile.maxClaudeCalls})`);
	}
}
