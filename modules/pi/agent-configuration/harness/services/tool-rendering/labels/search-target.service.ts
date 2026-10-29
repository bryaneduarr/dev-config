import { isUnknownArray } from "../../values/is-unknown-array.service.ts";
import { oneLine } from "../text/one-line.service.ts";

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function searchTarget(args: Record<string, unknown>): string {
  const listed = isUnknownArray(args.queries) ? args.queries.map(textOf).filter(Boolean) : [];
  const queries = [textOf(args.query), ...listed].filter(Boolean);
  const [first] = queries;
  if (first === undefined) return "";

  const kind = textOf(args.kind);
  const more = queries.length > 1 ? ` +${queries.length - 1} more` : "";
  const kindLabel = kind && kind !== "auto" ? ` (${kind})` : "";
  return `${oneLine(first)}${more}${kindLabel}`;
}
