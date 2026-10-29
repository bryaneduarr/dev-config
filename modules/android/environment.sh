# shellcheck shell=bash
# The SDK path must match data_dir in lib/common.sh.
export ANDROID_HOME="${DEV_CONFIG_DATA_DIR:-$HOME/.local/share/dev-config}/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.14206865"
export NDK_HOME="$ANDROID_NDK_HOME"
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
