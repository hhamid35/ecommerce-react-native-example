const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // @expo/vector-icons resolves at runtime but uses a package "exports" field
    // that eslint-plugin-import's node resolver can't follow; treat it as resolvable.
    settings: {
      "import/core-modules": ["@expo/vector-icons"],
    },
  },
  { ignores: ["dist/*", "node_modules/*", "mock-server/*"] },
]);
