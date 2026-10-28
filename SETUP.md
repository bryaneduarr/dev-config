# Setup

Brings a fresh Ubuntu machine to a working state from the command line: updates the system, installs the basics, picks the user for Docker access (creating one when root is the only account), installs the GitHub CLI (`gh`), installs Docker from its official repository (latest stable), and tests it. `bootstrap.sh` does all of it and is safe to re-run.

## 1. Run the bootstrap as root

Log in as `root` (or any sudo user) and fetch the repository:

    sudo apt-get update && sudo apt-get install -y git
    git clone https://github.com/bryaneduarr/dev-config.git
    cd dev-config
    sudo ./bootstrap.sh

The script:

1. Runs `apt update` and `apt full-upgrade`, then installs the basics: curl, wget, git, build-essential, openssh-server, unattended-upgrades, vim, htop, btop, fastfetch, jq, tmux, ufw and a few more.
2. Picks the user: the only existing regular account, the one you name when several exist, or a new one you name when root is the only user. A new account gets sudo rights; an existing one is left as is. For a new account it asks for a password on a terminal; without one, it grants passwordless sudo and warns you. It copies root's SSH `authorized_keys` so you can log in as the new user.
3. Adds the GitHub CLI's apt repository and installs `gh`.
4. Removes conflicting packages (`docker.io`, `podman-docker`, ...), adds Docker's apt repository, installs `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin` and `docker-compose-plugin`, enables the service, and adds the new user to the `docker` group.
5. Tests Docker by running `hello-world` as root and as the new user, then prints the Docker and Compose versions.

The prompts work over SSH. To skip the username prompt, run `sudo BOOTSTRAP_USER=<username> ./bootstrap.sh`.

If Docker has no repository for a brand-new Ubuntu release yet, the script stops and says so. Re-run with the previous release: `sudo DOCKER_SUITE=noble ./bootstrap.sh`.

## 2. Log in as the new user

    ssh <username>@<machine>

Log out and back in once so the `docker` group takes effect, then check:

    docker run --rm hello-world

Sign in to GitHub:

    gh auth login

Reboot if the script says one is required: `sudo reboot`.

## 3. Install the development environment

    cd ~ && git clone https://github.com/bryaneduarr/dev-config.git && cd dev-config
    ./install.sh all

See `README.md` for the modules. Run a single one with, for example, `./install.sh neovim`.

## 4. Keep it updated

    sudo apt-get update && sudo apt-get full-upgrade -y && sudo apt-get autoremove -y

Docker and `gh` update through the same command because their repositories are configured. `unattended-upgrades` applies security fixes automatically.
