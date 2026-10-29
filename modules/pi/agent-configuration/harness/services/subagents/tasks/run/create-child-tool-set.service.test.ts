import { expect, test } from "bun:test";
import { createChildToolSet } from "./create-child-tool-set.service.ts";

function namesOf(tools: readonly { readonly name: string }[]): readonly string[] {
  return tools.map((tool) => tool.name).sort();
}

test("read, grep, find, and ls become the harness read and search tools plus built-in ls", () => {
  const toolSet = createChildToolSet(["read", "grep", "find", "ls"], []);
  expect(namesOf(toolSet.customTools)).toEqual(["read", "search"]);
  expect([...toolSet.toolNames].sort()).toEqual(["ls", "read", "search"]);
});

test("a single replaced search tool still brings the search tool in only once", () => {
  const toolSet = createChildToolSet(["grep"], []);
  expect(toolSet.customTools.filter((tool) => tool.name === "search")).toHaveLength(1);
  expect(toolSet.toolNames).toEqual(["search"]);
});

test("bash becomes the harness run tool under the name bash", () => {
  const toolSet = createChildToolSet(["bash", "edit", "write"], []);
  expect(namesOf(toolSet.customTools)).toEqual(["bash"]);
  expect([...toolSet.toolNames].sort()).toEqual(["bash", "edit", "write"]);
});

test("the approved command tool is created only when it is requested", () => {
  expect(createChildToolSet(["read"], ["bun test"]).toolNames).toEqual(["read"]);
  const toolSet = createChildToolSet(["read", "approved_command"], ["bun test"]);
  expect([...toolSet.toolNames].sort()).toEqual(["approved_command", "read"]);
});

test("an empty request yields an empty tool set", () => {
  expect(createChildToolSet([], [])).toEqual({ toolNames: [], customTools: [] });
});
