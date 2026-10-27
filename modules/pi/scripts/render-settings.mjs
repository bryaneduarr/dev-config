import { readFileSync, writeFileSync } from "node:fs";

const EXTENSION_PACKAGE_NAMES = [
  "@ff-labs/pi-fff",
  "pi-lsp-adapter",
  "pi-tree-sitter",
  "pi-web-access",
  "pi-powerline-footer",
  "pi-claude-bridge",
];
const CODING_AGENT_PACKAGE_NAME = "@earendil-works/pi-coding-agent";

const [baseSettingsPath, packageManifestPath, outputPath] = process.argv.slice(2);
if (baseSettingsPath === undefined || packageManifestPath === undefined || outputPath === undefined) {
  throw new Error("usage: render-settings.mjs <base-settings.json> <package.json> <output.json>");
}

const baseSettings = JSON.parse(readFileSync(baseSettingsPath, "utf8"));
const { dependencies } = JSON.parse(readFileSync(packageManifestPath, "utf8"));

const pinnedVersionOf = (name) => {
  const version = dependencies[name];
  if (version === undefined) throw new Error(`${name} is not pinned in ${packageManifestPath}`);
  return version;
};

const settings = {
  ...baseSettings,
  lastChangelogVersion: pinnedVersionOf(CODING_AGENT_PACKAGE_NAME),
  packages: EXTENSION_PACKAGE_NAMES.map((name) => `npm:${name}@${pinnedVersionOf(name)}`),
};

writeFileSync(outputPath, `${JSON.stringify(settings, null, 2)}\n`);
