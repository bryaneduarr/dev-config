# Verification
- Stamp: 2026-10-28 UTC, rev 2df21a9, many uncommitted changes (code in flux).
- [check-code.sh](../../../modules/check-code/check-code.sh): no args checks changed files; args check paths. `check-code .` is whole project.
- Source-inspected checks: shellcheck, shfmt, tsc, biome, knip, rule-audit, stylua, lua-language-server, cargo fmt, cargo clippy; plus `bun test`.
- PATH needs $HOME/.local/share/dev-config/node/bin:$HOME/.local/share/dev-config/tools/bin:$HOME/.local/bin.
- Projects need installed dependencies, else reported unchecked.
