/** Output stream the CLI writes to, reduced to what terminal decisions and drawing read. */
export interface TerminalStream {
  /** Whether the stream is attached to an interactive terminal. */
  readonly isTTY: boolean;
  /** Width in columns; a stream that is not a terminal reports no width at runtime. */
  readonly columns: number;
  /** Writes text to the stream. */
  write(text: string): void;
}
