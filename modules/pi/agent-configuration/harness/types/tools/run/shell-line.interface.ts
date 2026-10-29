/** A shell line reduced to the facts the run policy needs. */
export interface ShellLine {
  /** Words of the first command of every pipeline, with quotes removed. */
  readonly pipelineHeads: readonly (readonly string[])[];
  /** Whether the line contains a here-document, whose body cannot be told apart from commands. */
  readonly hasHeredoc: boolean;
}
