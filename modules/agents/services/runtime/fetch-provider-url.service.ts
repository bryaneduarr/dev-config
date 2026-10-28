import { PROVIDER_REQUEST_TIMEOUT_MILLISECONDS } from "../../constants/providers/provider-http.constant.ts";
import type { ProviderHttpRequestOptions } from "../../types/providers/provider-http-request-options.interface.ts";
import type { ProviderHttpResponse } from "../../types/providers/provider-http-response.interface.ts";

export async function fetchProviderUrl(
  url: string,
  options: ProviderHttpRequestOptions,
): Promise<ProviderHttpResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: options.headers,
    signal: AbortSignal.timeout(PROVIDER_REQUEST_TIMEOUT_MILLISECONDS),
  });
  return { status: response.status, json: () => response.json() };
}
