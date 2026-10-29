# Pi harness audit, 2026-10-28

Technical audit of the Pi harness configuration and of the runs made with it on 2026-10-27 and 2026-10-28. Goal: keep what worked, fix what failed, and cut the context-window cost of agents and orchestrators.

Evidence labels: **[M]** measured from session logs, **[S]** source-inspected, **[E]** estimate from a simple model, **[H]** hypothesis not yet tested.

## 1. Scope, data, limits

- Config audited: `modules/pi/` (harness extension with `search`, `read`, `edit`, `run`, `task`; six packages; settings) and the installed copy in `~/.pi/agent`.
- Runs audited: 20 session logs in `~/.pi/agent/sessions` (frozen snapshot), projects `dev-config`, `veyra`, `turbostack`. Models via `claude-bridge`: Sonnet 5.5 (455 turns), Haiku 5.5 (434), Opus 5.5 (305). Plus 82 in-process `task` child runs recorded inside two parent logs.
- Flows covered: solo implementation, interview-then-plan, Pi `task` orchestration (74 children), T3 `delegate_task` orchestration (Opus parent, Haiku workers), MCP/Notion, dependency update.
- Money is not measurable: every cost field is `0` (subscription through `claude-bridge`). Everything is counted in tokens, turns, and wall time.
- The installed harness is the 2026-10-27 install. The repo has since renamed two extensions and one skill folder and refactored `resolve-task-model.service.ts`; behavior in this report is the installed one. **[S]**
- Behavior counts on `run` commands use regular expressions and are approximate. Reasons why models behave as they do are hypotheses.

## 2. Headline numbers

