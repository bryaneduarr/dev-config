# Structure and ownership

These rules are mandatory for creating, moving, reviewing, and naming files.

## Layout

```text
install.sh                   Entry point: ./install.sh all | <module>...; runs each module installer.
bootstrap.sh                 Prepares a fresh Ubuntu machine as root; independent of the modules.
lib/common.sh                Functions sourced by install.sh and every module installer.
modules/<module>/            Everything one program or tool needs: install.sh, configuration files,
                             scripts, source, and tests.
.agents/                     Agent instructions only: rules and skills.
```

- A module is one program or tool the user runs. Its `install.sh` installs it and links or copies its configuration. A module installer sources `lib/common.sh` and does not duplicate a function that file already defines.
- Register a new module by adding its folder under `modules/` and its name to `all_modules` in `install.sh`, and describe it in `README.md` only when the user asks.
- Configuration a module links into `$HOME` stays in the module folder and is linked, not copied, so edits apply immediately. Neovim's configuration lives in `modules/neovim/config/`.
- The Pi harness keeps its TypeScript source, settings, and installer together in `modules/pi/`; the `agents` command keeps its own in `modules/agents/`.
- `.agents/` stays agent-facing. Nothing installs or imports its skills or rules.
- The target is Ubuntu 26.04 on WSL2, x86_64 only. Do not add code for other distributions, architectures, or a native desktop.

## Choose the deepest meaningful owner

- Organize by feature, then by responsibility inside the feature. Use descriptive kebab-case folder names that state what each folder owns.
- Each folder level must identify a real ownership boundary. Do not create empty scaffolding, speculative folder trees, or layers that only increase depth.
- Keep a feature flat while it is small. Add a subfolder when several files serve a distinct part of the feature, such as `scripts/`, `templates/`, or `keybindings/`.
- When several features need the same implementation, place it under the narrowest truthful capability owner, such as `system/desktop-session/` for appearance values used by several programs. Never create `shared/`, `common/`, `utils/`, `helpers/`, or `misc/` folders or files.
- When a task establishes a better owner for related existing files, move them as part of the task and update every import, `imports` list, path reference, test, and document that pointed to them. Remove empty folders. A repository-wide migration of unrelated features requires separate authorization.
- Adapting related existing files to a better domain or operation owner is part of the task, even when those files otherwise would not need editing. Inside established architectural roots, follow the deepest-owner rules in this section; minimal-diff scope is not a reason to leave the affected ownership area structurally noncompliant.
- Existing architectural folders named `utils/`, `helpers/`, `services/`, or `types/` are allowed as role overviews, not catch-all owners. Their contents must follow the deepest-owner rules in this section.
- Ask the user before proceeding when plausible owners imply materially different module boundaries. Make straightforward placements without asking.

## Files

- Keep each file focused on one responsibility. Target roughly 150 lines; a small overrun is fine when splitting would reduce clarity.
- One main function per file. Each `.service.ts` exports exactly one function, each `.interface.ts` declares one interface (types derived from it may share the file), and each `.constant.ts` holds the constants of one responsibility.
- Split substantially larger implementation files by responsibility into descriptive subfolders.
- Use operation-specific folders and dedicated domain type locations when appropriate. Do not merge unrelated responsibilities into one type catalog or aggregate interface.
- Name files and folders for their actual responsibility, in kebab-case.
- Nix: only if a `.nix` file is ever needed. Never create `default.nix` files, and import Nix files by their full file path. See [nix.md](nix.md).
- Module installers are named `install.sh`; they are the one exception to the shell naming rule below.
- TypeScript: name files `<specific-responsibility>.<singular-role>.ts`, such as `read-session-registry.service.ts` or `exit.command.ts`, and place them in the role roots below. See [typescript.md](typescript.md). A build-time script that patches an upstream package is `<target>.patch.ts`; a standalone tool's entry file at its project root is `<tool>.ts`, such as `modules/agents/agents.ts`.
- Shell: name other files `<action-or-responsibility>.sh`, such as `link-configuration.sh`.
- Lua: follow the existing `modules/neovim/config/lua/config/` and `modules/neovim/config/lua/plugins/<plugin>.lua` layout.
- Put each test file next to the file it tests, named after the file or behavior it checks: `<subject>.test.ts`. Test files follow the same comment rules as other code; their names state what they check. Never create a central `tests/` folder or a per-feature `tests/` subfolder; existing ones migrate when their subject is touched. Typed fakes and setup that several tests of one subject repeat go in `<subject>.test-double.ts` beside them. Split test files over about 150 lines by the behavior they check.
- Preserve filenames required by tools: `init.lua`, `package.json`, `stylua.toml`, and similar.
- Apply naming rules to new files and files moved for the task. Do not rename unrelated files during another task.

## TypeScript roots

Every TypeScript project owns one or more roots: the Pi harness, each multi-file Pi extension, and any future TypeScript package in its own folder. A root's entry file (such as Pi's `harness.extension.ts`, never `index.ts`) registers everything, with the order of operations visible. Code lives in role roots beside it:

```text
types/<domain>/<operation>/        <responsibility>.interface.ts   Documented contracts.
schemas/<domain>/<operation>/      <responsibility>.schema.ts      Runtime validation at boundaries.
constants/<domain>/                <responsibility>.constant.ts    Repeated literals and limits.
services/<domain>/<operation>/     <verb-object>.service.ts        One exported function each.
stores/<domain>/                   <noun>.store.ts                 One process-wide instance of a factory-made object.
tools/<tool>/                      <tool>.tool.ts                  Tools registered with Pi.
commands/<command>/                <command>.command.ts            Commands registered with Pi.
components/<domain>/               <responsibility>.component.ts   Terminal UI components.
```

- Role roots give an overview of code roles; domain and operation folders inside them follow the deepest-owner rules above. Use the same domain and operation names across role roots, such as `types/sessions/registry/` and `services/sessions/registry/`.
- Create a role root or folder only when it holds a file. A root that is one small file stays one file.
- A service file exports one main function named after the file, such as `readSessionRegistry` in `read-session-registry.service.ts`. Private helpers it alone uses may stay in the file; a helper a second file needs, or a second behavior, becomes its own service.
- `.tool.ts`, `.command.ts`, and `.component.ts` files only wire Pi: registration, parameter schemas, and layout. Decisions, parsing, and result building live in services; key names, shortcuts, and descriptions live in constants.
- A constants domain folder holds at most 8 files. Past that, group them in operation folders named like the matching `services/<domain>/<operation>/`, such as `constants/tools/search/`.
- A constant, type, or helper several domains need lives in the domain that owns the concept and is imported from there, never copied per consumer. Pi's owners are listed in [pi-rule-audit.md](pi-rule-audit.md).
- Tests sit next to their subject inside these folders.

## Dependencies

- Install external tools from their official apt repository or a pinned, checksum-verified release download, as `lib/common.sh` does for Node.js and Zig. Pin versions in a named constant.
- Add a package to the installer of the module that uses it, not to a global list. `bootstrap.sh` holds only machine-level basics.
- Do not update unrelated dependency versions during another task.
- Keep lockfiles (`package-lock.json`, `modules/neovim/config/lazy-lock.json`) consistent with their manifests. Never edit a lockfile by hand.
