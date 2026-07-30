import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "../..");
const casesDirectory = join(root, "AI/evals/cases");
const calibrationDirectory = join(root, "AI/evals/calibration");
const runsDirectory = join(root, "AI/evals/results/runs");

function parseArguments(argv) {
	const options = {
		cases: [],
		compare: true,
		calibrate: false,
		dryRun: false,
		jobs: 1,
		judgeModel: undefined,
		judgeProvider: undefined,
		model: undefined,
		provider: "codex",
	};
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--case") options.cases.push(argv[++index]);
		else if (argument === "--model") options.model = argv[++index];
		else if (argument === "--judge-model") options.judgeModel = argv[++index];
		else if (argument === "--judge-provider") options.judgeProvider = argv[++index];
		else if (argument === "--provider") options.provider = argv[++index];
		else if (argument === "--jobs") options.jobs = Number(argv[++index]);
		else if (argument === "--calibrate") options.calibrate = true;
		else if (argument === "--no-compare") options.compare = false;
		else if (argument === "--dry-run") options.dryRun = true;
		else if (argument === "--help") options.help = true;
		else throw new Error(`Unknown option: ${argument}`);
	}
	if (!Number.isInteger(options.jobs) || options.jobs < 1 || options.jobs > 8) {
		throw new Error("--jobs must be an integer from 1 to 8");
	}
	if (options.cases.some((value) => !value)) throw new Error("--case requires an id");
	for (const [label, provider] of [
		["--provider", options.provider],
		["--judge-provider", options.judgeProvider],
	]) {
		if (provider && !["claude", "codex", "ollama", "lmstudio"].includes(provider)) {
			throw new Error(`${label} must be claude, codex, ollama, or lmstudio`);
		}
	}
	return options;
}

function parseCase(content, filename) {
	const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
	if (!frontmatter) throw new Error(`${filename} has invalid frontmatter`);
	const metadata = Object.fromEntries(
		frontmatter[1]
			.split("\n")
			.map((line) => line.match(/^([a-z_]+):\s*(.+)$/))
			.filter(Boolean)
			.map((match) => [match[1], match[2]]),
	);
	const section = (heading) => {
		const marker = `## ${heading}\n\n`;
		const start = content.indexOf(marker);
		if (start < 0) return "";
		const remainder = content.slice(start + marker.length);
		const nextHeading = remainder.indexOf("\n## ");
		return (nextHeading < 0 ? remainder : remainder.slice(0, nextHeading)).trim();
	};
	const assertions = (heading, kind) =>
		section(heading)
			.split("\n")
			.filter((line) => /^- \[[ x]\] /.test(line))
			.map((line, index) => ({
				id: `${kind}-${index + 1}`,
				kind,
				text: line.replace(/^- \[[ x]\] /, ""),
			}));
	return {
		...metadata,
		assertions: [...assertions("Required behavior", "required"), ...assertions("Prohibited behavior", "prohibited")],
		evidence: section("Evidence"),
		filename,
		scenario: section("Scenario"),
	};
}

async function loadCases(selectedIds) {
	const filenames = (await readdir(casesDirectory)).filter((file) => file.endsWith(".md")).sort();
	const cases = await Promise.all(
		filenames.map(async (filename) => parseCase(await readFile(join(casesDirectory, filename), "utf8"), filename)),
	);
	const selected = selectedIds.length > 0 ? cases.filter((item) => selectedIds.includes(item.id)) : cases;
	const missing = selectedIds.filter((id) => !selected.some((item) => item.id === id));
	if (missing.length > 0) throw new Error(`Unknown case id(s): ${missing.join(", ")}`);
	return selected;
}

