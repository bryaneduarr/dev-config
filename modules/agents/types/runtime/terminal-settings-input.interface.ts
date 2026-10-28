import type { TerminalStream } from "./terminal-stream.interface.ts";

/** Inputs that decide colors and card width for this run. */
export interface TerminalSettingsInput {
  /** Process environment, read for NO_COLOR. */
  readonly environment: typeof process.env;
  /** Stream the usage output is written to. */
  readonly stdout: TerminalStream;
}
