import type { ProviderUsage } from "../usage/provider-usage.interface.ts";

/** Usage statuses that show a message on their card instead of limit windows. */
export type MessageUsageStatus = Exclude<ProviderUsage["status"], "ok">;

/** Provider usage read that succeeded and reported limit windows. */
export type OkProviderUsage = Extract<ProviderUsage, { readonly status: "ok" }>;

/** Provider usage read that failed and carries a message for its card. */
export type MessageProviderUsage = Exclude<ProviderUsage, { readonly status: "ok" }>;
