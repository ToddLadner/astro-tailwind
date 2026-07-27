import { spawn } from "node:child_process";
import { access, mkdir, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "../..");

function parseArguments(argv) {
	const options = { connectivity: false, judgeProvider: undefined, provider: "codex" };
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--provider") options.provider = argv[++index];
		else if (argv[index] === "--judge-provider") options.judgeProvider = argv[++index];
		else if (argv[index] === "--connectivity") options.connectivity = true;
		else if (argv[index] === "--help") options.help = true;
		else throw new Error(`Unknown option: ${argv[index]}`);
	}
	for (const provider of [options.provider, options.judgeProvider].filter(Boolean)) {
		if (!["claude", "codex", "ollama", "lmstudio"].includes(provider)) {
			throw new Error("providers must be claude, codex, ollama, or lmstudio");
		}
	}
	return options;
}

function command(commandName, args = []) {
	return new Promise((resolvePromise) => {
		const child = spawn(commandName, args, { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", (error) => resolvePromise({ code: null, error: error.message, stderr, stdout }));
		child.on("close", (code) => resolvePromise({ code, stderr, stdout }));
	});
}

async function localProviderStatus(provider) {
	const endpoint = provider === "ollama" ? "http://127.0.0.1:11434/api/tags" : "http://127.0.0.1:1234/v1/models";
	try {
		const response = await fetch(endpoint, { signal: AbortSignal.timeout(1500) });
		if (!response.ok) return { detail: `${endpoint} returned HTTP ${response.status}`, passed: false };
		const payload = await response.json();
		const count = provider === "ollama" ? (payload.models?.length ?? 0) : (payload.data?.length ?? 0);
		return { detail: `${count} model(s) available at ${endpoint}`, passed: count > 0 };
	} catch (error) {
		return { detail: `${endpoint} unavailable: ${error.message}`, passed: false };
	}
}

function printCheck(check) {
	const icon = check.level === "warn" ? "!" : check.passed ? "✓" : "✗";
	console.log(`${icon} ${check.name}: ${check.detail}`);
}

async function main() {
	const options = parseArguments(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: npm run ai:doctor -- [--provider claude|codex|ollama|lmstudio] [--judge-provider claude|codex|ollama|lmstudio] [--connectivity]",
		);
		return;
	}
	const checks = [];
	const providers = [...new Set([options.provider, options.judgeProvider ?? options.provider])];
	if (providers.some((provider) => provider !== "claude")) {
		const codex = await command("codex", ["--version"]);
		checks.push({
			detail: codex.code === 0 ? codex.stdout.trim() : (codex.error ?? codex.stderr.trim()),
			name: "Codex CLI",
			passed: codex.code === 0,
		});
	}
	if (providers.includes("claude")) {
		const claude = await command("claude", ["--version"]);
		checks.push({
			detail: claude.code === 0 ? claude.stdout.trim() : (claude.error ?? claude.stderr.trim()),
			name: "Claude Code CLI",
			passed: claude.code === 0,
		});
	}
	const git = await command("git", ["rev-parse", "--is-inside-work-tree"]);
	checks.push({ detail: git.stdout.trim() || git.stderr.trim(), name: "Git worktree support", passed: git.code === 0 });
	const status = await command("git", ["status", "--short"]);
	checks.push({
		detail: status.stdout.trim() ? "working tree has changes; implementation evals still use detached HEAD" : "clean",
		level: status.stdout.trim() ? "warn" : undefined,
		name: "Repository state",
		passed: true,
	});
	const schema = await command("bash", ["AI/evals/run.sh", "check"]);
	checks.push({
		detail: schema.code === 0 ? schema.stdout.trim().split("\n").at(-1) : schema.stderr.trim(),
		name: "Evaluation cases",
		passed: schema.code === 0,
	});
	const cases = (await readdir(join(root, "AI/evals/cases"))).filter((file) => file.endsWith(".md"));
	const implementationCases = await Promise.all(
		cases.map(async (file) =>
			(await readFile(join(root, "AI/evals/cases", file), "utf8")).includes("mode: implementation"),
		),
	);
	checks.push({
		detail: `${cases.length} cases (${implementationCases.filter(Boolean).length} implementation)`,
		name: "Evaluation coverage",
		passed: cases.length >= 7 && implementationCases.some(Boolean),
	});
	const results = join(root, "AI/evals/results");
	await mkdir(results, { recursive: true });
	try {
		await access(results, constants.W_OK);
		checks.push({ detail: results, name: "Report directory", passed: true });
	} catch (error) {
		checks.push({ detail: error.message, name: "Report directory", passed: false });
	}
	try {
		const calibration = JSON.parse(await readFile(join(results, "calibration-latest.json"), "utf8"));
		checks.push({
			detail: `${calibration.agreement}% agreement from ${calibration.createdAt}`,
			level: calibration.agreement < 90 ? "warn" : undefined,
			name: "Judge calibration",
			passed: calibration.agreement >= 90,
		});
	} catch {
		checks.push({
			detail: "not run yet; use npm run ai:calibrate",
			level: "warn",
			name: "Judge calibration",
			passed: true,
		});
	}
	if (providers.includes("codex")) {
		const login = await command("codex", ["login", "status"]);
		checks.push({
			detail: login.code === 0 ? login.stdout.trim() : (login.error ?? login.stderr.trim()),
			name: "Codex authentication",
			passed: login.code === 0,
		});
	}
	if (providers.includes("claude")) {
		const auth = await command("claude", ["auth", "status"]);
		let detail = auth.stdout.trim() || auth.stderr.trim();
		try {
			const payload = JSON.parse(auth.stdout);
			detail = payload.loggedIn
				? `${payload.authMethod} via ${payload.apiProvider}`
				: "not logged in; run claude auth login";
		} catch {
			// Preserve the CLI diagnostic when it is not JSON.
		}
		checks.push({
			detail: auth.error ?? detail,
			name: "Claude authentication",
			passed: auth.code === 0 && !detail.startsWith("not logged in"),
		});
	}
	for (const provider of providers.filter((provider) => provider !== "codex" && provider !== "claude")) {
		const local = await localProviderStatus(provider);
		checks.push({ ...local, name: `${provider} provider` });
	}
	const remoteProviders = new Set(["claude", "codex"]);
	const agentRemote = remoteProviders.has(options.provider);
	const judgeRemote = remoteProviders.has(options.judgeProvider ?? options.provider);
	const privacyMode = agentRemote === judgeRemote ? (agentRemote ? "remote" : "local") : "hybrid";
	checks.push({
		detail: `${privacyMode} mode (agent: ${options.provider}, judge: ${options.judgeProvider ?? options.provider})`,
		level: privacyMode === "remote" ? "warn" : undefined,
		name: "Selected privacy",
		passed: true,
	});
	checks.push({
		detail: `${cases.length * 2} model calls for the suite; 3 additional calls for calibration`,
		name: "Estimated work",
		passed: true,
	});

	console.log(`AI Doctor · ${options.provider}/${options.judgeProvider ?? options.provider}\n`);
	for (const check of checks) printCheck(check);
	const failures = checks.filter((check) => !check.passed && check.level !== "warn");
	console.log(failures.length === 0 ? "\nReady." : `\nNot ready: ${failures.length} blocking check(s).`);
	if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
	console.error(`AI doctor failed: ${error.message}`);
	process.exitCode = 1;
});
