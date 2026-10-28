# Install flow
- Stamp: 2026-10-28 UTC, rev 2df21a9, many uncommitted changes (code in flux).
- [bootstrap.sh](../../../bootstrap.sh): root, Ubuntu-only; apt upgrade, users, GitHub CLI, Docker.
- [install.sh](../../../install.sh): modules herdr tmux yazi neovim pi agents bash rule-audit check-code, or `all`.
- [lib/common.sh](../../../lib/common.sh): shared helpers; Node 24 and Zig 0.16.0 under data dir.
- Data: ~/.local/share/dev-config (node, tools, zig, agents, rule-audit); links in ~/.local/bin; configs in ~/.config.
- Unknown: checked runtime outcomes; none run.