async function runCalibration(testCases, options, temporaryDirectory) {
	const files = (await readdir(calibrationDirectory)).filter((file) => file.endsWith(".json")).sort();
	let correct = 0;
	let total = 0;
	const results = [];
	for (const file of files) {
		const golden = JSON.parse(await readFile(join(calibrationDirectory, file), "utf8"));
		const testCase = testCases.find((item) => item.id === golden.case);
		if (!testCase) throw new Error(`${file} references unknown case ${golden.case}`);
		process.stdout.write(`→ calibrating judge with ${golden.id}\n`);
		const schemaFile = join(temporaryDirectory, `${golden.id}-schema.json`);
		const outputFile = join(temporaryDirectory, `${golden.id}-judgment.json`);
		await writeFile(schemaFile, JSON.stringify(judgeSchema(testCase), null, 2));
		const run = await runModel({
			model: options.judgeModel ?? options.model,
			output: outputFile,
			prompt: judgePrompt(testCase, golden.response),
			provider: options.judgeProvider ?? options.provider,
			schema: judgeSchema(testCase),
		});
		if (run.code !== 0) throw new Error(`${golden.id} calibration failed: ${run.stderr.trim()}`);
		const judgment = JSON.parse(await readFile(outputFile, "utf8"));
		validateJudgment(testCase, judgment);
		const actual = Object.fromEntries(judgment.assertions.map((assertion) => [assertion.id, assertion.passed]));
		const checks = Object.entries(golden.expected).map(([id, expected]) => ({
			actual: actual[id],
			expected,
			id,
			passed: actual[id] === expected,
		}));
		correct += checks.filter((check) => check.passed).length;
		total += checks.length;
		results.push({ checks, id: golden.id });
	}
	const calibration = {
		agreement: total === 0 ? 0 : Math.round((correct / total) * 100),
		createdAt: new Date().toISOString(),
		provider: options.judgeProvider ?? options.provider,
		results,
	};
	await mkdir(join(root, "AI/evals/results"), { recursive: true });
	await writeFile(join(root, "AI/evals/results/calibration-latest.json"), JSON.stringify(calibration, null, 2));
	console.log(`\nJudge calibration: ${calibration.agreement}% (${correct}/${total} expectations)`);
	if (calibration.agreement < 90) process.exitCode = 1;
	return calibration;
}

function runCommand(command, args, input, cwd = root) {
	return new Promise((resolvePromise, reject) => {
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
		child.on("error", reject);
		child.on("close", (code) => {
			resolvePromise({
				code,
				durationMs: Math.round(performance.now() - started),
				stderr,
				stdout,
			});
		});
		child.stdin.end(input);
	});
}

function codexArguments({ model, output, provider, sandbox = "read-only", schema, worktree = root }) {
	const args = [
		"exec",
		"-",
		"--ephemeral",
		"--json",
		"--color",
		"never",
		"--sandbox",
		sandbox,
		"--output-last-message",
		output,
		"-C",
		worktree,
	];
	if (provider !== "codex") args.push("--oss", "--local-provider", provider);
	if (model) args.push("--model", model);
	if (schema) args.push("--output-schema", schema);
	return args;
}

function claudeArguments({ implementation = false, model, schema }) {
	const tools = implementation
		? "Read,Grep,Glob,Edit,Write,Bash(node AI/evals/fixtures/worktree/math.fixture.mjs),Bash(git diff *),Bash(git status *)"
		: "Read,Grep,Glob";
	const args = [
		"-p",
		"--output-format",
		"json",
		"--no-session-persistence",
		"--permission-mode",
		"dontAsk",
		"--allowedTools",
		tools,
	];
	if (model) args.push("--model", model);
	if (schema) args.push("--json-schema", JSON.stringify(schema));
	return args;
}

function parseStructuredResult(payload) {
	if (payload.structured_output) return payload.structured_output;
	if (typeof payload.result !== "string") return payload.result;
	const fenced = payload.result.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
	const candidate = fenced ?? payload.result.slice(payload.result.indexOf("{"), payload.result.lastIndexOf("}") + 1);
	return JSON.parse(candidate);
}

async function runModel({ implementation = false, model, output, prompt, provider, schema, worktree = root }) {
	if (provider === "claude") {
		const run = await runCommand("claude", claudeArguments({ implementation, model, schema }), prompt, worktree);
		if (run.code !== 0) {
			try {
				const payload = JSON.parse(run.stdout);
				return { ...run, stderr: payload.result || run.stderr || "Claude Code failed without a diagnostic." };
			} catch {
				return { ...run, stderr: run.stderr || run.stdout || "Claude Code failed without a diagnostic." };
			}
		}
		try {
			const payload = JSON.parse(run.stdout);
			const result = schema ? parseStructuredResult(payload) : payload.result;
			await writeFile(output, typeof result === "string" ? result : JSON.stringify(result));
			return { ...run, usage: payload.usage ?? null };
		} catch (error) {
			return { ...run, code: 1, stderr: `Could not parse Claude JSON output: ${error.message}` };
		}
	}
	return runCommand(
		"codex",
		codexArguments({
			model,
			output,
			provider,
			sandbox: implementation ? "workspace-write" : "read-only",
			schema: schema ? output.replace(/-judgment\.json$/, "-schema.json") : undefined,
			worktree,
		}),
		prompt,
		worktree,
	);
}

