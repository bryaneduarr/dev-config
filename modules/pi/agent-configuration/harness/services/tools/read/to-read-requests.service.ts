import type { ReadEntry } from "../../../types/tools/read/read-entry.interface.ts";
import type { ReadParameters } from "../../../types/tools/read/read-parameters.interface.ts";
import type { ReadRequest } from "../../../types/tools/read/read-request.interface.ts";
import { toReadSelection } from "./to-read-selection.service.ts";

function singleEntry(parameters: ReadParameters): readonly ReadEntry[] {
  const { path, offset, limit, symbol } = parameters;
  if (path === undefined) return [];

  return [
    {
      path,
      ...(offset === undefined ? {} : { offset }),
      ...(limit === undefined ? {} : { limit }),
      ...(symbol === undefined ? {} : { symbol }),
    },
  ];
}

function listedEntries(parameters: ReadParameters): readonly ReadEntry[] {
  return (parameters.files ?? []).map((file) => (typeof file === "string" ? { path: file } : file));
}

export function toReadRequests(parameters: ReadParameters, cwd: string): readonly ReadRequest[] {
  return [...singleEntry(parameters), ...listedEntries(parameters)]
    .filter((entry) => entry.path.trim() !== "")
    .map((entry) => ({ cwd, path: entry.path, selection: toReadSelection(entry) }));
}
