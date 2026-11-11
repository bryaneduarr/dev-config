#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly latest_release_url="https://github.com/astral-sh/uv/releases/latest"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

readonly uv_dir="$data_dir/uv"
readonly uv_release_name="uv-$release_architecture-unknown-linux-gnu"

read_latest_uv_version() {
  local release_page_url
  release_page_url="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$latest_release_url")"
  printf '%s\n' "${release_page_url##*/}"
}

read_installed_uv_version() {
  [ -x "$uv_dir/uv" ] || return 1
  local version
  read -r _ version _ < <("$uv_dir/uv" --version)
  printf '%s\n' "$version"
}

install_uv_release() {
  local version="$1"
  local release_url work_dir
  release_url="https://github.com/astral-sh/uv/releases/download/$version"
  work_dir="$(mktemp -d)"

  log "Downloading uv $version ($uv_release_name)"
  curl -fsSL "$release_url/$uv_release_name.tar.gz.sha256" -o "$work_dir/$uv_release_name.tar.gz.sha256"
  curl -fsSL "$release_url/$uv_release_name.tar.gz" -o "$work_dir/$uv_release_name.tar.gz"
  (cd "$work_dir" && sha256sum --check --status "$uv_release_name.tar.gz.sha256") ||
    fail "checksum mismatch for $uv_release_name.tar.gz"

  rm -rf "$uv_dir"
  mkdir -p "$uv_dir"
  tar -xzf "$work_dir/$uv_release_name.tar.gz" -C "$uv_dir" --strip-components=1
  rm -rf "$work_dir"
}

main() {
  prepare_environment
  local latest_version installed_version
  latest_version="$(read_latest_uv_version)"
  [ -n "$latest_version" ] || fail "could not read the latest uv version from $latest_release_url"
  installed_version="$(read_installed_uv_version || true)"

  if [ "$installed_version" = "$latest_version" ]; then
    log "uv $latest_version already installed in $uv_dir"
  else
    install_uv_release "$latest_version"
  fi
  link_into_local_bin "$uv_dir/uv" uv
  link_into_local_bin "$uv_dir/uvx" uvx
}

main "$@"