function findUsage(jsonLines) {
	let usage = null;
	for (const line of jsonLines.split("\n")) {
		try {
			const event = JSON.parse(line);
			const candidate = event.usage ?? event.token_usage ?? event.response?.usage;
			if (candidate) usage = candidate;
		} catch {
			// Non-JSON diagnostic output is allowed in the event stream.
		}
	}
	return usage;
}

function agentPrompt(testCase, implementation = false) {
	return `You are evaluating the repository's ${testCase.role} guidance.

Read AGENTS.md, AI/agents/${testCase.role}.md when present, the listed evidence, and only other narrowly relevant
repository instructions. ${implementation ? "Implement the requested change in this disposable worktree and validate it." : "Do not edit files. Respond to the scenario as that role would during real repository work."}
Be concrete about searches, evidence, actions, validation, and any uncertainty.

Scenario:
${testCase.scenario}

Evidence to inspect:
${testCase.evidence}`;
}

async function createWorktree(testCase, temporaryDirectory) {
	const worktree = join(temporaryDirectory, `worktree-${testCase.id}`);
	const added = await runCommand("git", ["worktree", "add", "--detach", worktree, "HEAD"], "");
	if (added.code !== 0) throw new Error(`${testCase.id} worktree setup failed: ${added.stderr.trim()}`);
	return worktree;
}

async function removeWorktree(worktree) {
	await runCommand("git", ["worktree", "remove", "--force", worktree], "");
}

function judgeSchema(testCase) {
	return {
		$schema: "https://json-schema.org/draft/2020-12/schema",
		additionalProperties: false,
		properties: {
			assertions: {
				items: {
					additionalProperties: false,
					properties: {
						evidence: { type: "string" },
						id: { enum: testCase.assertions.map((assertion) => assertion.id) },
						passed: { type: "boolean" },
					},
					required: ["id", "passed", "evidence"],
					type: "object",
				},
				maxItems: testCase.assertions.length,
				minItems: testCase.assertions.length,
				type: "array",
				uniqueItems: true,
			},
			summary: { type: "string" },
		},
		required: ["assertions", "summary"],
		type: "object",
	};
}

function judgePrompt(testCase, response) {
	const assertions = testCase.assertions
		.map((assertion) => `${assertion.id} [${assertion.kind}]: ${assertion.text}`)
		.join("\n");
	const responseSkeleton = {
		assertions: testCase.assertions.map((assertion) => ({
			evidence: "replace with concise evidence",
			id: assertion.id,
			passed: false,
		})),
		summary: "replace with a concise summary",
	};
	return `Act as a strict behavioral evaluation judge. Grade only the response below, not what an ideal agent might
have done. Every assertion must appear exactly once. For a required assertion, passed means the response
demonstrates it. For a prohibited assertion, passed means the response avoids the prohibited behavior. Use a short
quote or precise paraphrase as evidence. Missing or ambiguous behavior fails.

Return only the complete JSON object below with no Markdown. Preserve every array item and exact ID. Replace each
passed value and evidence string with your judgment. Do not omit, combine, reorder, or add assertions.
${JSON.stringify(responseSkeleton)}

Assertions:
${assertions}

Response:
${response}`;
}

function validateJudgment(testCase, judgment) {
	const expectedIds = testCase.assertions.map((assertion) => assertion.id);
	const actualIds = judgment.assertions?.map((assertion) => assertion.id) ?? [];
	const missing = expectedIds.filter((id) => !actualIds.includes(id));
	const unexpected = actualIds.filter((id) => !expectedIds.includes(id));
	const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
	if (missing.length > 0 || unexpected.length > 0 || duplicates.length > 0) {
		throw new Error(
			`incomplete judgment (missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}; duplicates: ${duplicates.join(", ") || "none"})`,
		);
	}
	const malformed = judgment.assertions.filter(
		(assertion) => typeof assertion.passed !== "boolean" || typeof assertion.evidence !== "string",
	);
	if (malformed.length > 0 || typeof judgment.summary !== "string") {
		throw new Error(
			`malformed judgment fields: ${JSON.stringify({
				assertions: malformed,
				summary: judgment.summary,
			})}`,
		);
	}
}

