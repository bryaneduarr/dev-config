import type { ProviderHttpRequestOptions } from "./provider-http-request-options.interface.ts";
import type { ProviderHttpResponse } from "./provider-http-response.interface.ts";

/** Sends a GET request to a provider endpoint; the promise rejects when the network fails. */
export type FetchProviderUrl = (url: string, options: ProviderHttpRequestOptions) => Promise<ProviderHttpResponse>;
