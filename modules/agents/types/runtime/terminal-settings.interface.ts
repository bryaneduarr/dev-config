/** Display choices derived from the environment and the output terminal. */
export interface TerminalSettings {
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
  /** Card width in terminal columns. */
  readonly width: number;
}
