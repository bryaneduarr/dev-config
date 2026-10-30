import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { absent, present } from "../../roles/resolve-task-role.test-double.ts";
import { resolveTaskCwd } from "./resolve-task-cwd.service.ts";

let base = "";

beforeAll(() => {
  base = mkdtempSync(join(tmpdir(), "resolve-task-cwd-"));
  mkdirSync(join(base, "project"));
  writeFileSync(join(base, "notes.txt"), "text");
});

afterAll(() => {
  rmSync(base, { recursive: true, force: true });
});

test("an omitted cwd keeps the current directory", async () => {
  expect(await resolveTaskCwd(base, absent)).toEqual({ state: "valid", path: base });
});

test("a relative cwd resolves against the current directory", async () => {
  expect(await resolveTaskCwd(base, present("project"))).toEqual({ state: "valid", path: join(base, "project") });
});

test("an absolute cwd is used as given", async () => {
  const project = join(base, "project");

  expect(await resolveTaskCwd("/", present(project))).toEqual({ state: "valid", path: project });
});

test("a missing directory and a plain file are both refused", async () => {
  expect((await resolveTaskCwd(base, present("missing"))).state).toBe("invalid");
  expect((await resolveTaskCwd(base, present("notes.txt"))).state).toBe("invalid");
});

test("a path below a plain file is refused instead of throwing", async () => {
  expect((await resolveTaskCwd(base, present("notes.txt/inside"))).state).toBe("invalid");
});
