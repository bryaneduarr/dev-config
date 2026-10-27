# dev-config

Personal development environment for Ubuntu. Each module installs on its own.

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
