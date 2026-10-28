# Neovim

These rules are mandatory for files under `modules/neovim/config/`. The configuration stays plain Lua with lazy.nvim and Mason.

- Keep editor settings, keymaps, autocommands, and UI pieces in `modules/neovim/config/lua/config/`, one responsibility per file.
- Keep one plugin spec per file in `modules/neovim/config/lua/plugins/<plugin>.lua`, returning the lazy.nvim spec table. Plugin-specific keymaps and options live in that spec.
- Format with the repository `modules/neovim/config/stylua.toml` settings.
- Use `vim.keymap.set` with a `desc` for every mapping, and `vim.api.nvim_create_autocmd` with a named augroup.
- Do not edit `modules/neovim/config/lazy-lock.json` by hand. Plugin updates happen through lazy.nvim deliberately.
- `modules/neovim/install.sh` links `~/.config/nvim` to this checkout's `modules/neovim/config/` folder, so edits apply on the next Neovim start without reinstalling. Edit files here, never through another copy.
- Neovim runs LuaJIT. `modules/neovim/config/.luarc.json` is the only lua-language-server configuration; do not repeat its settings in `plugins/lsp.lua`.
- Every change must leave the lua-language-server check with zero diagnostics. Do not hide them with `---@diagnostic disable` comments or by lowering the check level.
  - `deprecated`: switch to the replacement the message names, confirmed in the installed plugin's source or help.
  - `need-check-nil`: guard values that can be nil, such as `vim.uv.new_timer()` or `vim.lsp.get_client_by_id()`, with an early return before use.
