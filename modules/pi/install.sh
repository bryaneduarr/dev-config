#!/usr/bin/env bash
set -euo pipefail

readonly module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly web_research_dir="$HOME/.config/dev-config/web-research"
readonly pi_agent_dir="$HOME/.pi/agent"
readonly pi_packages_dir="$pi_agent_dir/npm"
readonly agent_configuration_dir="$module_dir/agent-configuration"
readonly patches_dir="$module_dir/pi-tools/patches"
readonly pi_coding_agent_dir="$pi_packages_dir/node_modules/@earendil-works/pi-coding-agent"
readonly searxng_image="docker.io/searxng/searxng@sha256:64936ab0847aae6494d37edf688ce792b262e8467d48ad844c0bf3f899a45249"
readonly crawl4ai_image="docker.io/unclecode/crawl4ai:0.9.4@sha256:9021b3cb5c6f12570bbcd5395638495e0a06969b3148e377b953d174af2ebc9b"
readonly -a global_npm_tools=(@vtsls/language-server typescript @ast-grep/cli)

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"

install_system_tools() {
  apt_install_missing jq:jq rg:ripgrep yq:yq docker:docker.io
  if ! has_command fd && ! has_command fdfind; then
    apt_install_missing fdfind:fd-find
  fi
  if ! has_command fd && has_command fdfind; then
    link_into_local_bin "$(command -v fdfind)" fd
  fi
}

docker_command() {
  if docker info >/dev/null 2>&1; then docker "$@"; else run_privileged docker "$@"; fi
}

write_secret_file() {
  local file="$1" variable="$2"
  [ -s "$file" ] || printf '%s=%s\n' "$variable" "$(head -c 32 /dev/urandom | xxd -p -c 64)" > "$file"
  chmod 600 "$file"
}

start_web_research_container() {
  local name="$1"
  shift
  docker_command rm -f "$name" >/dev/null 2>&1 || true
  docker_command run -d --name "$name" --restart unless-stopped "$@" >/dev/null
}

install_web_research() {
  log "Starting local SearXNG and Crawl4AI containers"
  run_privileged systemctl enable --now docker >/dev/null 2>&1 || true
  mkdir -p "$web_research_dir"
  chmod 700 "$web_research_dir"
  write_secret_file "$web_research_dir/searx.env" SEARX_SECRET_KEY
  write_secret_file "$web_research_dir/crawl4ai.env" CRAWL4AI_API_TOKEN

  local searx_secret
  searx_secret="$(sed -n 's/^SEARX_SECRET_KEY=//p' "$web_research_dir/searx.env")"
  cat > "$web_research_dir/searxng-settings.yml" <<SETTINGS
use_default_settings: true
search:
  formats:
    - html
    - json
server:
  bind_address: "0.0.0.0"
  port: 8080
  secret_key: "$searx_secret"
SETTINGS
  # The container runs as an unprivileged user, so the settings file must be readable.
  chmod 644 "$web_research_dir/searxng-settings.yml"

  start_web_research_container searxng \
    -p 127.0.0.1:8888:8080 \
    -v "$web_research_dir/searxng-settings.yml:/etc/searxng/settings.yml:ro" \
    "$searxng_image"
  start_web_research_container crawl4ai \
    -p 127.0.0.1:11235:11235 \
    --env-file "$web_research_dir/crawl4ai.env" \
    --shm-size=1g \
    "$crawl4ai_image"
}

install_pi_packages() {
  log "Installing pinned Pi packages into $pi_packages_dir"
  mkdir -p "$pi_packages_dir"
  cp "$module_dir/package.json" "$module_dir/package-lock.json" "$pi_packages_dir/"
  (cd "$pi_packages_dir" && npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund)
}

apply_patch() {
  local patch_file="$1" target_dir="$2"
  NODE_OPTIONS="--disable-warning=MODULE_TYPELESS_PACKAGE_JSON" node "$patches_dir/$patch_file" "$target_dir"
}

