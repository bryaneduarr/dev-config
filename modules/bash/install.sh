#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly config_dir="$HOME/.config/bash"
readonly bashrc="$HOME/.bashrc"
# The line is written literally so the shell expands $HOME when .bashrc runs.
# shellcheck disable=SC2016
readonly source_line='[ -r "$HOME/.config/bash/aliases.sh" ] && . "$HOME/.config/bash/aliases.sh"'

source "$repository_dir/lib/common.sh"

main() {
  mkdir -p "$config_dir"
  ln -sfn "$module_dir/aliases.sh" "$config_dir/aliases.sh"
  touch "$bashrc"
  grep -qxF "$source_line" "$bashrc" || printf '%s\n' "$source_line" >>"$bashrc"
  log "Bash aliases installed. Open a new shell and type: c"
}

main "$@"
