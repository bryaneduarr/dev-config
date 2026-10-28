# Neovim
- Stamp: 2026-10-28 UTC, rev 2df21a9, many uncommitted changes (code in flux).
- [Installer](../../../modules/neovim/install.sh): nvim, lua-language-server, npm tools, spell files.
- Config dir is symlinked, so lazy.nvim writes lazy-lock.json into the repo; existing config moves to *.pre-dev-config.
- Lazy restore, Mason, Treesitter run headless.
- Config: [init.lua](../../../modules/neovim/config/init.lua), lua/config, lua/plugins.
- Lua checked via stylua and .luarc.json projects.
