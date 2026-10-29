#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly cargo_bin_dir="$HOME/.cargo/bin"
readonly cargo_binstall_version=1.26.1
readonly -a rust_components=(clippy rustfmt rust-analyzer)
readonly -a rust_targets=(wasm32-unknown-unknown aarch64-unknown-linux-gnu aarch64-linux-android x86_64-linux-android)
readonly -a cargo_tools=(dioxus-cli@0.7.10 just@1.59.0 bacon@3.26.0 cargo-nextest@0.9.150 cargo-zigbuild@0.24.0)
readonly -a desktop_webview_packages=(
  build-essential pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev
  libayatana-appindicator3-dev librsvg2-dev libxdo-dev
)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

install_rustup() {
  if has_command rustup; then
    log "rustup already installed"
    return
  fi
  log "Installing rustup"
  curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none
}

main() {
  prepare_environment
  apt_install_missing_packages "${desktop_webview_packages[@]}"
  export PATH="$cargo_bin_dir:$PATH"
  install_rustup
  log "Installing the stable Rust toolchain"
  rustup toolchain install stable --profile minimal
  rustup default stable
  rustup component add "${rust_components[@]}"
  rustup target add "${rust_targets[@]}"
  cargo install --locked "cargo-binstall@$cargo_binstall_version"
  cargo binstall --no-confirm --locked "${cargo_tools[@]}"
  ensure_zig
  log "Rust installed. Open a new shell, then run: dx --version"
}

main "$@"
