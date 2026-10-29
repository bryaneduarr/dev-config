const BATCH_HINT = "Batch independent lookups into one call: read `files`, search `queries`, or one `codemode` script.";

export const READ_ADVICE_MESSAGE = `Tip (the command ran): read returns line-numbered files with bounded output, for example read {"files":[{"path":"src/a.ts"},{"path":"src/b.ts","offset":40,"limit":80}]}. ${BATCH_HINT}`;

export const GREP_ADVICE_MESSAGE = `Tip (the command ran): rg -n pattern dir or search {"queries":["pattern one","pattern two"]} is faster than grep and respects .gitignore. ${BATCH_HINT}`;

export const FIND_ADVICE_MESSAGE = `Tip (the command ran): fd -e ts name dir or search {"kind":"file","queries":["name"]} is faster than find and respects .gitignore. ${BATCH_HINT}`;

export const SLEEP_REDIRECT_MESSAGE =
  "Blocked: do not wait with a long sleep. Run the slow command in the foreground with a larger timeoutMs, or run it with a timeout that ends when the work finishes. Each poll re-reads the whole conversation.";

/** Longest sleep, in seconds, the run policy lets through. */
export const MAX_SLEEP_SECONDS = 15;

/** Wrapper shells whose -c script the run policy inspects. */
export const WRAPPER_SHELLS: readonly string[] = ["bash", "sh", "zsh"];

/** Wrappers nested deeper than this are not inspected. */
export const MAX_WRAPPER_DEPTH = 2;

/** Words that start a command line without being the program. */
export const COMMAND_PREFIXES: readonly string[] = [
  "time",
  "command",
  "exec",
  "nohup",
  "nice",
  "do",
  "then",
  "else",
  "elif",
  "!",
];

/** Programs that only inspect, format, or print; a command made of these plus a refused read or search is pure exploration. */
export const EXPLORATION_PROGRAMS: readonly string[] = [
  "ls",
  "echo",
  "printf",
  "wc",
  "pwd",
  "cd",
  "set",
  "export",
  "unset",
  "declare",
  "shopt",
  "true",
  "false",
  "test",
  "[",
  "nproc",
  "done",
  "fi",
  "esac",
  "for",
  "while",
  "until",
  "if",
  "case",
  "cut",
  "sort",
  "uniq",
  "tr",
  "nl",
  "column",
  "rg",
  "fd",
  "tree",
  "stat",
  "file",
  "du",
  "df",
  "which",
  "basename",
  "dirname",
  "realpath",
  "jq",
  "yq",
  "awk",
  "sed",
  "grep",
  "egrep",
  "fgrep",
  "find",
  "cat",
  "head",
  "tail",
];

/** git subcommands that only read the repository. */
export const READ_ONLY_GIT_SUBCOMMANDS: readonly string[] = [
  "log",
  "diff",
  "show",
  "status",
  "branch",
  "rev-parse",
  "ls-files",
  "blame",
  "grep",
  "remote",
  "describe",
  "shortlog",
];

/** find options that do more than list names; fd cannot replace them. */
export const FIND_ACTION_FLAGS: readonly string[] = [
  "-exec",
  "-execdir",
  "-ok",
  "-delete",
  "-print0",
  "-newer",
  "-mmin",
  "-mtime",
  "-size",
  "-perm",
  "-user",
  "-empty",
  "-printf",
];
