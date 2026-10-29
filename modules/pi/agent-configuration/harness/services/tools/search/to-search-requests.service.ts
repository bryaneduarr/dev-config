import type { SearchEnvironment } from "../../../types/tools/search/search-environment.interface.ts";
import type { SearchParameters } from "../../../types/tools/search/search-parameters.interface.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { toSearchRequest } from "./to-search-request.service.ts";

export function toSearchRequests(
  parameters: SearchParameters,
  environment: SearchEnvironment,
): readonly SearchRequest[] {
  const single = parameters.query === undefined ? [] : [parameters.query];
  const queries = [...single, ...(parameters.queries ?? [])].map((query) => query.trim()).filter(Boolean);
  return [...new Set(queries)].map((query) => toSearchRequest(query, parameters, environment));
}
