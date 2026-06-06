// Metro config. This app keeps its own node_modules (it is intentionally NOT an
// npm workspace member), so we pin resolution here to avoid Metro walking up to
// the repo root and pulling a second copy of React / React Native.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
