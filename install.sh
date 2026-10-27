#!/usr/bin/env bash
set -euo pipefail

readonly repository_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly -a all_modules=(herdr tmux yazi neovim pi)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

usage() {
  printf 'usage: ./install.sh [all | %s ...]\n' "${all_modules[*]}"
}

is_known_module() {
  local candidate module
  candidate="$1"
  for module in "${all_modules[@]}"; do
    [ "$module" = "$candidate" ] && return 0
  done
  return 1
}

main() {
  local -a requested=("$@")
  [ "${#requested[@]}" -gt 0 ] || { usage; exit 1; }
  [ "${requested[0]}" != all ] || requested=("${all_modules[@]}")

  local module
  for module in "${requested[@]}"; do
    is_known_module "$module" || { usage; fail "unknown module: $module"; }
  done
  for module in "${requested[@]}"; do
    log "Module: $module"
    run_module "$module"
  done
  log "Done"
}

main "$@"
