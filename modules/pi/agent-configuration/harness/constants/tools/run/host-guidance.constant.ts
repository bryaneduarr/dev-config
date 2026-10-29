export const OS_RELEASE_PATH = "/etc/os-release";

/** Defaults the os-release specification defines for a missing ID or PRETTY_NAME. */
export const OS_RELEASE_DEFAULT_ID = "linux";
export const OS_RELEASE_DEFAULT_PRETTY_NAME = "Linux";

export const NIXOS_RELEASE_ID = "nixos";

export const NIXOS_DESCRIPTION_NOTE =
  "The host is NixOS: run missing tools with `nix shell nixpkgs#<package> -c <command>`.";

export const NIXOS_MISSING_COMMAND_HINT =
  "command not found: this is NixOS, so use `nix shell nixpkgs#<package> -c <command>` instead of apt, pip, or global installs; find the package with `nix search nixpkgs <name>`.";

/** Tools worth naming to the model when the host has them; each is probed on PATH. */
export const OPTIONAL_HOST_TOOLS = ["xxd", "dig", "lsof", "pstree", "brotli"] as const;
