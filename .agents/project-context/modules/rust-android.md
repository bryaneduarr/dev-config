# Rust and Android modules
- Stamp: 2026-10-28 UTC, rev dba7086 plus this change.
- [rust](../../../modules/rust/install.sh) owns rustup; [herdr](../../../modules/herdr/install.sh) runs it when cargo is missing. Stable, wasm/aarch64/Android targets, dx 0.7.10, just, bacon, nextest, zigbuild.
- [android](../../../modules/android/install.sh): JDK 17, SDK 36, NDK from [environment.sh](../../../modules/android/environment.sh), AVD pixel-7-android-36, kvm group. SDK is 7.8 GB.
- Checked: `./install.sh rust android` twice, both exit 0; commands resolve.
- Unchecked: herdr's fallback to rust; emulator boot.
- Consumer: ~/rust-bible (plan there).
