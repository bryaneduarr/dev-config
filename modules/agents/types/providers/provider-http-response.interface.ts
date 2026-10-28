/** Response to a provider HTTP request, reduced to what the usage readers need. */
export interface ProviderHttpResponse {
  /** HTTP status code the provider answered with. */
  readonly status: number;
  /** Reads the body as parsed JSON, which must be validated by a schema before use. */
  readonly json: () => Promise<unknown>;
}
