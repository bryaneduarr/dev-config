import {
  EXCEPTIONS_HEADING,
  TABLE_HEADER_ROWS,
  TABLE_ROW_PREFIX,
} from "../../constants/boundaries/exceptions-table.constant.ts";

function readCell(cell: string): string {
  return cell.trim().replace(/^`(.*)`$/, "$1");
}

function readCells(line: string): readonly string[] {
  return line.trim().slice(1, -1).split("|").map(readCell);
}

export function parseExceptionsTable(markdown: string): readonly (readonly string[])[] {
  const lines = markdown.split("\n");
  const headingIndex = lines.findIndex((line) => line.trim() === EXCEPTIONS_HEADING);
  if (headingIndex === -1) return [];
  const sectionLines = lines.slice(headingIndex + 1);
  const nextHeadingIndex = sectionLines.findIndex((line) => line.startsWith("#"));
  const section = nextHeadingIndex === -1 ? sectionLines : sectionLines.slice(0, nextHeadingIndex);
  return section
    .filter((line) => line.trim().startsWith(TABLE_ROW_PREFIX))
    .slice(TABLE_HEADER_ROWS)
    .map(readCells);
}
