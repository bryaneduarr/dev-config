/** Result of sending a team message. */
export type TeamSendOutcome = { readonly kind: "delivered" } | { readonly kind: "refused"; readonly reason: string };
