#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly -a global_npm_tools=(agent-browser@latest)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

main() {
  prepare_environment
  ensure_node
  install_global_npm_tools "${global_npm_tools[@]}"
  link_into_local_bin "$tools_dir/bin/agent-browser" agent-browser
  log "Downloading the browser agent-browser drives"
  agent-browser install
  log "agent-browser installed. Run: agent-browser --help"
}

main "$@"
