#!/usr/bin/env bash
set -euo pipefail

repository_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly repository_dir
readonly -a all_modules=(rust android herdr tmux yazi neovim pi agents bash bun rule-audit check-code update-packages agent-browser)
# Google publishes the Linux Android emulator, NDK, and platform-tools for x86_64 hosts only.
readonly -a x86_64_only_modules=(android)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

usage() {
  printf 'usage: ./install.sh [all | %s ...]\n' "${all_modules[*]}"
}

is_listed() {
  local candidate entry
  candidate="$1"
  shift
  for entry in "$@"; do
    [ "$entry" = "$candidate" ] && return 0
  done
  return 1
}

is_supported_on_this_architecture() {
  [ "$release_architecture" = x86_64 ] || ! is_listed "$1" "${x86_64_only_modules[@]}"
}

modules_supported_on_this_architecture() {
  local module
  for module in "${all_modules[@]}"; do
    if is_supported_on_this_architecture "$module"; then
      printf '%s\n' "$module"
    else
      warn "skipping $module: it needs an x86_64 machine"
    fi
  done
}

main() {
  local -a requested=("$@")
  [ "${#requested[@]}" -gt 0 ] || {
    usage
    exit 1
  }
  [ "${requested[0]}" != all ] || mapfile -t requested < <(modules_supported_on_this_architecture)

  local module
  for module in "${requested[@]}"; do
    is_listed "$module" "${all_modules[@]}" || {
      usage
      fail "unknown module: $module"
    }
    is_supported_on_this_architecture "$module" ||
      fail "$module needs an x86_64 machine; this one is $release_architecture"
  done
  for module in "${requested[@]}"; do
    log "Module: $module"
    run_module "$module"
  done
  log "Done"
}

main "$@"
