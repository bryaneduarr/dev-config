# Pi harness
- Stamp: 2026-10-28 UTC, rev 2df21a9, many uncommitted changes (code in flux).
- [Installer](../../../modules/pi/install.sh): npm ci of [package.json](../../../modules/pi/package.json) into ~/.pi/agent/npm, applies [patches](../../../modules/pi/pi-tools/patches), copies config.
- Launcher: [bin/pi](../../../modules/pi/bin/pi).
- Entry: [harness.extension.ts](../../../modules/pi/agent-configuration/harness/harness.extension.ts); also extensions, settings, themes, skills (runtime product files).
- Settings rendered by scripts/render-settings.mjs.
- Large; only roots mapped.
