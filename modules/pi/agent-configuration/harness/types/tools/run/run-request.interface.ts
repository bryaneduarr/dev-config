import type { ToolCancellation } from "../process/tool-cancellation.interface.ts";

/** A shell command to run with its working directory, timeout, and cancellation. */
export interface RunRequest {
  /** Session directory; full output is stored under it. */
  readonly cwd: string;
  /** Absolute directory the command starts in. */
  readonly directory: string;
  /** Shell command text. */
  readonly command: string;
  /** Milliseconds before the command is killed. */
  readonly timeoutMs: number;
  /** Hint added to the result when the command or a program in it is not installed. */
  readonly missingCommandHint: string;
  /** Whether the caller can abort the command. */
  readonly cancellation: ToolCancellation;
}