apply_pi_patches() {
  log "Applying harness patches"
  local -a coding_agent_patches=(
    pi-coding-agent/transcript-rendering/pi-hidden-assistant-spacing.patch.ts
    pi-coding-agent/turn-navigation/pi-turn-window.patch.ts
    pi-coding-agent/transcript-rendering/pi-api-error-renderer.patch.ts
    pi-coding-agent/transcript-rendering/pi-warning-box.patch.ts
    pi-coding-agent/transcript-rendering/pi-thinking-visibility.patch.ts
    pi-coding-agent/transcript-rendering/pi-thinking-box.patch.ts
    pi-coding-agent/turn-navigation/pi-jump-to-latest-indicator.patch.ts
    pi-coding-agent/turn-navigation/pi-scroll-on-submit.patch.ts
    pi-coding-agent/transcript-rendering/pi-message-cards.patch.ts
  )
  local patch_file
  for patch_file in "${coding_agent_patches[@]}"; do
    apply_patch "$patch_file" "$pi_coding_agent_dir"
  done
  apply_patch pi-extension-packages/pi-tree-sitter-grammars.patch.ts "$pi_packages_dir/node_modules/pi-tree-sitter"
  apply_patch pi-extension-packages/lsp-host-dependencies.patch.ts "$pi_packages_dir/node_modules/pi-lsp-adapter"
  apply_patch pi-extension-packages/powerline-empty-context.patch.ts "$pi_packages_dir/node_modules/pi-powerline-footer"
  apply_patch pi-extension-packages/powerline-input-card.patch.ts "$pi_packages_dir/node_modules/pi-powerline-footer"
}

install_language_tools() {
  install_global_npm_tools "${global_npm_tools[@]}"
}

copy_directory_without_tests() {
  local source_dir="$1" target_dir="$2"
  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  rsync -a --exclude '*.test.ts' --exclude '*.test-double.ts' "$source_dir/" "$target_dir/"
}

install_configuration() {
  log "Installing Pi configuration into $pi_agent_dir"
  local settings_dir="$agent_configuration_dir/settings"
  mkdir -p "$pi_agent_dir/extensions" "$pi_agent_dir/skills" "$pi_agent_dir/themes" "$HOME/.config/mcp"

  node "$module_dir/scripts/render-settings.mjs" \
    "$settings_dir/settings.json" "$module_dir/package.json" "$pi_agent_dir/settings.json"
  cp "$settings_dir/keybindings.json" "$pi_agent_dir/keybindings.json"
  cp "$settings_dir/claude-bridge.json" "$pi_agent_dir/claude-bridge.json"
  cp "$settings_dir/lsp.json" "$pi_agent_dir/lsp.json"
  cp "$settings_dir/pi-fff.json" "$pi_agent_dir/pi-fff.json"
  cp "$settings_dir/web-search.json" "$pi_agent_dir/web-search.json"
  [ -e "$HOME/.config/mcp/mcp.json" ] || cp "$settings_dir/mcp.json" "$HOME/.config/mcp/mcp.json"

  cp "$agent_configuration_dir/harness/instructions.md" "$pi_agent_dir/AGENTS.md"
  cp "$agent_configuration_dir/themes/catppuccin-mocha.json" "$pi_agent_dir/themes/catppuccin-mocha.json"
  mkdir -p "$pi_agent_dir/extensions/powerline-footer"
  cp "$agent_configuration_dir/themes/powerline.json" "$pi_agent_dir/extensions/powerline-footer/theme.json"

  mkdir -p "$pi_agent_dir/skills/efficient-repository-workflow"
  cp "$agent_configuration_dir/skills/efficient-tools/SKILL.md" "$pi_agent_dir/skills/efficient-repository-workflow/SKILL.md"
  mkdir -p "$pi_agent_dir/skills/web-research"
  cp "$agent_configuration_dir/skills/web-research/SKILL.md" "$pi_agent_dir/skills/web-research/SKILL.md"

  cp "$agent_configuration_dir/extensions/clear-session.extension.ts" "$pi_agent_dir/extensions/clear.ts"
  cp "$agent_configuration_dir/extensions/quiet-tool-output.extension.ts" "$pi_agent_dir/extensions/quiet-tools.ts"
  copy_directory_without_tests "$agent_configuration_dir/harness" "$pi_agent_dir/extensions/harness"
  copy_directory_without_tests "$agent_configuration_dir/extensions/last-model" "$pi_agent_dir/extensions/last-model"
  copy_directory_without_tests "$agent_configuration_dir/extensions/codex-fast-mode" "$pi_agent_dir/extensions/codex-fast-mode"
  # Pi resolves extension imports from real file paths, so node_modules must sit beside the copied sources.
  ln -s "$pi_packages_dir/node_modules" "$pi_agent_dir/extensions/codex-fast-mode/node_modules"
}

install_launcher() {
  link_into_local_bin "$module_dir/bin/pi" pi
}

main() {
  prepare_environment
  ensure_node
  install_system_tools
  run_module herdr
  install_pi_packages
  apply_pi_patches
  install_language_tools
  install_configuration
  install_web_research
  install_launcher
  log "Pi installed. Run: pi"
}

main "$@"
