# agents command
- Stamp: 2026-11-11 UTC, rev 0229e8f, uncommitted not-started reset fix in modules/agents.
- [agents.ts](../../../modules/agents/agents.ts): TypeScript CLI; services for cli, providers (claude, opencode), usage.
- [Installer](../../../modules/agents/install.sh): rsync to data dir/agents, npm ci, links bin/agents. Rerun `./install.sh agents` to ship source changes.
- Run: `agents --usage`. Tests excluded from installed copy.
- Inferred: Claude `resets_at` is null before a window starts. `UsageWindow.reset` is `scheduled | not-started`.
- Checked: no global `tsc` or repo `node_modules`; `check-code` skips tsc/knip. Ran them in an `npm ci` scratch copy.
