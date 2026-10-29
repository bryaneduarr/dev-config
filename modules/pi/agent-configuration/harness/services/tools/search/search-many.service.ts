import {
  MAX_SEARCH_BATCH_CHARS,
  MIN_SEARCH_SHARE_CHARS,
} from "../../../constants/tools/search/search-limits.constant.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { searchRepo } from "./search-repo.service.ts";

const NO_QUERY_MESSAGE = "No query provided.";

function clampShare(text: string, share: number): string {
  if (text.length <= share) return text;

  return `${text.slice(0, share)}\n[+${text.length - share} chars omitted: narrow the query, path, or limit]`;
}

export async function searchMany(requests: readonly SearchRequest[]): Promise<string> {
  const [only] = requests;
  if (only === undefined) return NO_QUERY_MESSAGE;
  if (requests.length === 1) return searchRepo(only);

  const share = Math.max(MIN_SEARCH_SHARE_CHARS, Math.floor(MAX_SEARCH_BATCH_CHARS / requests.length));
  const sections = await Promise.all(
    requests.map(async (request) => `## ${request.query}\n${clampShare(await searchRepo(request), share)}`),
  );
  return sections.join("\n\n");
}
