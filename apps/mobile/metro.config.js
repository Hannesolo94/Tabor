// Metro config. This app keeps its own node_modules (it is intentionally NOT an
// npm workspace member), so we pin resolution here to avoid Metro walking up to
// the repo root and pulling a second copy of React / React Native.
// We DO let Metro see packages/shared (pure TS, no native deps) so the app uses
// the canonical @tabor/shared game engine instead of a divergent local copy.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const shared = path.resolve(__dirname, "../../packages/shared");

const config = getDefaultConfig(__dirname);
config.watchFolders = [shared];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "@tabor/shared": shared,
};

module.exports = config;
