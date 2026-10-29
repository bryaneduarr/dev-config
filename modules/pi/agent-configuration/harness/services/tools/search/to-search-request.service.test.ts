import { expect, test } from "bun:test";
import { createBackendExecutor } from "../backends/call-backend-tool.test-double.ts";
import { toSearchRequest } from "./to-search-request.service.ts";
import { toSearchRequests } from "./to-search-requests.service.ts";

const environment = {
  cwd: "/tmp/project",
  backend: createBackendExecutor({}),
  cancellation: { kind: "uncancellable" },
} as const;

test("applies the default strategy, workspace scope, and limit", () => {
  const request = toSearchRequest("login", {}, environment);
  expect(request.kind).toBe("auto");
  expect(request.scope).toEqual({ kind: "workspace" });
  expect(request.limit).toBe(20);
});

test("keeps the requested strategy, path scope, and limit", () => {
  const request = toSearchRequest("login", { kind: "file", path: "src", limit: 5 }, environment);
  expect(request.kind).toBe("file");
  expect(request.scope).toEqual({ kind: "path", path: "src" });
  expect(request.limit).toBe(5);
});

test("merges query and queries, trims, drops blanks, and removes duplicates", () => {
  const requests = toSearchRequests(
    { query: " login ", queries: ["login", "", "logout", " token"], kind: "text" },
    environment,
  );
  expect(requests.map((request) => request.query)).toEqual(["login", "logout", "token"]);
  expect(requests.every((request) => request.kind === "text")).toBe(true);
});

test("no query at all yields no request", () => {
  expect(toSearchRequests({ queries: ["  "] }, environment)).toEqual([]);
  expect(toSearchRequests({}, environment)).toEqual([]);
});
