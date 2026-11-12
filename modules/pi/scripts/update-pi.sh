#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=modules/pi/install.sh
source "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/../install.sh"

readonly coding_agent_package=@earendil-works/pi-coding-agent
# Released in lockstep with pi-coding-agent; each is moved only when the same version exists for it.
readonly -a sibling_packages=(
  @earendil-works/pi-agent-core
  @earendil-works/pi-ai
  @earendil-works/pi-client
  @earendil-works/pi-protocol
  @earendil-works/pi-telemetry
  @earendil-works/pi-tui
)
readonly -a pin_files=(package.json package-lock.json)

backup_dir="$(mktemp -d)"
readonly backup_dir
update_succeeded=false

is_published() {
  [ -n "$(npm view "$1@$2" version 2>/dev/null)" ]
}

install_pinned_harness() {
  install_pi_packages
  apply_pi_patches
  install_configuration
}

pin_release() {
  local version="$1" package
  npm pkg set "dependencies.$coding_agent_package=$version"
  for package in "${sibling_packages[@]}"; do
    if is_published "$package" "$version"; then
      npm pkg set "dependencies.$package=$version"
    fi
  done
  npm install --package-lock-only --legacy-peer-deps --no-audit --no-fund
}

restore_previous_release() {
  local file
  if [ "$update_succeeded" != true ]; then
    warn "update failed; restoring the previous pinned release"
    for file in "${pin_files[@]}"; do
      cp "$backup_dir/$file" "$module_dir/$file"
    done
    install_pinned_harness
  fi
  rm -rf "$backup_dir"
}

update_pi() {
  local version="${1:-}" file
  [ -n "$version" ] || fail "usage: update-pi.sh <version>"
  is_published "$coding_agent_package" "$version" || fail "$coding_agent_package@$version is not published"

  prepare_environment
  for file in "${pin_files[@]}"; do
    cp "$module_dir/$file" "$backup_dir/$file"
  done
  trap restore_previous_release EXIT

  log "Pinning $coding_agent_package $version in $module_dir"
  (cd "$module_dir" && pin_release "$version")
  install_pinned_harness
  update_succeeded=true
  log "Pi updated to $version. Commit the new pins in $module_dir when ready."
}

update_pi "$@"
