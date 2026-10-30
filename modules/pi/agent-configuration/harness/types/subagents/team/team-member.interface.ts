/** A running worker that teammates can message. */
export interface TeamMember {
  /** Identifier of the worker's run. */
  readonly runId: string;
  /** Name the orchestrator gave the worker. */
  readonly name: string;
  /** Names of the teammates the orchestrator linked the worker to. */
  readonly talksTo: readonly string[];
  /** Puts text in front of the worker before its next step. */
  readonly deliver: (text: string) => Promise<void>;
}
