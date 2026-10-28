#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly -a global_npm_tools=(typescript @biomejs/biome @johnnymorganz/stylua-bin bun)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

main() {
  prepare_environment
  ensure_node
  apt_install_missing shellcheck:shellcheck shfmt:shfmt
  install_global_npm_tools "${global_npm_tools[@]}"
  run_module rule-audit
  has_command lua-language-server || warn "Lua checks need lua-language-server and nvim: run ./install.sh neovim"
  link_into_local_bin "$module_dir/check-code.sh" check-code
  log "check-code installed. Run: check-code [path ...]"
}

main "$@"
