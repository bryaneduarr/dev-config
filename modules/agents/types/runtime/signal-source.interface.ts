import type { QUIT_SIGNALS } from "../../constants/runtime/quit-key.constant.ts";

/** Process signal that requests a quit. */
export type QuitSignal = (typeof QUIT_SIGNALS)[number];

/** Process signals reduced to adding and removing quit listeners. */
export interface SignalSource {
  /** Runs the listener when the signal arrives. */
  on(signal: QuitSignal, listener: () => void): void;
  /** Removes a listener added with `on`. */
  off(signal: QuitSignal, listener: () => void): void;
}
