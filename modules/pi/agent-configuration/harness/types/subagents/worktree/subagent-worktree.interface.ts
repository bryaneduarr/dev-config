/** A private checkout created for one subagent run. */
export interface SubagentWorktree {
  /** Repository the checkout belongs to. */
  readonly repoRoot: string;
  /** Directory of the checkout. */
  readonly path: string;
  /** Branch the checkout is on. */
  readonly branch: string;
}
