import { isRecord } from "../../values/is-record.service.ts";
import { isUnknownArray } from "../../values/is-unknown-array.service.ts";
import { oneLine } from "../text/one-line.service.ts";

function entryPath(entry: unknown): string {
  if (typeof entry === "string") return entry;

  return isRecord(entry) && typeof entry.path === "string" ? entry.path : "";
}

export function readTarget(args: Record<string, unknown>): string {
  const listed = isUnknownArray(args.files) ? args.files.map(entryPath).filter(Boolean) : [];
  const single = typeof args.path === "string" ? [args.path] : [];
  const paths = [...single, ...listed];
  const [first] = paths;
  if (first === undefined) return "";

  return paths.length === 1 ? oneLine(first) : `${oneLine(first)} +${paths.length - 1} more`;
}
