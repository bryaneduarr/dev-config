/** A message a worker addressed to the orchestrator. */
export interface TeamEscalation {
  /** Name of the worker that wrote it. */
  readonly from: string;
  /** Text of the message. */
  readonly message: string;
}

/** Receives messages addressed to the orchestrator. */
export type TeamEscalationSink = (escalation: TeamEscalation) => void;
