import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const errors = [];

function walk(directory) {
	const entries = readdirSync(directory, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? walk(path) : [path];
	});
}

function report(message) {
	errors.push(message);
	console.error(`INVALID content: ${message}`);
}

const markdownFiles = ["AI", ".continue"]
	.flatMap((directory) => walk(join(root, directory)))
	.filter((file) => extname(file) === ".md")
	.concat(join(root, "AGENTS.md"), join(root, "README.md"));

for (const file of markdownFiles) {
	const content = readFileSync(file, "utf8");
	const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
	for (const match of content.matchAll(linkPattern)) {
		const rawTarget = match[1].trim().replace(/^<|>$/g, "");
		const target = rawTarget.split("#", 1)[0];
		if (!target || /^(?:[a-z]+:|#|\/)/i.test(rawTarget)) continue;
		const resolvedTarget = resolve(dirname(file), decodeURIComponent(target));
		if (!existsSync(resolvedTarget)) {
			report(`${file.slice(root.length + 1)} links to missing ${target}`);
		}
	}
}

for (const directory of [".continue/prompts", ".continue/rules"]) {
	for (const file of walk(join(root, directory)).filter((path) => extname(path) === ".md")) {
		const content = readFileSync(file, "utf8");
		const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
		if (!frontmatter) {
			report(`${file.slice(root.length + 1)} has incomplete frontmatter`);
			continue;
		}
		for (const field of ["name", "description"]) {
			if (!new RegExp(`^${field}:\\s*\\S.+$`, "m").test(frontmatter[1])) {
				report(`${file.slice(root.length + 1)} is missing a non-empty ${field}`);
			}
		}
	}
}

const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
const knownIssues = readFileSync(join(root, "AI/projects/astro-tailwind/known-issues.md"), "utf8");
if (
	/baseline[^.\n]*(?:failure|failing)/i.test(agents) &&
	!/## Validation Baseline[\s\S]*\| `[^`]+` \| Fail/m.test(knownIssues)
) {
	report("AGENTS.md claims baseline failures without a failing command in known-issues.md");
}

for (const file of walk(join(root, "AI/projects/astro-tailwind")).filter((path) => extname(path) === ".md")) {
	if (!/^#\s+\S/m.test(readFileSync(file, "utf8"))) {
		report(`${file.slice(root.length + 1)} has no top-level heading`);
	}
}

const activeRuleNames = new Map();
for (const file of walk(join(root, ".continue/rules")).filter((path) => extname(path) === ".md")) {
	const content = readFileSync(file, "utf8");
	const name = content
		.match(/^name:\s*(.+)$/m)?.[1]
		.trim()
		.toLowerCase();
	if (!name) continue;
	if (activeRuleNames.has(name)) {
		report(`${file.slice(root.length + 1)} duplicates rule name in ${activeRuleNames.get(name)}`);
	} else {
		activeRuleNames.set(name, file.slice(root.length + 1));
	}
}

for (const file of walk(join(root, "AI/evals/calibration")).filter((path) => extname(path) === ".json")) {
	try {
		const golden = JSON.parse(readFileSync(file, "utf8"));
		if (!golden.id || !golden.case || !golden.response || !golden.expected) {
			report(`${file.slice(root.length + 1)} is missing calibration fields`);
		}
	} catch (error) {
		report(`${file.slice(root.length + 1)} contains invalid JSON: ${error.message}`);
	}
}

for (const file of walk(join(root, "AI/config")).filter((path) => extname(path) === ".json")) {
	try {
		JSON.parse(readFileSync(file, "utf8"));
	} catch (error) {
		report(`${file.slice(root.length + 1)} contains invalid JSON: ${error.message}`);
	}
}

const balancedProfile = JSON.parse(readFileSync(join(root, "AI/config/profiles/balanced-power.json"), "utf8"));
for (const field of [
	"worker",
	"localJudge",
	"supervisor",
	"independentReviewer",
	"scoreThreshold",
	"maxCodexCalls",
	"maxClaudeCalls",
	"maxRemoteContextBytes",
]) {
	if (balancedProfile[field] === undefined) report(`balanced-power profile is missing ${field}`);
}
if (balancedProfile.requireApprovalBeforeRemote !== true) {
	report("balanced-power profile must require approval before remote calls");
}

for (const script of walk(join(root, "AI/tools")).filter((path) => extname(path) === ".sh")) {
	const content = readFileSync(script, "utf8");
	if (content.includes("Not implemented:")) {
		console.warn(`NOTICE stub tool: ${script.slice(root.length + 1)}`);
	}
	if (lstatSync(script).isSymbolicLink()) {
		report(`${script.slice(root.length + 1)} must not be a symbolic link`);
	}
}

if (errors.length > 0) process.exit(1);
