---
name: commit-changes
description: "Use for every commit, without exception: organizes project changes into separate Conventional Commits in dependency order and writes the messages. Plans shared installer code first, then modules in dependency order, then agent rules and skills, with 50-character titles and 72-character body lines."
---

# Commit changes

Every commit made in this repository goes through this skill. Turn the
requested changes into purpose-driven, dependency-ordered commits.
Read repository instructions first. This skill does not authorize source or test edits,
history rewriting, or pushing.

## 1. Inspect the entire change pool

- Inspect `git status --short`, staged and unstaged diffs, and untracked files.
  Read actual changes, not just filenames or diff statistics.
- Treat staged and unstaged changes as equally unfinished. Existing staging
  is not the final grouping; regrouping it is part of this workflow.
- Respect the user's requested scope. A request for all project changes includes
  user-authored changes, not only the assistant's work. Inventory exclusions.
- Record the initial branch, HEAD, staging state, and changed-file inventory.
  Check for merges, conflicts, concurrent edits, secrets, and generated files.
  Stop for unresolved conflicts or sensitive content; never expose secrets.
- Include additions, deletions, renames, manifests, lockfiles, documentation,
  and configuration. Inspect untracked contents before proposing inclusion.
- Determine each change's purpose from evidence. Ask when its motivation is
  unclear; never invent a reason, issue number, or verification result.

## 2. Build the dependency pyramid

Divide the change pool into multiple focused commits whenever it contains
multiple separable purposes. The sequence must tell the story of what was built:
prerequisites first, then foundations, capabilities, integrations, and consumers
where those stages actually exist in the changes. Large, varied change pools
should normally produce many commits, not a few broad catch-all commits.

Each commit has one coherent purpose, not one file or one arbitrary folder.
Keep inseparable changes together; separate unrelated purposes within a folder.
Inspect independent hunks before concluding that a large group is inseparable;
whole-file grouping is not a reason to collapse distinct work into one commit.
Split independent hunks of a file when necessary, without editing its contents.
List the hunk ownership explicitly if a file appears in multiple commits.
Do not pad the count with artificial splits or leave intermediate commits broken.
Explain any necessary large atomic commit in the plan.

Default layer order:

1. Genuine prerequisite machine configuration: `bootstrap.sh` and `lib/common.sh`.
2. `install.sh` and `modules/`, with a module before any module whose installer runs it (`yazi` before `neovim`, `herdr` before `pi`).
3. `.agents/` rules and skills, `AGENTS.md`, and documentation that does not belong to one module.

Dependency ordering means code relationships: imports, contracts, exports,
function calls, and runtime integration. Order `lib/common.sh` functions before the
installers that call them, and TypeScript schemas and types before the services
that use them, only where those code dependencies actually exist. It does not require restoring historical
third-party package versions or ordering commits by package-version changes.
Keep manifests and lockfiles consistent, but do not turn updated project
packages into a separate historical-version verification requirement.
Do not manufacture commits for unchanged layers.

- Every intermediate commit must be coherent with its ancestors alone. A
  provider change must not break existing consumers waiting for a later commit.
- Prefer additive contracts and compatible transitions already present in the
  changes. Do not modify code to manufacture a transition.
- Correctness outranks folder ordering. Explain cycles, breaking migrations,
  and inseparable cross-layer work in the plan when a different order or an
  atomic cross-layer commit is necessary. Never silently violate the preference.
- Keep supporting documentation with its owning change. Give independent
  documentation, skills, or maintenance work separate purpose-driven commits.
- Place root files according to responsibility, not automatically first or last.
  Keep manifests and corresponding lockfile changes consistent in each commit.
  Never split a lockfile arbitrarily or regenerate it without authorization.
  Explain an inseparable multi-layer dependency update in the plan.
- Keep renames, necessary import/export updates, and removal of obsolete paths
  together when separating them would leave missing modules or broken consumers.

## 3. Write Conventional Commit messages

Format:

```text
<type>[optional scope][optional !]: <description>

<body explaining what changed and why>

<optional footers>
```

### Title: at most 50 characters total

Count the entire title, including type, scope, punctuation, spaces, and `!`.
Use a lowercase type, an optional concise noun scope, and a specific imperative
verb: `define`, `validate`, `preserve`, or `document`. Do not end with a period.
Prefer meaningful domain scopes; `lib`, `bootstrap`, `neovim`, `pi`, and
`agents` are useful when the module is the clearest owner. Follow compatible repository naming.

Avoid `update files`, `misc changes`, `finish work`, and unexplained acronyms.
Shorten scope or phrasing before sacrificing meaning. Move supporting details
into the body; never truncate a title or omit a required breaking-change marker.

Choose the type from the actual purpose:

- `feat`: a new capability; `fix`: correction of incorrect behavior.
- `refactor`: internal restructuring without a feature or behavior fix.
- `perf`: a performance improvement; `style`: formatting only, not UI behavior.
- `docs`: documentation; `test`: test changes already authorized by the user.
- `build`: dependencies or build tooling; `ci`: automation configuration.
- `chore`: maintenance not covered above; `revert`: reversal of a prior commit.

Conventional Commits requires `feat` for features and `fix` for fixes; the other
listed types are supported conventions, not an exhaustive specification list.
Use an established repository type when its meaning fits. Do not hide a feature
or fix under `chore`. Breaking changes may occur with any type.

### Body: at most 72 characters per line

Every commit must have a body. Its total length is unrestricted, but every line
must be wrapped to 72 characters or fewer. Separate the title and body with a
blank line. Separate paragraphs and the footer section with blank lines.

