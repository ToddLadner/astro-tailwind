import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function runCommand(command, args, { cwd, input = "" } = {}) {
	return new Promise((resolve) => {
		const started = performance.now();
		const child = spawn(command, args, { cwd, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", (error) =>
			resolve({ code: null, durationMs: Math.round(performance.now() - started), stderr: error.message, stdout }),
		);
		child.on("close", (code) => resolve({ code, durationMs: Math.round(performance.now() - started), stderr, stdout }));
		child.stdin.end(input);
	});
}

function extractJson(value) {
	const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
	const candidate = fenced ?? value.slice(value.indexOf("{"), value.lastIndexOf("}") + 1);
	return JSON.parse(candidate);
}

function mockResult(phase) {
	if (phase.id === "review" || phase.id === "final-review") {
		return { decision: "pass", findings: [], reason: "Deterministic mock review passed.", score: 96 };
	}
	return {
		claims: [`Mock ${phase.id} completed`],
		confidence: 94,
		decisions: [],
		evidence: ["deterministic fixture"],
		openQuestions: [],
		requestedEscalation: false,
		risks: [],
		status: "complete",
		summary: `Mock result for ${phase.id}.`,
	};
}

async function resolveLocalModel(provider, configuredModel) {
	if (configuredModel) return configuredModel;
	const endpoint = provider === "lmstudio" ? "http://127.0.0.1:1234/v1/models" : "http://127.0.0.1:11434/api/tags";
	try {
		const response = await fetch(endpoint, { signal: AbortSignal.timeout(2000) });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const payload = await response.json();
		const model = provider === "lmstudio" ? payload.data?.[0]?.id : payload.models?.[0]?.name;
		if (!model) throw new Error("no loaded models");
		return model;
	} catch (error) {
		throw new Error(`${provider} model discovery failed at ${endpoint}: ${error.message}`);
	}
}

export async function runProvider({
	cwd,
	mock,
	model,
	outputDirectory = cwd,
	phase,
	prompt,
	provider,
	schemaPath,
	writable = false,
}) {
	if (mock) {
		return { code: 0, durationMs: 1, provider, result: mockResult(phase), usage: null };
	}
	if (provider === "lmstudio" || provider === "ollama") {
		model = await resolveLocalModel(provider, model);
	}
	const output = join(outputDirectory, `.ai-${phase.id}-output.json`);
	if (provider === "claude") {
		const schema = await readFile(schemaPath, "utf8");
		const args = [
			"-p",
			"--output-format",
			"json",
			"--no-session-persistence",
			"--permission-mode",
			"dontAsk",
			"--json-schema",
			schema,
			"--allowedTools",
			writable ? "Read,Grep,Glob,Edit,Write,Bash" : "Read,Grep,Glob",
		];
		if (model) args.push("--model", model);
		const run = await runCommand("claude", args, { cwd, input: prompt });
		if (run.code !== 0) throw new Error(run.stderr || run.stdout);
		const envelope = JSON.parse(run.stdout);
		const result = envelope.structured_output ?? extractJson(envelope.result);
		return { ...run, model, provider, result, usage: envelope.usage ?? null };
	}
	const args = [
		"exec",
		"-",
		"--ephemeral",
		"--color",
		"never",
		"--sandbox",
		writable ? "workspace-write" : "read-only",
		"--output-schema",
		schemaPath,
		"--output-last-message",
		output,
		"-C",
		cwd,
	];
	if (provider === "lmstudio" || provider === "ollama") args.push("--oss", "--local-provider", provider);
	if (model) args.push("--model", model);
	const run = await runCommand("codex", args, { cwd, input: prompt });
	if (run.code !== 0) throw new Error(run.stderr || run.stdout);
	const result = extractJson(await readFile(output, "utf8"));
	await writeFile(output, JSON.stringify(result, null, 2));
	return { ...run, model, provider, result, usage: null };
}
