# Machine
- Stamp: 2026-10-30 UTC, rev f950690 plus uncommitted arm64 support.
- User-confirmed: Ubuntu 26.04 WSL2, x86_64 and arm64; this machine is aarch64.
- Source: CPU detection in [lib/common.sh](../../../lib/common.sh); `x86_64_only_modules` in [install.sh](../../../install.sh).
- Checked: Google ships no Linux arm64 emulator, NDK, platform-tools; Mason clangd lacks linux arm64; Pi images are multi-arch.
- Nix rules kept for possible future .nix files; none exist.
- sudo needs a password; run installers only when asked.
