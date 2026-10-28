/** Standard input reduced to what the quit listener reads and restores. */
export interface KeyInput {
  /** Whether standard input is an interactive terminal, the only case where raw mode applies. */
  readonly isTTY: boolean;
  /** Turns raw mode on or off, so each key arrives without waiting for Enter. */
  setRawMode(enabled: boolean): void;
  /** Decodes incoming bytes as text. */
  setEncoding(encoding: "utf8"): void;
  /** Adds a listener for chunks of key input. */
  on(event: "data", listener: (chunk: string) => void): void;
  /** Removes a listener added with `on`. */
  off(event: "data", listener: (chunk: string) => void): void;
  /** Starts delivering key input to listeners. */
  resume(): void;
  /** Stops delivering key input so the process can exit. */
  pause(): void;
}
