#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly config_link="$HOME/.config/nvim"
readonly spell_dir="$HOME/.local/share/nvim/site/spell"
readonly spell_url="https://ftp.nluug.nl/vim/runtime/spell"
readonly -a spell_files=(es.utf-8.spl es.utf-8.sug)
readonly -a global_npm_tools=(tree-sitter-cli bash-language-server @biomejs/biome)
readonly lua_language_server_repository="LuaLS/lua-language-server"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

readonly neovim_dir="$data_dir/neovim"
readonly lua_language_server_dir="$data_dir/lua-language-server"

install_apt_dependencies() {
  apt_install_missing \
    gcc:build-essential make:build-essential wget:wget tar:tar gzip:gzip \
    rg:ripgrep fzf:fzf shfmt:shfmt shellcheck:shellcheck python3:python3
  if ! dpkg -s python3-venv >/dev/null 2>&1; then
    run_privileged apt-get install -y python3-venv
  fi
  has_command fd || has_command fdfind || apt_install_missing fdfind:fd-find
  if ! has_command fd && has_command fdfind; then
    link_into_local_bin "$(command -v fdfind)" fd
  fi
}

install_neovim() {
  local work_dir
  work_dir="$(mktemp -d)"
  log "Installing Neovim into $neovim_dir"
  curl -fsSL "https://github.com/neovim/neovim/releases/latest/download/nvim-linux-$release_architecture.tar.gz" \
    -o "$work_dir/nvim.tar.gz"
  rm -rf "$neovim_dir"
  mkdir -p "$neovim_dir"
  tar -xzf "$work_dir/nvim.tar.gz" -C "$neovim_dir" --strip-components=1
  rm -rf "$work_dir"
  link_into_local_bin "$neovim_dir/bin/nvim" nvim
}

install_lua_language_server() {
  local version work_dir
  version="$(curl -fsSL "https://api.github.com/repos/$lua_language_server_repository/releases/latest" |
    grep -oE '"tag_name": *"[^"]+"' | grep -oE '[0-9][^"]*')"
  work_dir="$(mktemp -d)"
  log "Installing lua-language-server $version"
  curl -fsSL "https://github.com/$lua_language_server_repository/releases/download/$version/lua-language-server-$version-linux-$node_architecture.tar.gz" \
    -o "$work_dir/lua-language-server.tar.gz"
  rm -rf "$lua_language_server_dir"
  mkdir -p "$lua_language_server_dir"
  tar -xzf "$work_dir/lua-language-server.tar.gz" -C "$lua_language_server_dir"
  rm -rf "$work_dir"
  link_into_local_bin "$lua_language_server_dir/bin/lua-language-server" lua-language-server
}

link_configuration() {
  if [ -e "$config_link" ] && [ ! -L "$config_link" ]; then
    mv "$config_link" "$config_link.pre-dev-config"
    warn "moved existing $config_link to $config_link.pre-dev-config"
  fi
  mkdir -p "$(dirname "$config_link")"
  # Linking the checkout lets lazy.nvim write lazy-lock.json back into the repository.
  ln -sfn "$module_dir/config" "$config_link"
}

install_spell_files() {
  mkdir -p "$spell_dir"
  local spell_file
  for spell_file in "${spell_files[@]}"; do
    [ -s "$spell_dir/$spell_file" ] || curl -fsSL "$spell_url/$spell_file" -o "$spell_dir/$spell_file"
  done
}

sync_plugins_and_tools() {
  log "Restoring Neovim plugins from lazy-lock.json"
  nvim --headless "+Lazy! restore" +qa
  log "Installing Mason tools"
  nvim --headless "+MasonToolsInstallSync" +qa
  log "Installing Treesitter parsers"
  # The Treesitter config starts parser builds at startup; wait until its child processes finish.
  nvim --headless '+lua vim.wait(3000); vim.wait(900000, function() return #vim.api.nvim_get_proc_children(vim.fn.getpid()) == 0 end)' +qa
}

main() {
  prepare_environment
  install_apt_dependencies
  ensure_node
  install_global_npm_tools "${global_npm_tools[@]}"
  link_into_local_bin "$tools_dir/bin/tree-sitter" tree-sitter
  link_into_local_bin "$tools_dir/bin/bash-language-server" bash-language-server
  link_into_local_bin "$tools_dir/bin/biome" biome
  run_module yazi
  install_neovim
  install_lua_language_server
  link_configuration
  install_spell_files
  sync_plugins_and_tools
}

main "$@"
