#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly config_dir="$HOME/.config/tmux"
readonly tpm_dir="$HOME/.tmux/plugins/tpm"
readonly tpm_repository="https://github.com/tmux-plugins/tpm"
readonly tpm_revision="e261deb1b47614eed3400089ce7197dc68acc4eb"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

install_tpm() {
  if [ ! -d "$tpm_dir/.git" ]; then
    mkdir -p "$(dirname "$tpm_dir")"
    git clone --quiet "$tpm_repository" "$tpm_dir"
  fi
  git -C "$tpm_dir" fetch --quiet origin "$tpm_revision"
  git -C "$tpm_dir" checkout --quiet "$tpm_revision"
}

main() {
  prepare_environment
  apt_install_missing tmux:tmux
  mkdir -p "$config_dir"
  ln -sfn "$module_dir/tmux.conf" "$config_dir/tmux.conf"
  install_tpm
  log "Installing tmux plugins"
  "$tpm_dir/bin/install_plugins"
}

main "$@"
