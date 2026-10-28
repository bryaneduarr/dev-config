import type { ProviderId } from "../usage/provider-usage.interface.ts";

/** Text content of one provider card before it is boxed. */
export interface CardContent {
  /** Provider whose accent color outlines the card. */
  readonly provider: ProviderId;
  /** Plain title text, such as the display name and plan, truncated to fit when drawn. */
  readonly title: string;
  /** Lines shown below the title, already fitted to the inner width. */
  readonly bodyLines: readonly string[];
}
