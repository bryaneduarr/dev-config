#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

main() {
  apt_install_missing ffmpeg:ffmpeg
  log "ffmpeg installed. Run: ffmpeg -version"
}

main "$@"
