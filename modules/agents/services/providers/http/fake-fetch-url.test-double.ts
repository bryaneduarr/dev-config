import type { FetchProviderUrl } from "../../../types/providers/fetch-provider-url.interface.ts";
import type { ProviderHttpRequestOptions } from "../../../types/providers/provider-http-request-options.interface.ts";

/** Request captured by a fake fetch so tests can assert what was sent. */
interface RecordedRequest {
  /** Full URL the request was sent to. */
  readonly url: string;
  /** Headers and other options the request carried. */
  readonly options: ProviderHttpRequestOptions;
}

export function createFakeFetch<Body>(status: number, body: Body) {
  const requests: RecordedRequest[] = [];
  const fetchUrl: FetchProviderUrl = async (url, options) => {
    requests.push({ url, options });
    return { status, json: async () => body };
  };
  return { fetchUrl, requests };
}
