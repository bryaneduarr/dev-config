#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly latest_release_url="https://github.com/oven-sh/bun/releases/latest"
readonly release_tag_prefix="bun-v"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

readonly bun_dir="$data_dir/bun"

# Bun names its x86_64 build x64 but keeps uname's aarch64 for arm64.
case "$release_architecture" in
  x86_64) readonly bun_release_name=bun-linux-x64 ;;
  aarch64) readonly bun_release_name=bun-linux-aarch64 ;;
esac

read_latest_bun_version() {
  local release_page_url
  release_page_url="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$latest_release_url")"
  printf '%s\n' "${release_page_url##*/"$release_tag_prefix"}"
}

read_installed_bun_version() {
  [ -x "$bun_dir/bun" ] && "$bun_dir/bun" --version
}

install_bun_release() {
  local version="$1"
  local release_url work_dir
  release_url="https://github.com/oven-sh/bun/releases/download/$release_tag_prefix$version"
  work_dir="$(mktemp -d)"

  log "Downloading Bun $version ($bun_release_name)"
  curl -fsSL "$release_url/SHASUMS256.txt" -o "$work_dir/SHASUMS256.txt"
  curl -fsSL "$release_url/$bun_release_name.zip" -o "$work_dir/$bun_release_name.zip"
  (cd "$work_dir" && grep " $bun_release_name\.zip\$" SHASUMS256.txt | sha256sum --check --status) ||
    fail "checksum mismatch for $bun_release_name.zip"

  unzip -q "$work_dir/$bun_release_name.zip" -d "$work_dir"
  rm -rf "$bun_dir"
  mkdir -p "$bun_dir"
  install -m 755 "$work_dir/$bun_release_name/bun" "$bun_dir/bun"
  rm -rf "$work_dir"
}

main() {
  prepare_environment
  local latest_version installed_version
  latest_version="$(read_latest_bun_version)"
  [ -n "$latest_version" ] || fail "could not read the latest Bun version from $latest_release_url"
  installed_version="$(read_installed_bun_version || true)"

  if [ "$installed_version" = "$latest_version" ]; then
    log "Bun $latest_version already installed in $bun_dir"
  else
    install_bun_release "$latest_version"
  fi
  link_into_local_bin "$bun_dir/bun" bun
  link_into_local_bin "$bun_dir/bun" bunx
}

main "$@"
