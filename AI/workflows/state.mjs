import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function writeJsonAtomic(path, value) {
	await mkdir(dirname(path), { recursive: true });
	const temporary = `${path}.tmp`;
	await writeFile(temporary, JSON.stringify(value, null, 2));
	await rename(temporary, path);
}

export async function createState(runsDirectory, request, profile, mock = false) {
	const id = new Date().toISOString().replaceAll(/[:.]/g, "-");
	const runDirectory = join(runsDirectory, id);
	const state = {
		approvals: {},
		callCounts: { claude: 0, codex: 0, lmstudio: 0, ollama: 0 },
		createdAt: new Date().toISOString(),
		events: [],
		id,
		mock,
		phaseIndex: 0,
		profile: profile.name,
		request,
		status: "ready",
		updatedAt: new Date().toISOString(),
	};
	await mkdir(join(runDirectory, "artifacts"), { recursive: true });
	await mkdir(join(runDirectory, "context"), { recursive: true });
	await writeJsonAtomic(join(runDirectory, "state.json"), state);
	await writeJsonAtomic(join(runsDirectory, "active.json"), { id });
	return { runDirectory, state };
}

export async function loadActive(runsDirectory) {
	const active = JSON.parse(await readFile(join(runsDirectory, "active.json"), "utf8"));
	const runDirectory = join(runsDirectory, active.id);
	const state = JSON.parse(await readFile(join(runDirectory, "state.json"), "utf8"));
	return { runDirectory, state };
}

export async function saveState(runDirectory, state) {
	state.updatedAt = new Date().toISOString();
	await writeJsonAtomic(join(runDirectory, "state.json"), state);
	await writeFile(
		join(runDirectory, "events.jsonl"),
		`${state.events.map((event) => JSON.stringify(event)).join("\n")}\n`,
	);
}

export async function listRuns(runsDirectory) {
	try {
		return (await readdir(runsDirectory, { withFileTypes: true }))
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort()
			.reverse();
	} catch {
		return [];
	}
}
