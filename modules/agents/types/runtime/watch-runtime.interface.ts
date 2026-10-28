import type { KeyInput } from "./key-input.interface.ts";
import type { SignalSource } from "./signal-source.interface.ts";
import type { UsageRuntime } from "./usage-runtime.interface.ts";

/** Usage run that keeps refreshing, so it also reads keys and process signals. */
export interface WatchRuntime extends UsageRuntime {
  /** Standard input whose q and Ctrl-C keys stop watching. */
  readonly stdin: KeyInput;
  /** Process signals that stop watching. */
  readonly signals: SignalSource;
  /** Waits between watch refreshes. */
  readonly wait: (milliseconds: number) => Promise<void>;
}