| Metric | Value |
| --- | --- |
| Tokens in the 20 session logs | 165.4M, of which 96% cache reads and 0.9% output **[M]** |
| Tokens in in-process `task` children | 80.9M over 82 runs (not in the logs' usage) **[M]** |
| Largest run | Pi `task` delivery of `resend-verification`: 74 Haiku children used 76.7M tokens, the orchestrator 3.2M (24 to 1). Wall time 3 h 35 min **[M]** |
| Longest parent context | 299k tokens (compaction threshold is 300k) **[M]** |
| Turns with exactly one tool call | 76% to 94% in every session over 100 turns **[M]** |
| `run` calls versus `search` calls | 924 versus 14 **[M]** |
| Tool results flagged as errors | 3 of 1,607 top-level results **[M]** |

Fresh input is about 2k tokens in total. Prompt caching works; the cost is the volume of cache reads: every turn re-reads the whole history.

## 3. What worked (keep and extend)

| # | Practice | Evidence |
| --- | --- | --- |
| G1 | Bounded `run` output: inline cap 6,000 chars and 160 lines, head 60 and tail 20, full output saved as an artifact | 131 of 924 results were clipped and only 7 needed a follow-up read of the artifact **[M]** |
| G2 | `edit` with exact replacement and automatic LSP diagnostics | 312 edits (233 direct, 79 inside codemode), 1 failure (a schema mistake); 52 diagnostics ran without being asked **[M]** |
| G3 | `codemode` for batching and MCP | Notion task finished in 11 turns at 37k context; one script applied 7 edits in a single turn **[M]** |
| G4 | `thinking-distill` interviews with lettered options | The user answered "1a, 2a, 3a" and a plan was saved and executed the same day **[M]** |
| G5 | Thin Pi `task` orchestrator with parallel stages | 31 turns, 158k peak context, no compaction; 12 to 13 jobs per stage in parallel; PR 163 shipped with one user interruption **[M]** |
| G6 | Read-only reviewer jobs with a fixed blocker list | They found real defects before commit: a corrupt result file that crashed `verify --failed`, and Bun types that silently came back **[M]** |
| G7 | Measure first, then change | 142 s to 97 s by turning off a Chromium graphics process; slowest test 55 s to 12.7 s, both found by timing, not guessing **[M]** |
| G8 | Compaction summaries with Goal and Constraints sections | 15k to 24k chars; work continued without re-asking; context fell from 300k to 53k to 115k **[M]** |
| G9 | Fail fast on bad config | `anthropic/claude-haiku-5-5` failed in 0 s with a clear message and the parent fixed it on the next call **[M]** |
| G10 | Short root-cause debugging | Notion MCP failure traced to an invalid `"auth": "oauth"` key in 9 turns at 24k context **[M]** |
| G11 | T3 child summaries in a fixed shape (We are working on, We accomplished, Blockers) | The parent could act on each one without re-reading the work **[M]** |

## 4. What went wrong

### F1. The tools built for agents are barely used

- `run` 924 calls; `search` 14 (text 11, auto 2, file 1; symbol, references, structural, history: 0). `read` by `symbol`: 0 of 310. **[M]**
- 80% of `run` calls read files with `cat`, `head`, `tail`, or `sed -n`; 63% search with `grep`, `rg`, `find`, or `ls`. The prompt forbids both in three places (`harness/constants/tools/run/run-tool.constant.ts`, the system rules, `AGENTS.md`). **[M]**
- 83% of `run` commands chain three or more steps; average command is 445 chars. **[M]**
- Consequence: the tools with unique value (symbol lookup, references, structural search) add nothing, and output is not bounded for `cat` and `sed` the way `read` bounds it.
- **[H]** Agents batch five lookups into one shell call to save turns, because turns are expensive and 76% to 94% of turns carry a single call. `search` and `read` cannot batch, so the shell wins. A second cause: `read` returns an outline for large files (45 of 310 calls) and the agent bypasses it with `sed -n`.

### F2. `run` is `/bin/sh` and its text describes another machine

- `spawn(shellLine, { shell: true })` uses `dash` on Ubuntu (`services/tools/process/run-command.service.ts`). 209 of 924 commands are wrapped in `bash -c '...'`, and backticks and heredocs were mangled in at least one session. 20 commands call `python3` although the rules point to `jq`, `yq`, and `ast-grep`. **[S][M]**
- The tool description and `MISSING_COMMAND_HINT` say the host is NixOS and tell agents to use `nix shell`. The host is Ubuntu 26.04. An agent ran `nix shell nixpkgs#gh` and got `nix: not found`. The hint is attached to every exit code 127, so a failed `docker exec` was reported as "this is NixOS". **[S][M]**
- 359 commands (39%) still start with `cd`; the harness splits them off, so this is harmless but the rule text is noise.

### F3. Serial turns and `sleep` polling multiply cache reads

- Single-call turns: 90% in the 269-turn Opus orchestrator, 94% in a 82-turn Haiku worker. **[M]**
- 76 `sleep N; grep ...` polls waited 87 minutes in total and each re-read the full history: 11.7M cache-read tokens. `run` already supports a long blocking `timeoutMs`, but the guidelines never say to use it. **[M][S]**

### F4. Compaction starts too late

- Threshold is `contextWindow - reserveTokens` = 1M - 700k = 300k for every model (37 near-identical overrides in `settings.json`). **[S]**
- In the four sessions that compacted or passed 150 turns, 47% to 60% of cache reads happen above 200k. **[M]**
- Simulated thresholds with the observed 100k post-compaction floor: 150k cuts cache reads 29% to 34%, 200k cuts 19% to 25%. **[E]**
- `keepRecentTokens: 60000` sets the floor at 53k to 115k; a lower threshold needs a lower floor or compaction fires every few turns.

### F5. In-process `task` children start blind and expensive

- `createTaskResourceLoader` sets `noExtensions` and `noContextFiles`, so children use Pi's built-in `read`, `bash`, `grep`, `find`, `ls`: no bounded `read` (children read 15.9k-char files whole), no `search`, no LSP, no tree-sitter. **[S]**
- For `claude-bridge` the child still carries the parent's full system prompt (project context, skill list, T3 section), about 20k tokens at the first turn. **[S][M]**
- Every child then reads its rules again: 864 reads of rule, skill, plan, and note files, 6.7M chars (about 1.9M tokens), 8 to 12 files per child. The `context` field was used in 2 of 75 calls, for one-line facts. Those reads stay in each child's context; estimated 32M of the 69M child cache reads (46%). **[M][E]**
- Rules arrive as tool results, so they differ per child and cannot share a cache prefix across children. **[H]**

### F6. Two result contracts disagree

- The harness parser expects `status`, `summary`, `findings`, `unresolved_questions`, `checks`, `files_changed`, `risks`, `errors`. The delivery skill tells children to emit `status`, `context`, `changed`, `checks`, `needs`, `decided`, `learned`, `blocker`. **[S][M]**
- Result: `files_changed` was empty in 64 of 74 results, and `checks` collected unrelated lines (`needs:`, `decided:`) because the parser only stops at its own section names (`services/subagents/result/parse-task-output.service.ts`). The orchestrator read the free-text `summary` instead. **[M]**

### F7. The role system was never used, so its safeguards never ran

- All 74 `task` calls used the legacy role (`task`). Roles `explore`, `implement`, `verify`, and `approved_command` were used in 8 calls total, all in the first session, and 4 of those failed on the model key (S1). **[M]**
- Legacy jobs received `bash`, `edit`, and `write`, including every "review" and "verify" job: read-only review was a prompt promise, not a tool restriction. Twelve implementers wrote in one worktree in parallel; the one-slot implementation queue was bypassed. **[M][S]**
- In the T3 flow a worker ran a cleanup in the main Veyra checkout instead of its worktree; isolation was by instruction only. **[M]**

### F8. Verification dominates wall time and is opaque

- Five `Verify` jobs averaged 20.5 minutes: 103 of 215 minutes of wall time, run in sequence. The parent is blocked inside one tool call with no progress beyond a tool count. One verify job under isolation ran 23 minutes with no result before the user interrupted; the result was lost and the 22-minute re-run cost the same again. Verify timeouts were set to 58 to 60 minutes, so a stuck job would have held the parent for an hour. **[M]**

### F9. The most expensive context did the cheapest work

- In the T3 flow the Opus orchestrator ran 269 turns and 202 `run` calls itself, mostly at 250k to 300k context: 46.2M cache reads, more than all seven Haiku workers together (46.9M). It read worker logs with `sed -n .agent/runs/...` and tried a Python edit before using `edit`. It made 19 direct edits and 79 more through codemode. **[M]**
- Bookkeeping jobs (`Publish`, `Record`) were 14 of 74 children and 13.3M tokens; each re-read the rule files. **[M]**

### F10. Smaller issues

| # | Issue | Evidence |
| --- | --- | --- |
| S1 | Model id `anthropic/...` resolves in the catalog but has no key; the error lists catalog models, not usable ones | 4 failed calls in the first orchestration **[M]** |
| S2 | Parent logs keep each child's full activity: 12.3 MB of a 12.7 MB log is `details` of `task` results | **[M]** |
| S3 | Four web-tool schemas (5.0k chars) and the T3 section and schemas (8.4k chars) are in every request, including Haiku workers told to start no subagents | **[S]** |
| S4 | `codemode` scripts fail on a wrong result shape and keep the calls already made ("they are not undone") | 2 of 38 scripts **[M]** |
| S5 | Installed harness lags the repo; install is manual | **[S]** |
| S6 | Oversized `codemode` and web results spill into `.pi/tool-output/` inside the project, which `.gitignore` does not cover (`.agent/` is covered); the agent then re-reads the file with `cat` | untracked `.pi/` in this repo; 1 such `cat` in the first Opus session **[M]** |

## 5. Context-window cost model

Cost of a session is the sum over turns of the history size, so three factors multiply: turns, history size, and the number of agents.

| Part | Size | Comment |
| --- | --- | --- |
| Fixed prompt per request | 14k to 22k tokens (7k in `dev-config`) | System sections 25k to 29k chars, tool schemas 17k to 22k chars **[M]** |
| History growth | 1k to 2k tokens per turn | Command text (25% of chars), `run` output (38%), thinking text (14%), `read` output (9%) in the 269-turn session, signatures excluded **[M]** |
| Child multiplier | 74 children times (20k prompt + 23k rules + work) | Rules are 28% of an average child context **[E]** |

The fixed prompt is 5% to 7% of a 300k window and is cached, so trimming it saves little. The levers are turn count, compaction threshold, and duplicated reading across children.

## 6. Orchestration compared

| Aspect | Pi `task` (in-process) | T3 `delegate_task` (separate session) |
| --- | --- | --- |
| Child tools | Pi built-ins only | Full harness tools, LSP diagnostics after edits |
| Parallelism | 12 to 13 per stage, one blocking call | Async, results arrive as user messages |
| Parent cost | 3.2M cache reads, 31 turns | 46.2M cache reads, 269 turns (parent kept working) |
| Child cost | 69M cache reads, boilerplate heavy | 46.9M for 7 workers |
| Result format | Structured but mis-parsed (F6) | Fixed prose shape, reliable |
| Isolation | Prompt only (F7) | Worktree per job, one escape observed |
| Strength | Thin, predictable parent | Workers have better tools and a separate log |
| Weakness | Blind children, opaque long jobs | Parent drifts into doing the work (F9) |

The two flows did different work, so their totals are not a like-for-like benchmark.

## 7. Recommendations

Ordered by effect over effort. Paths are under `modules/pi/agent-configuration/harness/`.

### P0: small changes, immediate effect

1. **Make `run` truthful and bash.** Spawn with `/bin/bash`; delete the NixOS text in `constants/tools/run/run-tool.constant.ts` and `run-limits.constant.ts`; show the missing-command hint only when the output says "command not found". Removes 209 wrappers and the misleading hint (F2).
2. **Say how to wait.** Add to the `run` guidelines: run long checks in the foreground with `timeoutMs`; never poll with `sleep` (F3, up to 11.7M tokens).
3. **Withdrawn (user keeps compaction at 300k).** Lower compaction: target about 200k effective window and `keepRecentTokens` near 30k. Generate the per-model list in `scripts/render-settings.mjs` instead of 37 hand entries. Expected 19% to 25% fewer cache reads in long sessions; verify the post-compaction floor stays well below the threshold (F4) **[E]**.
4. **Fix the model error.** List only authenticated models and default to the current provider (S1).

### P1: subagent platform

5. **Give in-process children the harness tools.** Load the harness `search`, `read`, `run`, and `lsp_diagnostics` in `create-task-resource-loader.service.ts` instead of `noExtensions` (F5).
6. **Withdrawn (rules differ per project, so no shared digest).** Stop per-child rule reading: put the shared rules digest in the child system prefix (same text for every child, so one cache write serves all) or pass it through `context`; keep the mission under 1k chars. Test cache sharing before relying on it **[H]**. Estimated saving 25M to 32M of 69M child cache reads.
7. **One result contract.** Make the delivery skill emit the harness labels, or teach the parser the skill's labels; reject a result without `status` and `summary`; take `files_changed` from `git diff`, not from self-report (F6).
8. **Make roles real.** Default an omitted role to the read-only set, give `review` and `verify` no `edit` or `write`, allow `verify` a pattern allowlist such as `scripts/dc *`, and key the implementation queue per worktree (F7).
9. **Stop logging child activity in the parent.** Keep usage and counts only (S2).

### P2: workflow and tool adoption

10. **Keep orchestrators thin.** Rule for delivery prompts: the parent runs only `task`, `git`, and `gh`; investigation goes to an `explore` job on a cheaper model (F9).
11. **Merge bookkeeping.** Fold `Publish` and `Record` into one close job or a script; cut the 14 jobs and their rule re-reads.
12. **Show progress for long jobs.** Have `verify` print per-step timing to a known file the parent can read in one call, and set verify timeouts near twice the measured run (about 40 minutes, not 60) (F8).
13. **Win the shell back with the dedicated tools.** Let `search` and `read` take arrays (`queries`, `paths`) so one call replaces a five-step shell batch; add `read` with an explicit whole-file mode up to a cap; append a one-line hint to `run` results for `cat` and `grep` commands. Re-measure adoption with the counts in section 2 (F1) **[H]**.
14. **Make the audit repeatable.** Extend `/session-stats` (`constants/sessions/stats/session-stats.constant.ts`) with calls per tool, single-call turn share, cache reads above the threshold, and child usage, so these numbers need no one-off scripts.

## 8. Not measured

- Money and plan-limit impact (costs are zero in the logs; `agents --usage` was not used).
- Whether `claude-bridge` replays thinking blocks, which would change history size, and whether children share a prompt cache.
- Quality loss at long context, especially Haiku above 200k.
- Codex and OpenCode providers: configured, but no session used them.
- Long-session savings: section 9 benchmarks 3 to 15 turn tasks only; effects that grow with turn count are estimated, not measured.
- Items 4, 7, 8, 9, 11, 12 and 14 were not implemented; item 8 changed only the `task` guideline text, not the role tool sets.

## 9. Implementation and A/B benchmark

Evidence labels as above. Paths are under `modules/pi/agent-configuration/harness/`. Checked with `check-code modules/pi` and `bun test` (249 pass; `present-assistant-markdown.test.ts` needs `COLORTERM=truecolor`).

### 9.1 What changed

| Audit item | Change | Where |
| --- | --- | --- |
| 1, F2 | `run` spawns `/bin/bash`; host text read from `/etc/os-release`; missing-command hint only on "not found" | `services/tools/run/read-host-guidance.service.ts`, `constants/tools/process/process.constant.ts` |
| 13, F1 | `run` refuses `sleep` of 15 s or more. Superseded by section 10: `cat`, `head`, `tail`, `sed -n`, `grep` and `find` now run and get a tip appended | `services/tools/run/classify-run-command.service.ts` |
| 13 | `read` takes `files` (paths or `{path, offset, limit, symbol}`, up to 24) and lists a directory; `search` takes `queries` (up to 20); both share one output budget | `services/tools/read/read-files.service.ts`, `services/tools/search/search-many.service.ts` |
| 5, F5 | In-process children get the harness `read`, `search`, and `bash` instead of Pi built-ins | `services/subagents/tasks/run/create-child-tool-set.service.ts` |
| 2, 10 | Guidelines: wait with `timeoutMs` not `sleep`; batch lookups; thin orchestration; cheaper model for `explore` and `verify`; no edit tools for reviews | `constants/tools/run/run-tool.constant.ts`, `constants/subagents/tasks/run/tool-description.constant.ts`, `instructions.md` |

Cost of the longer tool text: first-turn context 15.8k to 16.2k tokens (+480, cached after turn 1) **[M]**.

### 9.2 Method

- 46 headless Pi sessions started through T3 `delegate_task` on `claude-bridge` (Haiku 5.5; Sonnet 5.5 for the orchestrator task), 16 on the installed harness before the change, 30 on the repo harness in three rounds.
- Six tasks with checkable answers on generated fixtures (a 52-file service, a frozen copy of this harness): T1 and T5 and T6 questions, T2 a failing test, T3 delegation to three subagents, T4 a change across 8 domains plus a three-minute `verify.sh`.
- Cost units use token price ratios (input 1, cache write 1.25, cache read 0.1, output 5) because the logs record cost 0 on the subscription **[E]**. "Warm" removes first-turn cache creation, which a changed tool text forces once per prompt change and which the baseline did not pay.
- Baseline `T2` to `T4` correctness is read from the last test output in the session log; the work folders were overwritten by a fixture re-run.

### 9.3 Results (baseline -> final harness, mean per run)

| Task | n | Correct | Turns | `run` calls | cat/grep/find in `run` | Cost units | Tokens |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 code Q&A | 3/3 | 3/3 -> 3/3 | 3 -> 3.3 | 1.7 -> 0 | 2 -> 0 | 21.6k -> 24.0k (+11%) | 57k -> 66k (+17%) |
| T2 fix failing test | 3/3 | 3/3 -> 3/3 | 5.7 -> 6.7 | 4.3 -> 3.3 | 2.7 -> 1.7 | 28.0k -> 32.9k (+17%) | 114k -> 138k (+21%) |
| T3 three subagents | 2/2 | 2/2 -> 2/2 | 4 -> 4 | 0 -> 0 | 0 -> 0 | 143.2k -> 135.3k (-6%) | 298k -> 267k (-10%) |
| T4 8-domain feature | 2/2 | 2/2 -> 2/2 | 15 -> 15.5 | 20 -> 7.5 | 17.5 -> 3 | 180.6k -> 183.9k (+2%) | 529k -> 611k (+16%) |
| T5 repo Q&A | 3/3 | 3/3 -> 3/3 | 3.7 -> 3 | 2.3 -> 0.7 | 2.7 -> 1 | 30.5k -> 27.0k (-12%) | 86k -> 64k (-26%) |
| T6 exploration | 3/3 | 3/3 -> 3/3 | 3.7 -> 3 | 3 -> 0.7 | 3.3 -> 0.7 | 30.3k -> 27.5k (-9%) | 79k -> 62k (-21%) |

Read this as follows **[M]**:

- **Correctness unchanged:** all 46 runs answered or fixed correctly.
- **Shell misuse down:** `run` calls summed over the tasks fell from 31.3 to 12.2 per run set (-61%), and cat/grep/find calls from 28.2 to 6.4 (-77%). Subagent tool calls in T3 fell from 33 and 39 to 19 and 28.
- **Cost flat on short tasks:** summed cost units -1%, summed tokens +4% (the cold-cache writes). Single tasks range from -12% to +17%. With two or three runs and a spread of up to 20% in one cell, only changes beyond about 15% are visible.
- **Why short fix tasks got dearer:** a refused command or a rejected tool call costs one turn, about 3k units, which is 10% of a 28k-unit task. Exploration tasks (T5, T6) gained from batching.
- **Output tokens dominate:** in T4 output is 43% to 48% of the units (a 15k-token edit script), which no tool-shape change touches.

### 9.4 Defects the benchmark exposed (all fixed)

1. **Batch cap too small.** Every first-round T6 run sent 9 queries and hit `maxItems: 8`, a validation error and a lost turn. Caps raised to 20 and 24; T6 went from +23% to -9% **[M]**.
2. **Policy bypass.** `set -e; find ...; cat ...` ran because `set` counted as real work. `set`, `export`, `unset`, `declare`, `shopt` are now neutral.
3. **Refusal hid a harmless `ls`.** The agent then listed files with `search` kind `file` and the query `*`, got 5 of 52 files, and reported two rule files as missing. `read` now lists directories and the refusal says nothing ran.

### 9.5 Open

- **Edits through `codemode` fail as text.** Two T4 agents (opt-T4-1, opt2-T4-1) skipped test edits silently and caught it only through the failing suite. This is Pi `codemode` behaviour, not changed here **[M]**.
- **The refusal costs a turn.** A "run it, then append the hint" mode would avoid the lost turn but would not enforce. This is the user's call; enforcement is the current behaviour **[H]**.
- **Long sessions.** If the T5/T6 effect (-9% to -12% on exploration) held on the exploration share of the audited sessions, savings would be single-digit percent of session cost **[E]**. The larger levers remain F9 (expensive orchestrator doing cheap work), context size, and duplicated child reading.
- **Subagent cwd.** A child starts in the parent's directory, so "work only inside X" missions ran `bun test` in the wrong folder (both variants).
- **Installed copy.** `~/.pi/agent/extensions/harness` and `AGENTS.md` now match the repo harness. The previous copy is in `~/.local/share/dev-config/backups/pi-harness-before-optimization-2026-10-28/` with `restore.sh`. `install.sh` was not run.

## 10. Round 2: direct benchmark, and what it changed

Paths under `modules/pi/agent-configuration/harness/`. Method change: sessions run as `pi -p` with a separate agent directory per variant (`PI_CODING_AGENT_DIR`), 10 s per run instead of 35 s, 5 runs per cell (3 for T4), Haiku 5.5, thinking medium. Cost units as in 9.2. Baseline `fbase` is the pre-change harness.

### 10.1 Findings

1. **T3 launch overhead, outside the harness [M].** The first model turn takes 23.5 s when T3 starts the session (n=46) and 2.5 s when I start `pi -p` (n=46); later turns are equal (about 4 s). It is intermittent in T3 (about 2 s after a long idle, 22 s when launched soon after another session) and I could not reproduce it with the T3 extension loaded directly. It is about 60% of the wall time of every short T3 run and no harness change touches it.
2. **Refusing was not the cause of the cost, but it did not help either [M].** The model already batches reads with shell loops (`for f in $(find ...); do grep ...; done`). Over the six lookup tasks, the refusing variant cost +12% units against the baseline (n=3) and the tip variant +14% (n=5), with 28% fewer calls. Refusals waste a turn; the tip does not, so the run policy now runs the command and appends the tip (`advised`). Only long sleeps are refused.
3. **`search` returned locations without text [M].** To learn a value (`= 120`) the model had to read the file, one extra turn, and every line repeated an absolute path. Matches now show `path:line: snippet` with paths relative to the working directory. This was the reason agents preferred `grep` in the audited sessions **[H]**.
4. **Snippets make a cheap model less thorough [M].** With snippets only, T6 answered `TASK_ROLES = [TASK_TOOL_NAME, "explore", ...]` unresolved in 5 of 5 runs. A guideline now says to resolve names built from other names; 3 of 5 resolved them.
5. **Thinking level is not a lever here [M].** Off, low and medium gave the same output tokens (within 15%) and the same accuracy on Haiku; output is mostly answer text and tool-call JSON.
6. **Floor [E].** A lookup task needs two turns: about 9k units against 12k to 25k measured. Short tasks cannot improve by 3x through tool shape; at most about 2x, and only by one-call answers.

### 10.2 Results (units, mean per run; correct runs in brackets)

| Task | Baseline | Refuse (round 1) | Tip, no snippets | Tip + snippets + guideline |
| --- | --- | --- | --- | --- |
| T1 code Q&A | 24.7k (5/5) | 23.8k | 20.2k (5/5) | **14.8k (5/5), -40%** |
| E2 symbol lookup | 14.3k (5/5) | 11.2k | 11.3k (5/5) | **11.4k (5/5), -21%** |
| E1 call trace | 23.7k (5/5) | 21.9k | 23.2k (4/5) | 21.5k (5/5), -9% |
| E3 per-file facts | 20.3k (5/5) | 30.0k | 25.4k (5/5) | 20.8k (5/5), +2% |
| T6 aggregate lookups | 17.5k (5/5) | 24.2k | 25.0k (5/5) | 22.8k (3/5), +30% |
| T2 fix a bug | 14.9k (5/5) | 16.9k | 16.6k (5/5) | 17.8k (5/5), +19% |
| T4 8-domain feature | 102.7k (3/3) | 115.6k | 126.0k (3/3) | 121.1k (3/3), +18% |

Tool calls per run fell 28% to 35% and turns 8% to 13% in the tip variants; total units are within noise of the baseline (about +5%). T4 varies by 50% between runs of one variant (output 6k to 10k tokens of generated edit script), so its cell cannot show a 20% effect.

### 10.3 Verdict

- The three-times target is not reachable on these workloads. Where the tools helped it was one lookup in one call (T1, E2). Where the baseline model aggregates with shell loops (T6, E3), its one-call `grep` answer is cheaper than any of my tool shapes.
- Shipped: tip instead of refusal, snippet output, the guideline above, long-sleep refusal, batching, child tools. Not shipped: nothing was reverted.
- Next levers with real size, not tested: the 22 s T3 launch delay (about 3x on wall time of short delegated runs), a cheaper model for explore children (price ratio, not tokens), and masking stale tool results in long sessions (the paper in section 5 reports a 50% cost cut; needs a long-session benchmark).
