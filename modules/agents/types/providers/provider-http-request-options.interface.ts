/** Options sent with a provider HTTP GET request. */
export interface ProviderHttpRequestOptions {
  /** Header values keyed by header name. */
  readonly headers: Readonly<Record<string, string>>;
}