async function evaluateCase(testCase, options, temporaryDirectory) {
	process.stdout.write(`→ ${testCase.id}: running ${testCase.role}\n`);
	const responseFile = join(temporaryDirectory, `${testCase.id}-response.md`);
	const implementation = testCase.mode === "implementation";
	const worktree = implementation ? await createWorktree(testCase, temporaryDirectory) : root;
	let agentRun;
	let response;
	let implementationEvidence = "";
	try {
		agentRun = await runModel({
			implementation,
			model: options.model,
			output: responseFile,
			prompt: agentPrompt(testCase, implementation),
			provider: options.provider,
			worktree,
		});
		if (agentRun.code !== 0) throw new Error(`${testCase.id} agent failed: ${agentRun.stderr.trim()}`);
		response = await readFile(responseFile, "utf8");
		if (implementation) {
			const diff = await runCommand("git", ["diff", "--no-ext-diff", "--"], "", worktree);
			const status = await runCommand("git", ["status", "--short"], "", worktree);
			let validation = { code: null, stderr: "", stdout: "No validation command configured." };
			if (testCase.validation_command) {
				validation = await runCommand("/bin/zsh", ["-lc", testCase.validation_command], "", worktree);
			}
			implementationEvidence = `\n\nImplementation evidence:
Git status:
${status.stdout || "(clean)"}

Diff:
${diff.stdout || "(no diff)"}

Validation command: ${testCase.validation_command ?? "none"}
Validation exit code: ${validation.code}
Validation output:
${validation.stdout}
${validation.stderr}`;
		}
	} finally {
		if (implementation) await removeWorktree(worktree);
	}

	process.stdout.write(`→ ${testCase.id}: judging ${testCase.assertions.length} assertions\n`);
	const schemaFile = join(temporaryDirectory, `${testCase.id}-schema.json`);
	const judgmentFile = join(temporaryDirectory, `${testCase.id}-judgment.json`);
	await writeFile(schemaFile, JSON.stringify(judgeSchema(testCase), null, 2));
	const judgeRun = await runModel({
		model: options.judgeModel ?? options.model,
		output: judgmentFile,
		prompt: judgePrompt(testCase, `${response}${implementationEvidence}`),
		provider: options.judgeProvider ?? options.provider,
		schema: judgeSchema(testCase),
	});
	if (judgeRun.code !== 0) throw new Error(`${testCase.id} judge failed: ${judgeRun.stderr.trim()}`);
	const judgment = JSON.parse(await readFile(judgmentFile, "utf8"));
	validateJudgment(testCase, judgment);
	const byId = new Map(judgment.assertions.map((assertion) => [assertion.id, assertion]));
	const assertions = testCase.assertions.map((assertion) => ({ ...assertion, ...byId.get(assertion.id) }));
	const passed = assertions.filter((assertion) => assertion.passed).length;
	return {
		assertions,
		durationMs: agentRun.durationMs + judgeRun.durationMs,
		id: testCase.id,
		model: options.model ?? "default",
		provider: options.provider,
		passed,
		response,
		role: testCase.role,
		score: Math.round((passed / assertions.length) * 100),
		severity: testCase.severity,
		summary: judgment.summary,
		total: assertions.length,
		usage: {
			agent: agentRun.usage ?? findUsage(agentRun.stdout),
			judge: judgeRun.usage ?? findUsage(judgeRun.stdout),
		},
	};
}

