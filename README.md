# dev-config

Personal development environment for Ubuntu 26.04 on WSL2. Each module installs on its own.

```text
./install.sh all         # everything
./install.sh neovim tmux # chosen modules
```

| Module | Installs |
| --- | --- |
| `herdr` | Herdr binary and `~/.config/herdr/config.toml` |
| `tmux` | tmux, TPM (pinned), plugins, `~/.config/tmux/tmux.conf` |
| `yazi` | Yazi, preview tools, plugins, config |
| `neovim` | Neovim, Mason tools, Treesitter parsers, language servers, config linked from `modules/neovim/config` (also installs `yazi`) |
| `pi` | Pi with patched harness, extensions, settings, SearXNG and Crawl4AI containers (also installs `herdr`) |
| `agents` | The `agents` command: `agents --usage` shows Claude and OpenCode subscription limits (`--json`, `--watch`, `--provider claude,opencode`) |
| `bash` | Bash aliases linked to `~/.config/bash/aliases.sh` and sourced from `~/.bashrc` (`c` clears the screen) |
| `rule-audit` | The `rule-audit` command: audits a TypeScript project against the repository rules |
| `check-code` | The `check-code` command: runs every language's command-line diagnostics on changed files or given paths (also installs `rule-audit`; Lua checks need `neovim`) |
