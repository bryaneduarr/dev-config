# Sourced by install.sh and every module installer.

: "${repository_dir:?set by the caller}"
readonly data_dir="${DEV_CONFIG_DATA_DIR:-$HOME/.local/share/dev-config}"
readonly node_dir="$data_dir/node"
readonly tools_dir="$data_dir/tools"
readonly local_bin_dir="$HOME/.local/bin"
readonly required_node_major=24

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

run_privileged() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

# Arguments are command:package pairs; installs the packages whose command is absent.
apt_install_missing() {
  local -a missing=()
  local pair
  for pair in "$@"; do
    has_command "${pair%%:*}" || missing+=("${pair#*:}")
  done
  [ "${#missing[@]}" -gt 0 ] || return 0
  log "Installing with apt: ${missing[*]} (sudo may ask for your password)"
  run_privileged apt-get update
  run_privileged apt-get install -y "${missing[@]}"
}

node_architecture() {
  case "$(uname -m)" in
    x86_64) echo x64 ;;
    aarch64 | arm64) echo arm64 ;;
    *) fail "unsupported CPU architecture: $(uname -m)" ;;
  esac
}

github_release_architecture() {
  case "$(uname -m)" in
    x86_64) echo x86_64 ;;
    aarch64 | arm64) echo aarch64 ;;
    *) fail "unsupported CPU architecture: $(uname -m)" ;;
  esac
}

prepare_environment() {
  mkdir -p "$data_dir" "$local_bin_dir"
  apt_install_missing curl:curl rsync:rsync xz:xz-utils unzip:unzip xxd:xxd git:git
  export PATH="$node_dir/bin:$tools_dir/bin:$local_bin_dir:$PATH"
}

ensure_node() {
  local current_major=""
  [ -x "$node_dir/bin/node" ] && current_major="$("$node_dir/bin/node" -p 'process.versions.node.split(".")[0]')"
  if [ "$current_major" = "$required_node_major" ]; then
    log "Node.js $required_node_major already installed in $node_dir"
    link_node_commands
    return
  fi

  local architecture release_url archive_name work_dir
  architecture="$(node_architecture)"
  release_url="https://nodejs.org/dist/latest-v${required_node_major}.x"
  work_dir="$(mktemp -d)"

  log "Downloading Node.js $required_node_major ($architecture)"
  curl -fsSL "$release_url/SHASUMS256.txt" -o "$work_dir/SHASUMS256.txt"
  archive_name="$(grep -oE "node-v[0-9.]+-linux-$architecture\.tar\.xz" "$work_dir/SHASUMS256.txt" | head -n 1)"
  [ -n "$archive_name" ] || fail "no Node.js $required_node_major archive for $architecture"
  curl -fsSL "$release_url/$archive_name" -o "$work_dir/$archive_name"
  (cd "$work_dir" && grep " $archive_name\$" SHASUMS256.txt | sha256sum --check --status) \
    || fail "checksum mismatch for $archive_name"

  rm -rf "$node_dir"
  mkdir -p "$node_dir"
  tar -xJf "$work_dir/$archive_name" -C "$node_dir" --strip-components=1
  rm -rf "$work_dir"
  link_node_commands
}

link_node_commands() {
  local command_name
  for command_name in node npm npx; do
    link_into_local_bin "$node_dir/bin/$command_name" "$command_name"
  done
}

install_global_npm_tools() {
  log "Installing npm tools into $tools_dir: $*"
  npm install --global --prefix "$tools_dir" --allow-scripts=@ast-grep/cli --no-audit --no-fund "$@"
}

run_module() {
  bash "$repository_dir/modules/$1/install.sh"
}

link_into_local_bin() {
  mkdir -p "$local_bin_dir"
  ln -sf "$1" "$local_bin_dir/$2"
}
