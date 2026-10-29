import { DEFAULT_READ_LINES } from "../../../constants/tools/read/read-limits.constant.ts";
import type { ReadEntry } from "../../../types/tools/read/read-entry.interface.ts";
import type { ReadSelection } from "../../../types/tools/read/read-request.interface.ts";

export function toReadSelection(entry: ReadEntry): ReadSelection {
  const symbol = entry.symbol;
  if (symbol !== undefined && symbol.trim() !== "") {
    return { kind: "symbol", symbol };
  }
  const isAutomatic = entry.offset === undefined && entry.limit === undefined;
  if (isAutomatic) {
    return { kind: "automatic" };
  }
  return {
    kind: "lines",
    startLine: Math.max(1, entry.offset ?? 1),
    lineCount: Math.max(1, entry.limit ?? DEFAULT_READ_LINES),
  };
}
