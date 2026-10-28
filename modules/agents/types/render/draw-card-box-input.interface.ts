import type { CardContent } from "./card-content.interface.ts";
import type { CardRenderOptions } from "./card-render-options.interface.ts";

/** Inputs for drawing the border around one card's content. */
export interface DrawCardBoxInput {
  /** Content drawn inside the card. */
  readonly content: CardContent;
  /** Shared settings that set the card width and whether color is written. */
  readonly options: CardRenderOptions;
}
