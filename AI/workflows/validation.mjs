import { access, lstat, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCommand } from "./providers.mjs";

export async function createImplementationWorktree(root, workflowId) {
	const parent = await mkdtemp(join(tmpdir(), "astro-tailwind-feature-"));
	const path = join(parent, workflowId);
	const run = await runCommand("git", ["worktree", "add", "--detach", path, "HEAD"], { cwd: root });
	if (run.code !== 0) throw new Error(`Worktree setup failed: ${run.stderr}`);
	await ensureWorktreeDependencies(root, path);
	return { parent, path };
}

export async function ensureWorktreeDependencies(root, worktree) {
	const source = join(root, "node_modules");
	const destination = join(worktree, "node_modules");
	try {
		await access(source);
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
	try {
		await lstat(destination);
		return true;
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	await symlink(source, destination, "dir");
	return true;
}

export async function collectDiff(worktree) {
	const untracked = await runCommand("git", ["ls-files", "--others", "--exclude-standard", "-z"], { cwd: worktree });
	const untrackedFiles = untracked.stdout.split("\0").filter(Boolean);
	if (untrackedFiles.length > 0) {
		const intent = await runCommand("git", ["add", "--intent-to-add", "--", ...untrackedFiles], { cwd: worktree });
		if (intent.code !== 0) throw new Error(`Could not include new files in patch: ${intent.stderr}`);
	}
	const [status, diff] = await Promise.all([
		runCommand("git", ["status", "--short"], { cwd: worktree }),
		runCommand("git", ["diff", "--no-ext-diff", "--"], { cwd: worktree }),
	]);
	return { diff: diff.stdout, status: status.stdout };
}

export async function validateWorktree(worktree, commands) {
	const results = [];
	for (const command of commands) {
		const run = await runCommand("/bin/zsh", ["-lc", command], { cwd: worktree });
		results.push({ command, exitCode: run.code, stderr: run.stderr, stdout: run.stdout });
	}
	return { passed: results.every((result) => result.exitCode === 0), results };
}

export async function savePatch(worktree, destination) {
	const evidence = await collectDiff(worktree);
	await writeFile(destination, evidence.diff);
	return evidence;
}

export async function applyPatch(root, patchPath) {
	const patch = await readFile(patchPath, "utf8");
	if (!patch.trim()) throw new Error("No implementation patch is available");
	const check = await runCommand("git", ["apply", "--check", patchPath], { cwd: root });
	if (check.code !== 0) throw new Error(`Patch conflicts with the main worktree: ${check.stderr}`);
	const apply = await runCommand("git", ["apply", patchPath], { cwd: root });
	if (apply.code !== 0) throw new Error(`Patch application failed: ${apply.stderr}`);
}

export async function removeImplementationWorktree(root, worktree) {
	if (!worktree?.path) return;
	await runCommand("git", ["worktree", "remove", "--force", worktree.path], { cwd: root });
	await rm(worktree.parent, { force: true, recursive: true });
}
