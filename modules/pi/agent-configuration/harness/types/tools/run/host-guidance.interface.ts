/** Host-specific text the run tool shows to the model. */
export interface HostGuidance {
  /** Sentence added to the tool description that names the host and how to get a missing tool. */
  readonly descriptionNote: string;
  /** Prompt guideline listing the extra tools installed on the host. */
  readonly installedToolsGuideline: string;
  /** Hint added to a failed run whose command is not installed. */
  readonly missingCommandHint: string;
}
