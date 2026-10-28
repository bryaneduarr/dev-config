import type { FetchProviderUrl } from "./fetch-provider-url.interface.ts";

/** Machine state a provider usage reader depends on, injected so tests never touch real user state. */
export interface ProviderEnvironment {
  /** Home directory that holds the provider's credential folders. */
  readonly homeDirectory: string;
  /** Moment used to judge whether a stored login has expired. */
  readonly now: Date;
  /** Performs HTTP requests to provider usage endpoints. */
  readonly fetchUrl: FetchProviderUrl;
}