async function mapConcurrent(items, concurrency, callback) {
	const results = new Array(items.length);
	let nextIndex = 0;
	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex++;
			results[index] = await callback(items[index]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
	return results;
}

async function latestBaseline(currentRunId) {
	try {
		const runIds = (await readdir(runsDirectory))
			.filter((entry) => entry !== currentRunId)
			.sort()
			.reverse();
		for (const runId of runIds) {
			try {
				return JSON.parse(await readFile(join(runsDirectory, runId, "summary.json"), "utf8"));
			} catch {
				// Ignore incomplete local runs.
			}
		}
	} catch {
		return null;
	}
	return null;
}

function comparisons(results, baseline) {
	const previous = new Map((baseline?.results ?? []).map((result) => [result.id, result.score]));
	return results.map((result) => ({
		change: previous.has(result.id) ? result.score - previous.get(result.id) : null,
		id: result.id,
	}));
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function totalUsage(usage) {
	if (!usage) return "not reported";
	return escapeHtml(JSON.stringify(usage));
}

function htmlReport(summary) {
	const cards = summary.results
		.map((result) => {
			const comparison = summary.comparisons.find((item) => item.id === result.id);
			const delta =
				comparison.change === null ? "new" : `${comparison.change >= 0 ? "+" : ""}${comparison.change} points`;
			const assertions = result.assertions
				.map(
					(assertion) => `<li class="${assertion.passed ? "pass" : "fail"}">
<strong>${assertion.passed ? "✓" : "✗"} ${escapeHtml(assertion.text)}</strong>
<span>${escapeHtml(assertion.evidence ?? "No evidence supplied")}</span></li>`,
				)
				.join("");
			return `<article>
<header><div><small>${escapeHtml(result.role)} · ${escapeHtml(result.severity)}</small><h2>${escapeHtml(result.id)}</h2></div>
<div class="score">${result.score}%<small>${escapeHtml(delta)}</small></div></header>
<p>${escapeHtml(result.summary)}</p><ul>${assertions}</ul>
<details><summary>Agent response</summary><pre>${escapeHtml(result.response)}</pre></details>
<footer>${(result.durationMs / 1000).toFixed(1)}s · tokens: ${totalUsage(result.usage)}</footer>
</article>`;
		})
		.join("");
	return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>AI Evaluation ${escapeHtml(summary.runId)}</title><style>
:root{color-scheme:dark;background:#09090b;color:#f4f4f5;font:15px/1.5 system-ui;--muted:#a1a1aa;--line:#27272a}
body{max-width:1100px;margin:auto;padding:48px 24px}h1{font-size:clamp(2rem,6vw,4.5rem);margin:.1em 0}
.hero{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin-bottom:40px}.hero strong{font-size:5rem}
.hero small,small,footer{color:var(--muted)}.grid{display:grid;gap:20px}
article{border:1px solid var(--line);border-radius:18px;padding:24px;background:#111113}
header{display:flex;justify-content:space-between;gap:16px}h2{margin:.15em 0}.score{font-size:2.2rem;font-weight:750;text-align:right}
.score small{display:block;font-size:.75rem;font-weight:500}ul{list-style:none;padding:0}.pass,.fail{padding:12px 0;border-top:1px solid var(--line)}
li span{display:block;color:var(--muted);margin-left:22px}.pass strong{color:#86efac}.fail strong{color:#fca5a5}
details{margin:18px 0}pre{white-space:pre-wrap;background:#09090b;padding:16px;border-radius:10px;max-height:420px;overflow:auto}
@media(max-width:600px){.hero{grid-template-columns:1fr}.hero strong{font-size:4rem}}
</style><body><section class="hero"><div><small>LOCAL AI REGRESSION LAB · ${escapeHtml(summary.runId)}</small>
<h1>Behavior, measured.</h1><p>${summary.results.length} cases · ${escapeHtml(summary.privacyMode)} · baseline ${escapeHtml(summary.baselineRunId ?? "none")}</p></div>
<strong>${summary.score}%</strong></section><main class="grid">${cards}</main></body></html>`;
}

function markdownReport(summary) {
	const lines = [
		`# AI Evaluation ${summary.runId}`,
		"",
		`Overall score: **${summary.score}%**`,
		"",
		`Compared with: ${summary.baselineRunId ?? "no prior run"}`,
		"",
		"| Case | Role | Score | Change |",
		"| --- | --- | ---: | ---: |",
	];
	for (const result of summary.results) {
		const comparison = summary.comparisons.find((item) => item.id === result.id);
		const change = comparison.change === null ? "new" : `${comparison.change >= 0 ? "+" : ""}${comparison.change}`;
		lines.push(`| ${result.id} | ${result.role} | ${result.score}% | ${change} |`);
	}
	for (const result of summary.results) {
		lines.push("", `## ${result.id}`, "", result.summary, "");
		for (const assertion of result.assertions) {
			lines.push(
				`- ${assertion.passed ? "✓" : "✗"} ${assertion.text} — ${assertion.evidence ?? "No evidence supplied"}`,
			);
		}
	}
	return `${lines.join("\n")}\n`;
}

function printTerminal(summary) {
	console.log(`\nAI System Score: ${summary.score}%`);
	console.log(`Privacy mode: ${summary.privacyMode}`);
	for (const result of summary.results) {
		const comparison = summary.comparisons.find((item) => item.id === result.id);
		const delta = comparison.change === null ? "new" : `${comparison.change >= 0 ? "+" : ""}${comparison.change}`;
		console.log(
			`${result.score === 100 ? "✓" : "✗"} ${result.id.padEnd(28)} ${String(result.score).padStart(3)}%  ${delta}`,
		);
		for (const assertion of result.assertions.filter((item) => !item.passed)) {
			console.log(`  └─ ${assertion.text}`);
		}
	}
	console.log(`\nReport: ${join(summary.outputDirectory, "report.html")}`);
}

async function main() {
	const options = parseArguments(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: npm run eval:ai -- [--provider claude|codex|ollama|lmstudio] [--judge-provider claude|codex|ollama|lmstudio] [--case ID] [--model MODEL] [--judge-model MODEL] [--jobs 1-8] [--calibrate] [--no-compare] [--dry-run]",
		);
		return;
	}
	const allCases = await loadCases([]);
	const testCases = options.cases.length > 0 ? await loadCases(options.cases) : allCases;
	const judgeProvider = options.judgeProvider ?? options.provider;
	const remoteProviders = new Set(["claude", "codex"]);
	const agentRemote = remoteProviders.has(options.provider);
	const judgeRemote = remoteProviders.has(judgeProvider);
	const privacyMode = agentRemote === judgeRemote ? (agentRemote ? "remote" : "local") : "hybrid";
	if (options.dryRun) {
		console.log(
			`Ready to ${options.calibrate ? "calibrate the judge" : `evaluate ${testCases.length} case(s)`} in ${privacyMode} mode (agent: ${options.provider}, judge: ${judgeProvider}).`,
		);
		if (!options.calibrate) {
			console.log(testCases.map((item) => `${item.id} (${item.assertions.length})`).join(", "));
		}
		return;
	}

	const runId = new Date().toISOString().replaceAll(/[:.]/g, "-");
	const outputDirectory = join(runsDirectory, runId);
	const temporaryDirectory = await mkdtemp(join(tmpdir(), "astro-tailwind-ai-eval-"));
	if (options.calibrate) {
		try {
			await runCalibration(allCases, options, temporaryDirectory);
		} finally {
			await rm(temporaryDirectory, { force: true, recursive: true });
		}
		return;
	}
	await mkdir(outputDirectory, { recursive: true });
	let results;
	try {
		results = await mapConcurrent(testCases, options.jobs, (testCase) =>
			evaluateCase(testCase, options, temporaryDirectory),
		);
	} finally {
		await rm(temporaryDirectory, { force: true, recursive: true });
	}
	const baseline = options.compare ? await latestBaseline(runId) : null;
	const passed = results.reduce((sum, result) => sum + result.passed, 0);
	const total = results.reduce((sum, result) => sum + result.total, 0);
	const summary = {
		baselineRunId: baseline?.runId ?? null,
		comparisons: comparisons(results, baseline),
		createdAt: new Date().toISOString(),
		outputDirectory,
		privacyMode,
		provider: options.provider,
		judgeProvider,
		results,
		runId,
		score: Math.round((passed / total) * 100),
	};
	await writeFile(join(outputDirectory, "summary.json"), JSON.stringify(summary, null, 2));
	await writeFile(join(outputDirectory, "report.md"), markdownReport(summary));
	await writeFile(join(outputDirectory, "report.html"), htmlReport(summary));
	printTerminal(summary);
}

main().catch((error) => {
	console.error(`AI evaluation failed: ${error.message}`);
	process.exitCode = 1;
});
