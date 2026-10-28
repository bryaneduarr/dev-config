#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly install_dir="${DEV_CONFIG_DATA_DIR:-$HOME/.local/share/dev-config}/rule-audit"

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

install_sources() {
  log "Installing rule-audit into $install_dir"
  mkdir -p "$install_dir"
  rsync -a --delete \
    --exclude node_modules --exclude bin --exclude install.sh \
    --exclude biome.json --exclude knip.json --exclude tsconfig.json \
    --exclude '*.test.ts' --exclude '*.test-double.ts' \
    "$module_dir/" "$install_dir/"
  (cd "$install_dir" && npm ci --omit=dev --no-audit --no-fund)
}

main() {
  prepare_environment
  ensure_node
  install_sources
  link_into_local_bin "$module_dir/bin/rule-audit" rule-audit
  log "rule-audit installed. Run: rule-audit <typescript-project-directory> [<rule-file>]"
}

main "$@"
