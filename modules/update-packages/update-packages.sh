#!/usr/bin/env bash
set -euo pipefail

script_path="$(readlink -f "${BASH_SOURCE[0]}")"
repository_dir="$(cd "$(dirname "$script_path")/../.." && pwd)"
readonly repository_dir

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

main() {
  log "Updating apt packages ($release_architecture)"
  run_privileged apt-get update
  run_privileged apt-get full-upgrade -y
  run_privileged apt-get autoremove -y
  run_module bun
  log "Packages are up to date"
}

main "$@"
