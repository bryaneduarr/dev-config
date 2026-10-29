# Pi harness tools
- Stamp: 2026-10-28, rev 2df21a9 + uncommitted; `check-code modules/pi` passes, 249 tests pass (`COLORTERM=truecolor`).
- `run` appends a tip for cat/grep/find reads and refuses only long sleeps: [classifier](../../../modules/pi/agent-configuration/harness/services/tools/run/classify-run-command.service.ts). `read files[]`, `search queries[]` with line snippets.
- User decided: compaction 300k, no shared child rules.
- Measured: [audit §10](../../audits/pi-harness-audit-2026-10-28.md): cost about flat, calls -30%; 3x unreachable; T3 launch adds 22 s.
- Bench: `pi -p` with `PI_CODING_AGENT_DIR`, not `delegate_task`.
