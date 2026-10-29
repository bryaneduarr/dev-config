import type {
  CreateAgentSessionOptions,
  DefaultResourceLoader,
  ModelRuntime,
  ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import type { TaskModel } from "../model/task-model.interface.ts";

/** Inputs that create an isolated worker session. */
export interface CreateTaskSessionInput {
  /** Working directory of the worker. */
  readonly cwd: string;
  /** Model the worker runs on. */
  readonly model: TaskModel;
  /** Runtime that provides the model. */
  readonly runtime: ModelRuntime;
  /** Reasoning level the worker runs with. */
  readonly thinkingLevel: NonNullable<CreateAgentSessionOptions["thinkingLevel"]>;
  /** Names of the built-in and custom tools the worker may call. */
  readonly tools: readonly string[];
  /** Extension tools the worker may call. */
  readonly customTools: readonly ToolDefinition[];
  /** Loader of the worker system prompt and skills. */
  readonly resourceLoader: DefaultResourceLoader;
}
