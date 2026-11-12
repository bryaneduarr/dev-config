import { describe, expect, test } from "bun:test";
import { paneIdentity } from "./pane-identity.service.ts";

const WORKSPACES = ["w1", "wA"];

describe("paneIdentity", () => {
  for (const workspace of WORKSPACES) {
    test(`accepts workspace ${workspace}`, () => {
      const pane = { pane_id: `${workspace}:p2`, tab_id: `${workspace}:t2`, workspace_id: workspace };
      expect(paneIdentity(pane)).toEqual({ pane: pane.pane_id, tab: pane.tab_id, workspace });
    });
  }

  test("rejects a pane from another workspace", () => {
    expect(() => paneIdentity({ pane_id: "wB:p1", tab_id: "wA:t1", workspace_id: "wA" })).toThrow("another workspace");
  });

  test("rejects malformed identifiers", () => {
    expect(() => paneIdentity({ pane_id: "p1", tab_id: "t1", workspace_id: "1" })).toThrow("invalid pane identity");
  });
});
