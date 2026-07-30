import { createReadStream } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "../..");
const resultsDirectory = join(root, "AI/evals/results");
const runsDirectory = join(resultsDirectory, "runs");
const workflowRunsDirectory = join(root, "AI/workflows/runs");

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

async function loadRuns() {
	try {
		const directories = (await readdir(runsDirectory)).sort().reverse();
		const runs = [];
		for (const directory of directories) {
			try {
				const summary = JSON.parse(await readFile(join(runsDirectory, directory, "summary.json"), "utf8"));
				runs.push(summary);
			} catch {
				// Ignore incomplete runs.
			}
		}
		return runs;
	} catch {
		return [];
	}
}

async function loadWorkflows() {
	try {
		const directories = (await readdir(workflowRunsDirectory, { withFileTypes: true }))
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort()
			.reverse();
		const workflows = [];
		for (const directory of directories) {
			try {
				workflows.push(JSON.parse(await readFile(join(workflowRunsDirectory, directory, "state.json"), "utf8")));
			} catch {
				// Ignore incomplete workflows.
			}
		}
		return workflows;
	} catch {
		return [];
	}
}

function dashboard(runs, workflows) {
	const latest = runs[0];
	const caseIds = [...new Set(runs.flatMap((run) => run.results.map((result) => result.id)))];
	const trend = runs
		.slice()
		.reverse()
		.map(
			(
				run,
			) => `<a class="bar" href="runs/${encodeURIComponent(run.runId)}/report.html" title="${escapeHtml(run.runId)} · ${run.score}%">
<span style="height:${Math.max(3, run.score)}%"></span><small>${run.score}</small></a>`,
		)
		.join("");
	const cases = caseIds
		.map((id) => {
			const history = runs
				.map((run) => ({ result: run.results.find((result) => result.id === id), run }))
				.filter((entry) => entry.result);
			const current = history[0]?.result;
			const previous = history[1]?.result;
			const delta = previous ? current.score - previous.score : null;
			const failures = current?.assertions.filter((assertion) => !assertion.passed) ?? [];
			return `<article><header><div><small>${escapeHtml(current?.role ?? "unknown")}</small><h2>${escapeHtml(id)}</h2></div>
<strong>${current?.score ?? "—"}%<small>${delta === null ? "new" : `${delta >= 0 ? "+" : ""}${delta}`}</small></strong></header>
${failures.length === 0 ? "<p class=pass>All expectations passed.</p>" : `<ul>${failures.map((failure) => `<li>${escapeHtml(failure.text)}</li>`).join("")}</ul>`}
</article>`;
		})
		.join("");
	const workflowCards = workflows
		.map((workflow) => {
			const phase = workflow.phaseData ? Object.keys(workflow.phaseData).at(-1) : "discovery";
			const calls = Object.entries(workflow.callCounts ?? {})
				.map(([provider, count]) => `${provider} ${count}`)
				.join(" · ");
			const escalation = workflow.pendingEscalation?.reasons?.join("; ");
			return `<article><header><div><small>${escapeHtml(workflow.profile)}</small><h2>${escapeHtml(workflow.request)}</h2></div>
<strong>${escapeHtml(workflow.status)}</strong></header><p>Current: ${escapeHtml(phase ?? "discovery")}</p>
<p>${escapeHtml(calls)}</p>${escalation ? `<ul><li>${escapeHtml(escalation)}</li></ul>` : ""}</article>`;
		})
		.join("");
	return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Local AI Dashboard</title><style>
:root{color-scheme:dark;background:#08090b;color:#f4f4f5;font:15px/1.45 system-ui;--muted:#9ca3af;--line:#27272a}
body{max-width:1200px;margin:auto;padding:48px 24px}h1{font-size:clamp(2.5rem,7vw,5.5rem);line-height:.95;margin:.2em 0}
.hero{display:grid;grid-template-columns:1fr auto;align-items:end;gap:30px}.hero>strong{font-size:6rem}
small{display:block;color:var(--muted);font-weight:500}.trend{height:180px;display:flex;align-items:end;gap:8px;margin:48px 0;border-bottom:1px solid var(--line)}
.bar{height:100%;flex:1;display:flex;align-items:end;position:relative;min-width:16px}.bar span{width:100%;background:linear-gradient(#a78bfa,#6d28d9);border-radius:6px 6px 0 0}
.bar small{position:absolute;inset:auto 0 4px;text-align:center;color:white;font-size:11px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
article{padding:22px;border:1px solid var(--line);border-radius:16px;background:#111216}article header{display:flex;justify-content:space-between;gap:14px}
article h2{margin:.15em 0}article strong{font-size:2rem;text-align:right}article strong small{font-size:.8rem}.pass{color:#86efac}li{color:#fca5a5}
.empty{padding:60px;border:1px dashed var(--line);border-radius:18px;text-align:center;color:var(--muted)}
@media(max-width:600px){.hero{grid-template-columns:1fr}.hero>strong{font-size:4rem}}
</style><body><section class="hero"><div><small>LOCAL AI HISTORY · ${runs.length} RUNS</small><h1>Your agents,<br>getting better.</h1>
<p>${latest ? `${escapeHtml(latest.provider)} · ${escapeHtml(latest.privacyMode)} · ${escapeHtml(latest.createdAt)}` : "Run npm run eval:ai to create the first baseline."}</p></div>
<strong>${latest?.score ?? "—"}%</strong></section>
${workflows.length > 0 ? `<h2>Feature workflows</h2><section class="grid">${workflowCards}</section>` : ""}
<h2>Evaluation history</h2>
${runs.length > 0 ? `<section class="trend">${trend}</section><main class="grid">${cases}</main>` : '<div class="empty">No evaluation runs yet.</div>'}
</body></html>`;
}

async function buildDashboard() {
	const runs = await loadRuns();
	const workflows = await loadWorkflows();
	const output = join(resultsDirectory, "dashboard.html");
	await writeFile(output, dashboard(runs, workflows));
	return { output, runs, workflows };
}

function contentType(path) {
	return (
		{
			".html": "text/html; charset=utf-8",
			".json": "application/json; charset=utf-8",
			".md": "text/markdown; charset=utf-8",
		}[extname(path)] ?? "application/octet-stream"
	);
}

async function main() {
	const buildOnly = process.argv.includes("--build-only");
	const portIndex = process.argv.indexOf("--port");
	const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4177;
	if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("--port must be a valid port");
	const { output, runs, workflows } = await buildDashboard();
	if (buildOnly) {
		console.log(`Built dashboard for ${runs.length} evaluation(s) and ${workflows.length} workflow(s): ${output}`);
		return;
	}
	const server = createServer((request, response) => {
		const requested = request.url === "/" ? "dashboard.html" : decodeURIComponent(request.url.split("?")[0].slice(1));
		const path = normalize(join(resultsDirectory, requested));
		if (!path.startsWith(`${resultsDirectory}/`) && path !== join(resultsDirectory, "dashboard.html")) {
			response.writeHead(403).end("Forbidden");
			return;
		}
		response.setHeader("Content-Type", contentType(path));
		createReadStream(path)
			.on("error", () => response.writeHead(404).end("Not found"))
			.pipe(response);
	});
	server.listen(port, "127.0.0.1", () => {
		console.log(`AI dashboard: http://127.0.0.1:${port}`);
	});
}

main().catch((error) => {
	console.error(`AI dashboard failed: ${error.message}`);
	process.exitCode = 1;
});
