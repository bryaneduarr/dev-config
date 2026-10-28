/** Pending quit request and the cleanup that restores the terminal. */
export interface QuitListener {
  /** Resolves when the user presses q or Ctrl-C, or the process receives a quit signal. */
  readonly quitRequested: Promise<void>;
  /** Restores raw mode and removes every listener this listener added. */
  dispose(): void;
}
