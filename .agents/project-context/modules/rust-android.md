# Rust and Android modules
- Stamp: 2026-10-28 UTC, rev 9bea1c7 plus this change.
- [rust](../../../modules/rust/install.sh) owns rustup; [herdr](../../../modules/herdr/install.sh) runs it before every build.
- [android](../../../modules/android/install.sh): JDK 17, SDK 36, NDK from [environment.sh](../../../modules/android/environment.sh), AVD pixel-7-android-36, kvm group; 7.8 GB.
- Checked: `./install.sh rust android` twice, exit 0; herdr in an empty HOME installs rust, builds 0.9.5, reruns idempotently.
- Pitfall: Zig dependency fetches fail intermittently with NameServerFailure behind Tailscale DNS; rerun.
- Unchecked: emulator boot.
