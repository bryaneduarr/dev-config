: "${repository_dir:?set by the caller}"
readonly data_dir="${DEV_CONFIG_DATA_DIR:-$HOME/.local/share/dev-config}"
readonly node_dir="$data_dir/node"
readonly tools_dir="$data_dir/tools"
readonly local_bin_dir="$HOME/.local/bin"
readonly required_node_major=24
# Herdr's vendored libghostty-vt only builds with this exact Zig version.
readonly required_zig_version=0.16.0
readonly node_architecture=x64
readonly release_architecture=x86_64
readonly zig_dir="$data_dir/zig"

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
fail() {
  printf '\033[1;31merror:\033[0m %s\n' "$*" >&2
  exit 1
}

run_privileged() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

apt_install_missing() {
  local -a missing=()
  local pair
  for pair in "$@"; do
    has_command "${pair%%:*}" || missing+=("${pair#*:}")
  done
  install_apt_packages "${missing[@]}"
}

apt_install_missing_packages() {
  local -a missing=()
  local package
  for package in "$@"; do
    is_apt_package_installed "$package" || missing+=("$package")
  done
  install_apt_packages "${missing[@]}"
}

is_apt_package_installed() {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q 'install ok installed'
}

install_apt_packages() {
  [ "$#" -gt 0 ] || return 0
  log "Installing with apt: $* (sudo may ask for your password)"
  run_privileged apt-get update
  run_privileged apt-get install -y "$@"
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

  local release_url archive_name work_dir
  release_url="https://nodejs.org/dist/latest-v${required_node_major}.x"
  work_dir="$(mktemp -d)"

  log "Downloading Node.js $required_node_major ($node_architecture)"
  curl -fsSL "$release_url/SHASUMS256.txt" -o "$work_dir/SHASUMS256.txt"
  archive_name="$(grep -oE "node-v[0-9.]+-linux-$node_architecture\.tar\.xz" "$work_dir/SHASUMS256.txt" | head -n 1)"
  [ -n "$archive_name" ] || fail "no Node.js $required_node_major archive for $node_architecture"
  curl -fsSL "$release_url/$archive_name" -o "$work_dir/$archive_name"
  (cd "$work_dir" && grep " $archive_name\$" SHASUMS256.txt | sha256sum --check --status) ||
    fail "checksum mismatch for $archive_name"

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

ensure_zig() {
  if [ -x "$zig_dir/zig" ] && [ "$("$zig_dir/zig" version)" = "$required_zig_version" ]; then
    log "Zig $required_zig_version already installed in $zig_dir"
    link_into_local_bin "$zig_dir/zig" zig
    return
  fi

  local zig_target index_url work_dir tarball_url expected_sha
  zig_target="$release_architecture-linux"
  index_url="https://ziglang.org/download/index.json"
  work_dir="$(mktemp -d)"

  apt_install_missing jq:jq xz:xz-utils
  log "Downloading Zig $required_zig_version ($zig_target)"
  curl -fsSL "$index_url" -o "$work_dir/index.json"
  tarball_url="$(jq -r --arg v "$required_zig_version" --arg a "$zig_target" '.[$v][$a].tarball // empty' "$work_dir/index.json")"
  expected_sha="$(jq -r --arg v "$required_zig_version" --arg a "$zig_target" '.[$v][$a].shasum // empty' "$work_dir/index.json")"
  [ -n "$tarball_url" ] && [ -n "$expected_sha" ] || fail "no Zig $required_zig_version download for $zig_target"
  curl -fsSL "$tarball_url" -o "$work_dir/zig.tar.xz"
  printf '%s  %s\n' "$expected_sha" "$work_dir/zig.tar.xz" | sha256sum --check --status ||
    fail "checksum mismatch for the Zig download"

  rm -rf "$zig_dir"
  mkdir -p "$zig_dir"
  tar -xJf "$work_dir/zig.tar.xz" -C "$zig_dir" --strip-components=1
  rm -rf "$work_dir"
  link_into_local_bin "$zig_dir/zig" zig
}

install_global_npm_tools() {
  log "Installing npm tools into $tools_dir: $*"
  npm install --global --prefix "$tools_dir" --allow-scripts=@ast-grep/cli --allow-scripts=bun --no-audit --no-fund "$@"
}

run_module() {
  bash "$repository_dir/modules/$1/install.sh"
}

link_into_local_bin() {
  mkdir -p "$local_bin_dir"
  ln -sf "$1" "$local_bin_dir/$2"
}
