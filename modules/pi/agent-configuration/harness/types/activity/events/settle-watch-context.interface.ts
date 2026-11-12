import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/** The part of a Pi context that tells whether the main agent has nothing left to do. */
export type SettleWatchContext = Pick<ExtensionContext, "isIdle" | "hasPendingMessages">;
