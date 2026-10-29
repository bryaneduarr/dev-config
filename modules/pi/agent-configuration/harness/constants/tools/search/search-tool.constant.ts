export const SEARCH_TOOL_LABEL = "Search";

export const SEARCH_TOOL_DESCRIPTION = [
  "Find filenames, text, symbols, definitions, references, tests, structural matches, or git history.",
  "Pass queries [..] to run several searches in parallel in one call; each result is labelled by its query.",
  "Returns a small, classified result with omitted counts: each match shows its path:line and the matching line. Text queries are regular expressions; invalid patterns fall back to literal matching.",
].join(" ");

export const SEARCH_TOOL_PROMPT_SNIPPET =
  "Locate files, symbols, references, and tests, several queries per call, with bounded output";

export const SEARCH_TOOL_GUIDELINES = [
  "Locate code with search before reading or editing, and put every query you need next into one queries array. In the shell prefer rg and fd to grep and find: they are faster and respect .gitignore. A match line is a snippet: when a value is built from other names (a constant that lists other constants, an import alias), read the file or search those names before you state it.",
] as const;
