/** Settings shared by every card drawn in one render. */
export interface CardRenderOptions {
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
  /** Columns between a card's padding on each side, where its content is fitted. */
  readonly innerWidth: number;
  /** Moment reset countdowns are measured from. */
  readonly now: Date;
}
