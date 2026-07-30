import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const projectContext = [
	"AGENTS.md",
	"AI/projects/astro-tailwind/project.md",
	"AI/projects/astro-tailwind/architecture.md",
	"AI/projects/astro-tailwind/design-system.md",
	"AI/projects/astro-tailwind/known-issues.md",
];

export async function createContextBundle({ maxBytes, phase, root, runDirectory, state }) {
	const bundle = join(runDirectory, "context", phase.id);
	await rm(bundle, { force: true, recursive: true });
	await mkdir(join(bundle, "relevant-files"), { recursive: true });
	await writeFile(join(bundle, "request.md"), `# Request\n\n${state.request}\n`);
	const manifest = { createdAt: new Date().toISOString(), files: [], phase: phase.id, provider: "remote-supervisor" };
	let bytes = Buffer.byteLength(state.request);
	for (const relative of projectContext) {
		const source = join(root, relative);
		const size = (await stat(source)).size;
		if (bytes + size > maxBytes) break;
		const destination = join(bundle, "relevant-files", basename(relative));
		await copyFile(source, destination);
		manifest.files.push({ bytes: size, path: relative, reason: "approved project context" });
		bytes += size;
	}
	const rolePath = `AI/agents/${phase.role}.md`;
	try {
		const size = (await stat(join(root, rolePath))).size;
		if (bytes + size <= maxBytes) {
			await copyFile(join(root, rolePath), join(bundle, "relevant-files", `${phase.role}.md`));
			manifest.files.push({ bytes: size, path: rolePath, reason: "active specialist contract" });
			bytes += size;
		}
	} catch {
		// A phase may use a workflow-only role.
	}
	const ledgerPath = join(runDirectory, "ledger.md");
	try {
		const ledger = await readFile(ledgerPath, "utf8");
		if (bytes + Buffer.byteLength(ledger) <= maxBytes) {
			await writeFile(join(bundle, "approved-decisions.md"), ledger);
			manifest.files.push({ bytes: Buffer.byteLength(ledger), path: "ledger.md", reason: "workflow decisions" });
			bytes += Buffer.byteLength(ledger);
		}
	} catch {
		// The first phase may not have a ledger yet.
	}
	for (const artifact of ["implementation.patch", "validation.json", "browser-validation.json"]) {
		try {
			const source = join(runDirectory, "artifacts", artifact);
			const size = (await stat(source)).size;
			if (bytes + size <= maxBytes) {
				await copyFile(source, join(bundle, artifact));
				manifest.files.push({ bytes: size, path: `artifacts/${artifact}`, reason: "implementation evidence" });
				bytes += size;
			}
		} catch {
			// Architecture reviews occur before implementation artifacts exist.
		}
	}
	manifest.totalBytes = bytes;
	await writeFile(join(bundle, "manifest.json"), JSON.stringify(manifest, null, 2));
	return { bundle, manifest };
}
