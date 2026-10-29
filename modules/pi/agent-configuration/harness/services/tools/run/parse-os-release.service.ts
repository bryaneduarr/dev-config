import {
  OS_RELEASE_DEFAULT_ID,
  OS_RELEASE_DEFAULT_PRETTY_NAME,
} from "../../../constants/tools/run/host-guidance.constant.ts";
import type { HostRelease } from "../../../types/tools/run/host-release.interface.ts";

function unquote(value: string): string {
  const isQuoted = value.length >= 2 && ['"', "'"].some((quote) => value.startsWith(quote) && value.endsWith(quote));
  return isQuoted ? value.slice(1, -1) : value;
}

function readFields(text: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of text.split("\n")) {
    const separator = line.indexOf("=");
    if (separator > 0) fields.set(line.slice(0, separator).trim(), unquote(line.slice(separator + 1).trim()));
  }
  return fields;
}

function fieldOrDefault(fields: Map<string, string>, key: string, fallback: string): string {
  const value = fields.get(key);
  return value === undefined || value === "" ? fallback : value;
}

export function parseOsRelease(text: string): HostRelease {
  const fields = readFields(text);
  return {
    id: fieldOrDefault(fields, "ID", OS_RELEASE_DEFAULT_ID).toLowerCase(),
    prettyName: fieldOrDefault(fields, "PRETTY_NAME", OS_RELEASE_DEFAULT_PRETTY_NAME),
  };
}
