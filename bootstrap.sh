#!/usr/bin/env bash
set -euo pipefail

username="${BOOTSTRAP_USER:-}"
readonly keyrings_dir=/etc/apt/keyrings
readonly docker_repository="https://download.docker.com/linux/ubuntu"
readonly github_cli_repository="https://cli.github.com/packages"
readonly docker_test_output="Hello from Docker!"
readonly -a basic_packages=(
  ca-certificates curl wget gnupg git sudo build-essential unzip zip
  openssh-server software-properties-common unattended-upgrades
  vim htop btop fastfetch jq tmux ufw
)
readonly -a docker_packages=(docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin)
readonly -a conflicting_packages=(docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc)

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
fail() {
  printf '\033[1;31merror:\033[0m %s\n' "$*" >&2
  exit 1
}

require_ubuntu_root() {
  [ "$(id -u)" -eq 0 ] || fail "run as root: sudo ./bootstrap.sh"
  [ -r /etc/os-release ] || fail "cannot read /etc/os-release"
  # shellcheck disable=SC1091
  . /etc/os-release
  [ "${ID:-}" = ubuntu ] || fail "this script supports Ubuntu only (found ${ID:-unknown})"
  codename="${DOCKER_SUITE:-$VERSION_CODENAME}"
}

update_system() {
  export DEBIAN_FRONTEND=noninteractive
  log "Updating and upgrading the system"
  apt-get update
  apt-get -y full-upgrade
  log "Installing basic packages"
  apt-get install -y "${basic_packages[@]}"
  # The ssh unit may be missing or unmanaged, as on WSL without systemd.
  systemctl enable --now ssh >/dev/null 2>&1 || true
  apt-get -y autoremove
}

has_terminal() { [ -r /dev/tty ] && : </dev/tty 2>/dev/null; }

existing_users() {
  awk -F: '$3 >= 1000 && $3 < 60000 && $7 !~ /(nologin|false)$/ { print $1 }' /etc/passwd
}

ask_username() {
  if [ -z "$username" ]; then
    local -a users
    mapfile -t users < <(existing_users)
    case "${#users[@]}" in
      0)
        has_terminal || fail "no terminal to ask for the username; set BOOTSTRAP_USER=<name>"
        read -rp "Username to create for this machine: " username </dev/tty
        ;;
      1)
        username="${users[0]}"
        log "Using existing user $username"
        ;;
      *)
        has_terminal || fail "several users exist (${users[*]}); set BOOTSTRAP_USER=<name>"
        log "Existing users: ${users[*]}"
        read -rp "Which user should get Docker access? " username </dev/tty
        ;;
    esac
  fi
  [[ "$username" =~ ^[a-z_][a-z0-9_-]{0,31}$ ]] || fail "invalid username: '$username'"
  readonly username
}

create_user() {
  if id "$username" >/dev/null 2>&1; then
    log "User $username already exists; leaving the account as is"
    return
  fi
  log "Creating user $username"
  adduser --disabled-password --gecos "" "$username"
  usermod -aG sudo "$username"

  if has_terminal && [ -z "$(passwd -S "$username" | awk '$2 == "P"')" ]; then
    log "Set a password for $username"
    passwd "$username" </dev/tty
  elif ! has_terminal && [ ! -e "/etc/sudoers.d/90-$username" ]; then
    warn "no terminal to set a password; granting $username passwordless sudo (remove /etc/sudoers.d/90-$username later)"
    printf '%s ALL=(ALL) NOPASSWD:ALL\n' "$username" >"/etc/sudoers.d/90-$username"
    chmod 440 "/etc/sudoers.d/90-$username"
  fi

  # Reuse the SSH keys the machine was provisioned with so the new user can log in.
  local user_keys="/home/$username/.ssh/authorized_keys"
  if [ -s /root/.ssh/authorized_keys ]; then
    install -d -m 700 -o "$username" -g "$username" "/home/$username/.ssh"
    touch "$user_keys"
    cat /root/.ssh/authorized_keys >>"$user_keys"
    sort -u -o "$user_keys" "$user_keys"
    chown "$username:$username" "$user_keys"
    chmod 600 "$user_keys"
  fi
}

install_github_cli() {
  log "Installing the GitHub CLI from the official repository"
  install -m 0755 -d "$keyrings_dir"
  curl -fsSL "$github_cli_repository/githubcli-archive-keyring.gpg" -o "$keyrings_dir/githubcli-archive-keyring.gpg"
  chmod a+r "$keyrings_dir/githubcli-archive-keyring.gpg"
  cat >/etc/apt/sources.list.d/github-cli.sources <<SOURCES
Types: deb
URIs: $github_cli_repository
Suites: stable
Components: main
Architectures: $(dpkg --print-architecture)
Signed-By: $keyrings_dir/githubcli-archive-keyring.gpg
SOURCES

  apt-get update
  apt-get install -y gh
  gh --version | head -n 1
}

install_docker() {
  log "Installing Docker Engine from the official repository"
  curl -fsSI "$docker_repository/dists/$codename/Release" >/dev/null ||
    fail "Docker has no repository for '$codename' yet; re-run with DOCKER_SUITE=<older codename>, e.g. noble"
  # Most conflicting packages are not installed, which makes apt-get remove fail.
  apt-get remove -y "${conflicting_packages[@]}" >/dev/null 2>&1 || true

  install -m 0755 -d "$keyrings_dir"
  curl -fsSL "$docker_repository/gpg" -o "$keyrings_dir/docker.asc"
  chmod a+r "$keyrings_dir/docker.asc"
  cat >/etc/apt/sources.list.d/docker.sources <<SOURCES
Types: deb
URIs: $docker_repository
Suites: $codename
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: $keyrings_dir/docker.asc
SOURCES

  apt-get update
  apt-get install -y "${docker_packages[@]}"
  systemctl enable --now docker
  usermod -aG docker "$username"
}

test_docker() {
  log "Testing Docker as root"
  docker run --rm hello-world | grep -q "$docker_test_output" || fail "Docker test failed"
  log "Testing Docker as $username"
  sudo -u "$username" -g docker docker run --rm hello-world | grep -q "$docker_test_output" ||
    fail "Docker test failed for $username"
  docker --version
  docker compose version
}

main() {
  require_ubuntu_root
  ask_username
  update_system
  create_user
  install_github_cli
  install_docker
  test_docker
  log "Done. Log in as $username (log out and back in once so the docker group applies), then run: gh auth login"
  [ ! -e /var/run/reboot-required ] || warn "a reboot is required: sudo reboot"
}

main "$@"
