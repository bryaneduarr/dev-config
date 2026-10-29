import { MAX_READ_BATCH_CHARS } from "../../../constants/tools/read/read-limits.constant.ts";

const SECTION_SEPARATOR = "\n\n---\n\n";

function omittedNote(path: string): string {
  return `${path}: omitted because the combined output reached its limit. Read it in its own call, or with offset and limit.`;
}

export function joinReadSections(paths: readonly string[], sections: readonly string[]): string {
  let used = 0;
  const kept = sections.map((section, index) => {
    const fits = index === 0 || used + section.length <= MAX_READ_BATCH_CHARS;
    if (fits) used += section.length;

    return fits ? section : omittedNote(paths[index] ?? "file");
  });
  return kept.join(SECTION_SEPARATOR);
}
