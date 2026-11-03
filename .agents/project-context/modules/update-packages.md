# update-packages and bun
- Stamp: 2026-11-02 UTC, rev f950690; modules/update-packages and modules/bun uncommitted.
- [update-packages](../../../modules/update-packages/update-packages.sh): apt update, full-upgrade, autoremove, then `run_module bun`.
- [bun](../../../modules/bun/install.sh): latest GitHub release (tag from releases/latest redirect), SHASUMS256-verified, in data dir `bun/`; links bun and bunx. Skips when installed version matches.
- User decided: Bun tracks latest stable, not a pinned version. check-code runs the bun module; npm `bun` dropped.
- Checked: check-code passed; redirect parse gave 1.4.4. Installer not run.
- Pinned tools (Node, Zig) change by bumping lib/common.sh constants.
