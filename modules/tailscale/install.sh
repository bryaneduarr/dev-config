#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly tailscale_repository_url="https://pkgs.tailscale.com/stable/ubuntu"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

add_tailscale_repository() {
  local codename
  codename="$(sed -n 's/^VERSION_CODENAME=//p' /etc/os-release)"
  [ -n "$codename" ] || fail "cannot read VERSION_CODENAME from /etc/os-release"

  log "Adding the Tailscale apt repository for $codename"
  curl -fsSL "$tailscale_repository_url/$codename.noarmor.gpg" |
    run_privileged tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
  curl -fsSL "$tailscale_repository_url/$codename.tailscale-keyring.list" |
    run_privileged tee /etc/apt/sources.list.d/tailscale.list >/dev/null
}

is_logged_in_to_tailnet() {
  tailscale status >/dev/null 2>&1
}

main() {
  prepare_environment
  add_tailscale_repository
  apt_install_missing_packages tailscale
  run_privileged systemctl enable --now tailscaled

  if is_logged_in_to_tailnet; then
    log "Enabling Tailscale SSH (sudo may ask for your password)"
    run_privileged tailscale set --ssh --operator="$USER"
  else
    log "Log in with the URL Tailscale prints next"
    run_privileged tailscale up --ssh --operator="$USER"
  fi
  log "Tailscale SSH enabled. From another tailnet machine: ssh $USER@$(tailscale ip -4)"
}

main "$@"
