import type { KeyInput } from "./key-input.interface.ts";
import type { SignalSource } from "./signal-source.interface.ts";

/** Inputs the quit listener watches for a quit request. */
export interface QuitListenerInput {
  /** Key input that carries the q and Ctrl-C keys. */
  readonly keys: KeyInput;
  /** Source of quit signals such as SIGINT, SIGTERM, and SIGHUP. */
  readonly signals: SignalSource;
}