Use factual third-person sentences referring to the code or behavior:
`The handler now validates credentials...` or `The contract was separated...`.
Never use `I made`, `we made`, `I added`, `we fixed`, or other author-centered
wording. Third person need not mean passive voice.

Explain both the completed change and its purpose: the problem, constraint,
or benefit that motivated it. Include relevant compatibility, trade-offs,
migration guidance, and verification only when supported by evidence. A file
inventory is not a substitute for a reason. Avoid filler and speculative claims.
Use plain keyboard punctuation; do not use em dashes or decorative Unicode.

### Footers and breaking changes

- Use `!` immediately before the colon, or a `BREAKING CHANGE:` footer, to
  identify breaking changes. Prefer both, with an actionable migration note.
- `BREAKING CHANGE:` is uppercase; `BREAKING-CHANGE:` is also valid.
- Other footer tokens use hyphens instead of spaces. Examples: `Refs: #123`,
  `Closes: #123`, and `Reviewed-by: Example Reviewer`.
- Footers follow the Conventional Commit trailer form: a token followed by
  `: ` or ` #` and a value. Values may continue on following lines.
- Apply the 72-character limit to footer lines and continuations too. Never
  corrupt an identifier or URL to wrap it; ask for a suitable short reference
  if it cannot fit. Do not invent issues, reviewers, or co-author attribution.
  Never add an AI or tool `Co-Authored-By` trailer.
- A revert message identifies the reverted commit and explains the reason in
  its body. Never perform a revert merely to organize uncommitted changes.

## 4. Present a numbered plan

Inspect and prepare the plan, show it, then execute it without waiting for
approval. Record non-blocking concerns in the plan; if a genuine blocker
prevents a complete plan, explain exactly what cannot be planned and why.

Present commits in execution order so their purposes and dependencies tell the
story of the work. Use this structure for every commit:

### 1. Zig installer function

**Title (37/50):** `feat(lib): add a pinned Zig installer`

**Body:**
```text
The shared library installs a checksum-verified Zig release so
module installers can build tools that require an exact version.
```

**Footers:** None.

**Files:**
- `lib/common.sh` (modify)

**Depends on:** None.
**Order rationale:** The Herdr installer calls this function.
**Verification:** Proposed `shellcheck` and `shfmt -d`; not yet run.

Repeat the structure as `### 2. ...`, `### 3. ...`, and so on. Replace example
paths with exact real paths; label add/modify/delete/rename and any hunk split.
Show actual title counts and footer text in a separate code block when present.
Finish with exclusions, blockers, and ordering exceptions. If files, messages,
dependency order, or grouping change during execution, show the revised plan
before continuing.

## 5. Execute the plan

- Recheck HEAD and the change inventory before staging. Stop for unexpected
  branch changes or concurrent edits. Preserve all working-tree contents.
- Regroup only planned paths/hunks using index-only operations. Never discard
  work, reset hard, clean, stash, checkout over changes, amend existing commits,
  rebase, force-push, or bypass hooks to accomplish this workflow.
- Stage explicit paths or reviewed hunks, including deletions. Do not use blind
  `git add .` or `git add -A`. Preserve excluded changes and their staging state.
- Before each commit, inspect the complete staged diff and staged path list.
  Ensure the index contains exactly that commit's planned changes, not changes
  staged for later commits or excluded work. Check `git diff --cached --check`.
- Count actual message characters before committing: title <= 50; every body
  and footer line <= 72. Validate type, syntax, blank lines, and a factual reason.
- Run applicable static checks using the owning modules' existing commands:
  `shellcheck`, `shfmt -d`, and `bash -n` for shell, and `npm run check` in
  the module for TypeScript. Instruction-only commits require documentation
  checks, not TypeScript checks. Run the affected modules' tests; do not write
  or modify tests here. Never run `install.sh` or `bootstrap.sh` to verify.
- Review each proposed index-tree snapshot and its committed ancestors for
  missing code providers, broken imports, and incomplete contract transitions.
  Run applicable static checks against the final working tree using the updated
  installed project dependencies. Do not require disposable installations of
  historical third-party versions merely to reconstruct earlier commit states.
  Report whether intermediate commits received source review or executable
  verification; final-tree checks do not prove each intermediate commit passes.
- Stop on incomplete groups, failed checks, or failed hooks. Explain the blocker
  and request direction; do not fix source code, regenerate files, bypass hooks,
  or continue creating commits. Leave existing successful commits intact.
- Use the planned message exactly. After each commit, inspect the recorded
  message and diff, noting any hook changes and stopping on unexpected results.
- Never push unless explicitly requested. Finish with an ordered list of hashes,
  titles, checks actually performed, and remaining staged/unstaged changes.
  State verification limits; static checks do not guarantee runtime correctness.

## More message examples

These are illustrative, not evidence about the current repository.

### Module consumer, after the library commit

```text
feat(herdr): build with the pinned Zig release

The Herdr installer now calls the shared Zig installer so the
vendored terminal library builds with the version it requires.
```

### Fix with an issue footer

```text
fix(tmux): keep plugins after a reinstall

The installer now skips cloning TPM when it is already present
so a second run no longer discards installed plugins.

Closes: #123
```

### Breaking change

```text
feat(agents)!: require a provider flag for usage

The usage command now requires --provider to select a source so
unsupported providers fail before any request is made.

BREAKING CHANGE: Calls to `agents --usage` must pass --provider.
Scripts that relied on the default must add the flag.
```

### Independent skill documentation

```text
docs(skills): define ordered commit workflow

The commit workflow requires dependency-aware grouping
and a presented plan to keep project history reviewable.
```
