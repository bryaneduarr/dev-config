import type { ModelRuntime } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { ResolveTaskModelInput } from "../../../../types/subagents/tasks/model/resolve-task-model-input.interface.ts";
import type { TaskModel } from "../../../../types/subagents/tasks/model/task-model.interface.ts";

function unknownModelHint(runtime: ModelRuntime, provider: string): string {
  const providerModels = runtime.getModels(provider).map((knownModel) => `${provider}/${knownModel.id}`);
  if (providerModels.length > 0) return `Models for ${provider}: ${providerModels.join(", ")}`;

  const availableProviders = new Set(runtime.getAvailableSnapshot().map((knownModel) => knownModel.provider));
  return `Use provider/model with one of these providers: ${[...availableProviders].join(", ")}`;
}

function requestedModelOrThrow(runtime: ModelRuntime, requestedModel: string): TaskModel {
  const separatorIndex = requestedModel.indexOf("/");
  const hasProvider = separatorIndex !== -1;
  const provider = hasProvider ? requestedModel.slice(0, separatorIndex) : requestedModel;
  const model = runtime.getModel(provider, hasProvider ? requestedModel.slice(separatorIndex + 1) : "");
  if (!model) throw new Error(`Unknown model: ${requestedModel}. ${unknownModelHint(runtime, provider)}`);

  return model;
}

function currentModelOrThrow(currentModel: ValueState<TaskModel>): TaskModel {
  if (currentModel.state === "absent") throw new Error("Unknown model: current model");

  return currentModel.value;
}

export function resolveTaskModel(input: ResolveTaskModelInput): TaskModel {
  const { requestedModel } = input;
  if (requestedModel.state === "absent" || requestedModel.value === "") {
    return currentModelOrThrow(input.currentModel);
  }

  return requestedModelOrThrow(input.runtime, requestedModel.value);
}
