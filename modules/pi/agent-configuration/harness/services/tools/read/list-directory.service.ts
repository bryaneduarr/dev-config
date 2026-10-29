import { readdir } from "node:fs/promises";
import { MAX_DIRECTORY_ENTRIES } from "../../../constants/tools/read/read-limits.constant.ts";

export async function listDirectory(displayPath: string, absolutePath: string): Promise<string> {
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const names = entries
    .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
    .sort((left, right) => left.localeCompare(right));
  const shown = names.slice(0, MAX_DIRECTORY_ENTRIES);
  const omitted = names.length - shown.length;
  const omittedNote = omitted > 0 ? `\n[+${omitted} more entries: search kind=file to find a name]` : "";
  return `${displayPath}/ (${names.length} entries)\n${shown.join("\n")}${omittedNote}`;
}
