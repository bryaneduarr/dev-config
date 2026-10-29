/** One program invocation found in a shell line. */
export interface ProgramCall {
  /** Name of the program that runs. */
  readonly program: string;
  /** Arguments after the program name, with quotes removed. */
  readonly args: readonly string[];
}
