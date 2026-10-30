import type { SubagentWorktree } from "./subagent-worktree.interface.ts";

/** Inputs that run one operation inside a private checkout of a repository. */
export interface WithSubagentWorktreeInput<T> {
  /** Repository to check out. */
  readonly repoRoot: string;
  /** Identifier of the subagent run, which names the checkout. */
  readonly id: string;
  /** Title of the run, used in the commit message. */
  readonly title: string;
  /** Runs the operation in the checkout. */
  readonly run: (worktree: SubagentWorktree) => Promise<T>;
}
