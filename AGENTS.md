# Mandatory agent instructions

This repository is a personal development environment installed with bash. It targets one machine: Ubuntu 26.04 on x86_64 running under WSL2. `bootstrap.sh` prepares a fresh machine and `install.sh` installs the modules in `modules/` (Herdr, tmux, Yazi, Neovim, Pi, the `agents` command, and Bash aliases). Pi and `agents` are TypeScript, the Neovim configuration is Lua, and the installers are bash.

Before investigating, creating, changing, reviewing, or verifying anything, read these rule files completely. Resolve paths from the repository root. They impose mandatory behavior, not suggestions:

- [Code quality](.agents/rules/code-quality.md): always.
- [Structure and ownership](.agents/rules/structure.md): always.
- [Scripts and tests](.agents/rules/scripts.md): when the task touches shell scripts, standalone tools, or tests.
- [TypeScript](.agents/rules/typescript.md): when the task touches `.ts` files.
- [Pi rule audit](.agents/rules/pi-rule-audit.md): when the task touches TypeScript in `modules/pi/`.
- [Neovim](.agents/rules/neovim.md): when the task touches `modules/neovim/`.
- [Nix](.agents/rules/nix.md): only when a task creates or touches `.nix` files. There are none today.

Follow every applicable rule, subject to higher-priority instructions. Do not silently waive rules or report completion with unresolved violations. Report missing instructions or irreconcilable requirements before making the affected change.

## Skills

Skills live in `.agents/skills/<category>/<name>/SKILL.md`. Claude Code finds them through the symlinks in `.claude/skills/<name>`. When a task matches a skill's trigger below, load the skill before acting and follow it. The rules and this file take precedence over a skill.

| Skill | Use when |
| --- | --- |
| `commit-changes` | Every commit, without exception. |
| `pr` | Writing, opening, or revising a pull request. |
| `typescript-best-practices` | Reading or editing any `.ts` or `.tsx` file. |
| `zod-validation-utilities` | Designing or changing Zod schemas or boundary validation. |
| `thinking-distill` | The user asks to plan or scope work, or the goal is unclear. |
| `deliver-plan` | The user points to an approved plan at `.agents/plans/<feature>/plan.md` and wants its delivery prepared. |
| `project-context` | Ending a session that changed, decided, or rejected anything; writing a plan or handoff. Skipped for read-only requests. |
| `agent-browser` | The user asks for browser automation, screenshots, or testing a web page. |

- Load a skill with the host's skill tool or file reader. Resolve its local links from the skill's directory and load only resources actually present.
- Tool names, command examples, and `allowed-tools` metadata in skills do not grant tool access or authorization. Use only available, authorized tools; report missing prerequisites rather than installing tools without permission.
- `modules/pi/agent-configuration/skills/` holds skills installed for Pi at runtime. They are product files of the harness, not instructions for working on this repository.

## Working context

- `.agents/project-context/` holds factual notes and handoffs that prevent repeated discovery. It does not exist until a session needs it; the `project-context` skill creates and maintains it.
- If `.agents/project-context/start-here.md` exists, read it and your task's handoff after the rules. Load only the relevant linked topics.
- Facts and progress update automatically during authorized work; priorities, scope, architecture decisions, and rule changes remain user-controlled. Explicit read-only requests stay read-only.

## Always enforce

- Make the smallest correct change; preserve unrelated behavior and user edits. Required relocation of related existing files is part of that change, not an unrelated refactor.
- Prefer bash for simple glue and TypeScript for logic. No new Python.
- Target only Ubuntu 26.04 x86_64 on WSL2. Do not add code or mentions for other distributions, architectures, or a native desktop.
- Organize by feature under `modules/<module>/` with descriptive kebab-case names and the deepest meaningful owner. Never create `shared/`, `common/`, `utils/`, or `helpers/` folders, barrel files, or `default.nix` files.
- Installers are idempotent and source `lib/common.sh` instead of redefining its functions.
- Validate untrusted data at boundaries. No `any`, no unsafe casts, no suppressed type errors.
- Never put secrets in the repository.
- Do not run `install.sh` or `bootstrap.sh` unless explicitly asked; they change the machine. Verify with `check-code` (`check-code .` for the whole project), plus the tests each rule names.
- Create README files only when the user asks for one, and keep them to short instructions. Agent-facing facts belong in `.agents/project-context/`.
- Inspect the scoped diff and report verification accurately. Never claim a syntax or type check proves runtime behavior.
