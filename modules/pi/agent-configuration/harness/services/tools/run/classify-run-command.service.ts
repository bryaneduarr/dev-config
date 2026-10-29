import {
  COMMAND_PREFIXES,
  MAX_WRAPPER_DEPTH,
  WRAPPER_SHELLS,
} from "../../../constants/tools/run/run-policy.constant.ts";
import type { ProgramCall } from "../../../types/tools/run/program-call.interface.ts";
import type { RunPolicyVerdict } from "../../../types/tools/run/run-policy-verdict.interface.ts";
import { checkShellProgram } from "./check-shell-program.service.ts";
import { isExplorationProgram } from "./is-exploration-program.service.ts";
import { parseShellLine } from "./parse-shell-line.service.ts";

const ALLOWED: RunPolicyVerdict = { verdict: "allowed" };
const HEREDOC_CALL: ProgramCall = { program: "<<", args: [] };
const ASSIGNMENT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*=/;
const SCRIPT_FLAG_PATTERN = /^-[A-Za-z]*c[A-Za-z]*$/;
const GROUPING_PATTERN = /^[({]+/;

function stripPrefixes(words: readonly string[]): readonly string[] {
  const grouped = words.map((word, index) => (index === 0 ? word.replace(GROUPING_PATTERN, "") : word));
  const trimmed = grouped.filter((word, index) => index > 0 || word !== "");
  const start = trimmed.findIndex((word) => !ASSIGNMENT_PATTERN.test(word) && !COMMAND_PREFIXES.includes(word));
  return start === -1 ? [] : trimmed.slice(start);
}

function wrappedScripts(words: readonly string[]): readonly string[] {
  const [program] = words;
  const isWrapper = program !== undefined && WRAPPER_SHELLS.includes(program);
  const flagIndex = words.findIndex((word) => SCRIPT_FLAG_PATTERN.test(word));
  const script = flagIndex === -1 ? undefined : words[flagIndex + 1];
  return isWrapper && script !== undefined ? [script] : [];
}

function collectCalls(text: string, depth: number): readonly ProgramCall[] {
  const line = parseShellLine(text);
  if (line.hasHeredoc) return [HEREDOC_CALL];

  return line.pipelineHeads.flatMap((rawWords) => {
    const words = stripPrefixes(rawWords);
    const scripts = depth < MAX_WRAPPER_DEPTH ? wrappedScripts(words) : [];
    if (scripts.length > 0) return scripts.flatMap((script) => collectCalls(script, depth + 1));

    const [program, ...args] = words;
    return program === undefined ? [] : [{ program, args }];
  });
}

export function classifyRunCommand(command: string): RunPolicyVerdict {
  const findings = collectCalls(command, 0).map(({ program, args }) => ({
    verdict: checkShellProgram(program, args),
    isExploration: isExplorationProgram(program, args),
  }));

  const flagged = findings.flatMap((finding) => (finding.verdict.verdict === "allowed" ? [] : [finding.verdict]));
  const blocked = flagged.find((verdict) => verdict.verdict === "redirected");
  if (blocked !== undefined) return blocked;

  const hasOtherWork = findings.some((finding) => finding.verdict.verdict === "allowed" && !finding.isExploration);
  const [firstAdvice] = flagged;
  return firstAdvice === undefined || hasOtherWork ? ALLOWED : firstAdvice;
}
