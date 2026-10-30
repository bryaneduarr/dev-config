import { expect, test } from "bun:test";
import { absent, present } from "../roles/resolve-task-role.test-double.ts";
import { readTeamNameRefusal } from "./read-team-name-refusal.service.ts";

test("an unnamed worker and a free name are accepted", () => {
  expect(readTeamNameRefusal(absent, ["fn-a"])).toEqual({ state: "absent" });
  expect(readTeamNameRefusal(present("fn-b"), ["fn-a"])).toEqual({ state: "absent" });
});

test("a name a running worker holds is refused", () => {
  expect(readTeamNameRefusal(present("fn-a"), ["fn-a"]).state).toBe("present");
});

test("the orchestrator name is reserved", () => {
  expect(readTeamNameRefusal(present("orchestrator"), []).state).toBe("present");
});
