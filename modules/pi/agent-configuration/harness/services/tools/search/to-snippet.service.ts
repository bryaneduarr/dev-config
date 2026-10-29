import { MAX_SNIPPET_CHARS } from "../../../constants/tools/search/search-text.constant.ts";

export function toSnippet(text: string): string {
  const collapsed = text.trim().replace(/\s+/g, " ");
  return collapsed.length > MAX_SNIPPET_CHARS ? `${collapsed.slice(0, MAX_SNIPPET_CHARS)}…` : collapsed;
}
