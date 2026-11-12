import type { ThemeColor } from "@earendil-works/pi-coding-agent";

/** What a tool box shows at one moment: its title, body lines, and color. */
export interface ToolBoxFrame {
  /** Title shown in the top border of the box. */
  readonly title: string;
  /** Body lines shown inside the box. */
  readonly lines: readonly string[];
  /** Color of the border and text. */
  readonly color: ThemeColor;
}
