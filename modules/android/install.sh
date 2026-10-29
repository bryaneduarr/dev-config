#!/usr/bin/env bash
set -euo pipefail

module_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly module_dir
repository_dir="$(cd "$module_dir/../.." && pwd)"
readonly repository_dir
readonly command_line_tools_archive="commandlinetools-linux-16111833_latest.zip"
readonly command_line_tools_sha1="e025545c62a8e64c7559119566a569fb1dec5f60"
readonly android_platform="android-36"
readonly system_image="system-images;$android_platform;google_apis;x86_64"
readonly virtual_device_name="pixel-7-$android_platform"
readonly virtual_device_profile="pixel_7"
readonly environment_link="$HOME/.config/android/environment.sh"
readonly bashrc="$HOME/.bashrc"
# The line is written literally so the shell expands $HOME when .bashrc runs.
# shellcheck disable=SC2016
readonly source_line='[ -r "$HOME/.config/android/environment.sh" ] && . "$HOME/.config/android/environment.sh"'

# shellcheck source=lib/common.sh
source "$repository_dir/lib/common.sh"
# shellcheck source=modules/android/environment.sh
source "$module_dir/environment.sh"

# Runs in a subshell so its cleanup trap cannot leak into the rest of the installer.
install_command_line_tools() (
  if [ -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    log "Android command-line tools already installed"
    return
  fi
  local work_dir
  work_dir="$(mktemp -d)"
  trap 'rm -rf "$work_dir"' EXIT
  log "Downloading Android command-line tools"
  curl -fsSL "https://dl.google.com/android/repository/$command_line_tools_archive" -o "$work_dir/tools.zip"
  printf '%s  %s\n' "$command_line_tools_sha1" "$work_dir/tools.zip" | sha1sum --check --status ||
    fail "checksum mismatch for $command_line_tools_archive"
  unzip -q "$work_dir/tools.zip" -d "$work_dir"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  mv "$work_dir/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
)

install_sdk_packages() {
  log "Accepting Android SDK licenses"
  sdkmanager --licenses >/dev/null < <(yes)
  log "Installing Android SDK packages"
  sdkmanager --install platform-tools emulator "platforms;$android_platform" \
    "ndk;$(basename "$ANDROID_NDK_HOME")" "$system_image"
}

create_virtual_device() {
  if avdmanager list avd -c | grep -qxF "$virtual_device_name"; then
    log "Android virtual device $virtual_device_name already exists"
    return
  fi
  log "Creating Android virtual device $virtual_device_name"
  echo no | avdmanager create avd --name "$virtual_device_name" --package "$system_image" --device "$virtual_device_profile"
}

allow_kvm_access() {
  id -nG "$USER" | grep -qw kvm && return 0
  log "Adding $USER to the kvm group"
  run_privileged usermod -aG kvm "$USER"
  warn "restart WSL (wsl --shutdown) before starting the emulator"
}

link_environment() {
  mkdir -p "$(dirname "$environment_link")"
  ln -sfn "$module_dir/environment.sh" "$environment_link"
  touch "$bashrc"
  grep -qxF "$source_line" "$bashrc" || printf '%s\n' "$source_line" >>"$bashrc"
}

main() {
  prepare_environment
  apt_install_missing_packages openjdk-17-jdk-headless
  install_command_line_tools
  install_sdk_packages
  create_virtual_device
  allow_kvm_access
  link_environment
  log "Android SDK installed. Open a new shell, then run: emulator -avd $virtual_device_name"
}

main "$@"
