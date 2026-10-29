import type { ShellLine } from "../../../types/tools/run/shell-line.interface.ts";

const CHUNK_PATTERN = /(?:'[^']*'|"(?:\\.|[^"\\])*"|\\.|[<>]&\d*-?|&>>?|[^'"\\;&|\n])+|&&|\|\||[;&|\n]/gs;
const WORD_PATTERN = /(?:'[^']*'|"(?:\\.|[^"\\])*"|\\.|[^\s'"\\])+/g;
const HEREDOC_PATTERN = /<<-?\s*['"\\]?[A-Za-z_]/;
const PIPE = "|";
const OPERATORS = new Set(["&&", "||", ";", "&", "\n"]);

function stripShellQuotes(word: string): string {
  const quote = word.charAt(0);
  const isWrapped =
    (quote === "'" || quote === '"') && word.length >= 2 && word.endsWith(quote) && !word.slice(1, -1).includes(quote);
  if (isWrapped) return word.slice(1, -1);

  return word.replace(/\\(.)/gs, "$1").replace(/['"]/g, "");
}

export function parseShellLine(line: string): ShellLine {
  const pipelineHeads: string[][] = [];
  let startsPipeline = true;

  for (const match of line.matchAll(CHUNK_PATTERN)) {
    const chunk = match[0];
    if (chunk === PIPE || OPERATORS.has(chunk)) {
      startsPipeline = chunk !== PIPE;
      continue;
    }
    if (startsPipeline) pipelineHeads.push((chunk.match(WORD_PATTERN) ?? []).map(stripShellQuotes));
    startsPipeline = false;
  }

  return { pipelineHeads, hasHeredoc: HEREDOC_PATTERN.test(line) };
}
