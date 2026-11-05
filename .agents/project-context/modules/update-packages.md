# update-packages and bun
- Stamp: 2026-11-02 UTC, rev f950690; modules/update-packages and modules/bun uncommitted.
- [update-packages](../../../modules/update-packages/update-packages.sh): apt update, full-upgrade, autoremove, then `run_module bun`.
- [bun](../../../modules/bun/install.sh): latest GitHub release (tag from releases/latest redirect), SHASUMS256-verified, in data dir `bun/`; links bun and bunx. Skips when installed version matches.
- User decided: Bun tracks latest stable, not a pinned version. check-code runs the bun module; npm `bun` dropped.
- Checked: check-code passed; redirect parse gave 1.4.4. Installer not run.
- Pinned tools (Node, Zig) change by bumping lib/common.sh constants.

# agent-browser
- Stamp: 2026-11-04 UTC; modules/agent-browser uncommitted.
- [agent-browser](../../../modules/agent-browser/install.sh): `agent-browser@latest` via `install_global_npm_tools` into the tools dir, linked into `~/.local/bin`, then `agent-browser install` downloads Chrome. Registered last in `all_modules`.
- User decided: tracks latest, matching Bun. Re-running the installer upgrades it.
- Checked: installer run (0.41.2, Chrome 157), `agent-browser open` worked, check-code passed on the module and install.sh. Not run: `--with-deps` (system libraries were enough).

# ffmpeg
- Stamp: 2026-11-04 UTC; modules/ffmpeg uncommitted.
- [ffmpeg](../../../modules/ffmpeg/install.sh): `apt_install_missing ffmpeg:ffmpeg`; Ubuntu 26.04 candidate is 8.0.1. `update-packages` upgrades it through apt full-upgrade. Registered last in `all_modules`.
- Checked: check-code passed. Install not completed in-session: sudo needs a terminal password.
