#!/usr/bin/env bash
# Prepares a fresh Ubuntu machine: updates the system, installs the basics,
# creates a user only if root is the sole account, and installs and tests Docker. Run as root; safe to re-run.
set -euo pipefail

username="${BOOTSTRAP_USER:-}"
readonly docker_repository="https://download.docker.com/linux/ubuntu"
readonly -a basic_packages=(
  ca-certificates curl wget gnupg git sudo build-essential unzip zip
  openssh-server software-properties-common unattended-upgrades
  vim htop jq tmux ufw
)
readonly -a docker_packages=(docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin)
readonly -a conflicting_packages=(docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc)

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

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
  systemctl enable --now ssh >/dev/null 2>&1 || true
  apt-get -y autoremove
}

# Reads from /dev/tty so the prompt also works when the script is piped into bash over SSH.
has_terminal() { [ -r /dev/tty ] && : </dev/tty 2>/dev/null; }

# Human accounts other than root: UID in the normal range with a real login shell.
existing_users() {
  awk -F: '$3 >= 1000 && $3 < 60000 && $7 !~ /(nologin|false)$/ { print $1 }' /etc/passwd
}

# Only asks for a new username when root is the machine's only user.
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
  if [ -s /root/.ssh/authorized_keys ]; then
    install -d -m 700 -o "$username" -g "$username" "/home/$username/.ssh"
    touch "/home/$username/.ssh/authorized_keys"
    cat /root/.ssh/authorized_keys >>"/home/$username/.ssh/authorized_keys"
    sort -u -o "/home/$username/.ssh/authorized_keys" "/home/$username/.ssh/authorized_keys"
    chown "$username:$username" "/home/$username/.ssh/authorized_keys"
    chmod 600 "/home/$username/.ssh/authorized_keys"
  fi
}

install_docker() {
  log "Installing Docker Engine from the official repository"
  curl -fsSI "$docker_repository/dists/$codename/Release" >/dev/null ||
    fail "Docker has no repository for '$codename' yet; re-run with DOCKER_SUITE=<older codename>, e.g. noble"
  apt-get remove -y "${conflicting_packages[@]}" >/dev/null 2>&1 || true

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "$docker_repository/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  cat >/etc/apt/sources.list.d/docker.sources <<SOURCES
Types: deb
URIs: $docker_repository
Suites: $codename
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
SOURCES

  apt-get update
  apt-get install -y "${docker_packages[@]}"
  systemctl enable --now docker
  usermod -aG docker "$username"
}

test_docker() {
  log "Testing Docker as root"
  docker run --rm hello-world | grep -q "Hello from Docker!" || fail "Docker test failed"
  log "Testing Docker as $username"
  sudo -u "$username" -g docker docker run --rm hello-world | grep -q "Hello from Docker!" ||
    fail "Docker test failed for $username"
  docker --version
  docker compose version
}

main() {
  require_ubuntu_root
  ask_username
  update_system
  create_user
  install_docker
  test_docker
  log "Done. Log in as $username (log out and back in once so the docker group applies)"
  [ ! -e /var/run/reboot-required ] || warn "a reboot is required: sudo reboot"
}

main "$@"
