#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly config_dir="$HOME/.config/yazi"
readonly plugins_repository="https://github.com/yazi-rs/plugins"
readonly plugins_revision="e0bbd205de9759e7aa81857e1ff616eb5123e305"
readonly plugins_dir="$config_dir/plugins"
readonly -a plugin_names=(full-border git)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

install_yazi_binary() {
  if has_command yazi; then
    log "Yazi already installed"
    return
  fi
  log "Installing Yazi into $local_bin_dir"
  local work_dir release_name
  release_name="yazi-$release_architecture-unknown-linux-gnu"
  work_dir="$(mktemp -d)"
  curl -fsSL "https://github.com/sxyazi/yazi/releases/latest/download/$release_name.zip" \
    -o "$work_dir/yazi.zip"
  unzip -q "$work_dir/yazi.zip" -d "$work_dir"
  install -m 755 "$work_dir/$release_name/yazi" "$local_bin_dir/yazi"
  install -m 755 "$work_dir/$release_name/ya" "$local_bin_dir/ya"
  rm -rf "$work_dir"
}

install_plugins() {
  local work_dir plugin_name
  work_dir="$(mktemp -d)"
  git clone --quiet "$plugins_repository" "$work_dir/plugins"
  git -C "$work_dir/plugins" checkout --quiet "$plugins_revision"
  mkdir -p "$plugins_dir"
  for plugin_name in "${plugin_names[@]}"; do
    rm -rf "$plugins_dir/$plugin_name.yazi"
    cp -r "$work_dir/plugins/$plugin_name.yazi" "$plugins_dir/$plugin_name.yazi"
  done
  rm -rf "$work_dir"
}

main() {
  prepare_environment
  apt_install_missing fzf:fzf file:file ffmpegthumbnailer:ffmpegthumbnailer convert:imagemagick pdftoppm:poppler-utils 7zz:7zip
  install_yazi_binary
  mkdir -p "$config_dir"
  ln -sfn "$module_dir/yazi.toml" "$config_dir/yazi.toml"
  ln -sfn "$module_dir/init.lua" "$config_dir/init.lua"
  install_plugins
}

main "$@"
