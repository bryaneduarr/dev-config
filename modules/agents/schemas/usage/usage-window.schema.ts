import { z } from "zod";

export const resetsAtSchema = z.iso.datetime();

const windowResetSchema = z.discriminatedUnion("state", [
  z.strictObject({
    /** The window is running and resets at a known moment. */
    state: z.literal("scheduled"),
    /** Moment the window resets, as an ISO 8601 UTC timestamp ending in Z. */
    resetsAt: resetsAtSchema,
  }),
  z.strictObject({
    /** The window has not started, so it has no reset moment yet. */
    state: z.literal("not-started"),
  }),
]);

export const usageWindowSchema = z.strictObject({
  /** Name of the limit as the provider labels it, such as a session or weekly limit. */
  label: z.string().min(1),
  /** Share of the window still available, from 0 when exhausted to 100 when untouched. */
  percentRemaining: z.number().min(0).max(100),
  /** When the window resets, or that it has not started. */
  reset: windowResetSchema,
});
