export const READ_TOOL_LABEL = "Read";

export const READ_TOOL_DESCRIPTION = [
  "Read bounded slices of source files with line numbers: one file by path, or several in one call with files [{path, offset, limit, symbol}]. A directory path lists its entries.",
  "Large files return structure and symbols; ask for a symbol or an offset and limit to see the body.",
  "Always put every file you need next into one call instead of reading them one at a time.",
].join(" ");

export const READ_TOOL_PROMPT_SNIPPET = "Read source files, several per call, with bounded output";

export const READ_TOOL_GUIDELINES = [
  "Read files with read rather than cat, head, tail, or sed -n: it numbers lines and bounds output. Pass every file you need next in one files array.",
] as const;
