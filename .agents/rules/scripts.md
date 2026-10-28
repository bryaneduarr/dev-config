# Scripts and tests

These rules are mandatory for shell scripts, standalone TypeScript tools, and tests. The machine is Ubuntu 26.04 x86_64 under WSL2; scripts target only it.

## Choose the language

Use the first option that can express the behavior clearly:

1. **Bash**: small glue that runs commands in sequence, such as installers, launchers, and wrappers, with little branching and no structured data parsing.
2. **TypeScript run by Bun**: logic that parses JSON or other structured data, keeps state, has several branches, or needs unit tests.

- Move a bash script to TypeScript when it starts parsing structured output with `jq`/`sed` pipelines or grows beyond roughly 150 lines of logic.
- Do not add new Python. Existing Python tests migrate to `bun test` when their subject is changed.

## Bash

- Every script starts with `#!/usr/bin/env bash` and `set -euo pipefail`.
- Install the commands a script needs through `apt_install_missing` from `lib/common.sh` or a pinned release download. Do not rely on commands that happen to be installed.
- A script that must be on `PATH` is linked into `~/.local/bin` with `link_into_local_bin`.
- Installers are idempotent: running one twice leaves the same state and does not fail or duplicate work.
- Quote every expansion. Use arrays for argument lists. Use `local` in functions.
- Split a larger installer into `modules/<module>/install.sh` plus focused `.sh` files beside it, each with one responsibility, sourced by the entrypoint.
- Print errors to standard error and exit nonzero. Do not swallow failures with `|| true` without a comment naming the expected failure.
- Scripts must be ShellCheck-clean. Do not add `shellcheck disable` directives without a comment explaining the false positive.

## TypeScript tools

- Standalone TypeScript tools follow [typescript.md](typescript.md), run with Bun, and have their dependencies pinned by the lockfile. Their module installer installs them.
- Validate command-line arguments, environment variables, files, and command output at the boundary before use.

## Tests

- Write tests when behavior needs verification: target selection, data transformations, state transitions, process control, and bug fixes. Do not test trivial configuration or constants, and do not aim for a test per function.
- TypeScript: `bun:test` with `<responsibility>.test.ts` next to the code.
- Do not install packages, change the active terminal, or touch real user state (`$HOME`, `~/.config`) in tests. Mock or isolate those effects.
