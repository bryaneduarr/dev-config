#!/usr/bin/env bash
set -euo pipefail

readonly module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly source_url="https://github.com/herdrdev/herdr"
readonly herdr_version="v0.9.5"
readonly config_dir="$HOME/.config/herdr"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

# Upstream Herdr has no tab bar toggle, so build it with patches/toggle-tab-bar.patch.
build_patched_herdr() {
  local build_dir
  build_dir="$(mktemp -d)"
  trap 'rm -rf "$build_dir"' RETURN
  apt_install_missing cc:build-essential pkg-config:pkg-config
  if ! has_command cargo && [ ! -x "$HOME/.cargo/bin/cargo" ]; then
    log "Installing the Rust toolchain with rustup"
    curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none
  fi
  export PATH="$HOME/.cargo/bin:$PATH"
  log "Building Herdr $herdr_version with the tab bar toggle patch"
  git clone -q --depth 1 --branch "$herdr_version" "$source_url" "$build_dir/herdr"
  git -C "$build_dir/herdr" apply "$module_dir/patches/toggle-tab-bar.patch"
  (cd "$build_dir/herdr" && cargo build --release --locked)
  install -m 755 "$build_dir/herdr/target/release/herdr" "$local_bin_dir/herdr"
}

main() {
  prepare_environment
  if has_command herdr && HERDR_CONFIG_PATH="$module_dir/config.toml" herdr config check 2>&1 | grep -q 'config: ok'; then
    log "Patched Herdr already installed"
  else
    build_patched_herdr
  fi
  mkdir -p "$config_dir"
  if [ -e "$config_dir/config.toml" ] && ! cmp -s "$module_dir/config.toml" "$config_dir/config.toml"; then
    cp "$config_dir/config.toml" "$config_dir/config.toml.pre-dev-config"
    warn "backed up existing Herdr config to $config_dir/config.toml.pre-dev-config"
  fi
  cp "$module_dir/config.toml" "$config_dir/config.toml"
}

main "$@"
