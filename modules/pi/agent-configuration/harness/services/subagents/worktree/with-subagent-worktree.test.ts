import { afterAll, beforeAll, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findGitRoot } from "./find-git-root.service.ts";
import { runGit } from "./run-git.service.ts";
import { withSubagentWorktree } from "./with-subagent-worktree.service.ts";

let repo = "";

beforeAll(async () => {
  repo = mkdtempSync(join(tmpdir(), "with-subagent-worktree-"));
  await runGit(repo, ["init", "-q", "-b", "main"]);
  writeFileSync(join(repo, "a.txt"), "base\n");
  await runGit(repo, ["add", "-A"]);
  await runGit(repo, ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-q", "-m", "base"]);
});

afterAll(() => {
  rmSync(repo, { recursive: true, force: true });
});

test("a nested directory finds the repository root and one outside a repository finds none", () => {
  mkdirSync(join(repo, "src", "deep"), { recursive: true });

  expect(findGitRoot(join(repo, "src", "deep"))).toEqual({ state: "present", value: repo });
  expect(findGitRoot(tmpdir()).state).toBe("absent");
});

test("changes made in a checkout are committed to a branch and the checkout is removed", async () => {
  const result = await withSubagentWorktree({
    repoRoot: repo,
    id: "11111111-aaaa",
    title: "first",
    run: async (worktree) => {
      writeFileSync(join(worktree.path, "b.txt"), "from worker\n");
      return worktree.path;
    },
  });

  expect(result.branch).toEqual({ state: "present", value: "subagent/11111111" });
  expect(existsSync(result.outcome)).toBe(false);
  expect((await runGit(repo, ["show", "subagent/11111111:b.txt"])).stdout).toBe("from worker\n");
  expect(existsSync(join(repo, "b.txt"))).toBe(false);
});

test("two checkouts run at the same time without touching each other", async () => {
  const edit = (id: string, content: string) =>
    withSubagentWorktree({
      repoRoot: repo,
      id,
      title: id,
      run: async (worktree) => {
        writeFileSync(join(worktree.path, "a.txt"), content);
        await Promise.resolve();
        return readFileSync(join(worktree.path, "a.txt"), "utf8");
      },
    });

  const [first, second] = await Promise.all([edit("22222222-x", "one\n"), edit("33333333-x", "two\n")]);

  expect([first.outcome, second.outcome]).toEqual(["one\n", "two\n"]);
  expect(readFileSync(join(repo, "a.txt"), "utf8")).toBe("base\n");
});

test("a checkout without changes leaves no branch behind", async () => {
  const result = await withSubagentWorktree({ repoRoot: repo, id: "44444444-x", title: "idle", run: async () => 1 });

  expect(result.branch).toEqual({ state: "absent" });
  expect((await runGit(repo, ["branch", "--list", "subagent/44444444"])).stdout.trim()).toBe("");
});

test("a failing operation still removes its checkout and rethrows", async () => {
  let path = "";
  const failing = withSubagentWorktree({
    repoRoot: repo,
    id: "55555555-x",
    title: "fail",
    run: async (worktree) => {
      path = worktree.path;
      throw new Error("worker crashed");
    },
  });

  await expect(failing).rejects.toThrow("worker crashed");
  expect(existsSync(path)).toBe(false);
});

test("a commit that cannot be made keeps the checkout and its changes and reports the failure", async () => {
  let checkout = "";
  const uncommittable = withSubagentWorktree({
    repoRoot: repo,
    id: "66666666-x",
    title: "locked",
    run: async (worktree) => {
      checkout = worktree.path;
      writeFileSync(join(worktree.path, "c.txt"), "work\n");
      const gitDirectory = (await runGit(worktree.path, ["rev-parse", "--absolute-git-dir"])).stdout.trim();
      writeFileSync(join(gitDirectory, "index.lock"), "");
    },
  });

  await expect(uncommittable).rejects.toThrow("remain uncommitted");
  expect(readFileSync(join(checkout, "c.txt"), "utf8")).toBe("work\n");
  rmSync(checkout, { recursive: true, force: true });
});
