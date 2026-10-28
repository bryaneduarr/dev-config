import type { TerminalSettings } from "./terminal-settings.interface.ts";
import type { TerminalStream } from "./terminal-stream.interface.ts";
import type { ReadUsageSnapshot } from "./usage-snapshot.interface.ts";

/** Terminal and data access shared by the once and watch usage runs. */
export interface UsageRuntime {
  /** Reads colors and width of the output terminal, so each render uses the size in effect then. */
  readonly readSettings: () => TerminalSettings;
  /** Stream the usage output is written to. */
  readonly stdout: TerminalStream;
  /** Stream the loading spinner is drawn on. */
  readonly stderr: TerminalStream;
  /** Reads usage for the providers. */
  readonly readSnapshot: ReadUsageSnapshot;
}
