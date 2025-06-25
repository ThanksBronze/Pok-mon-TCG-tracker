const { defineConfig } = require("eslint/config");
const js = require("@eslint/js");
const globals = require("globals");
const pluginReact = require("eslint-plugin-react");

module.exports = defineConfig([
  { ignores: ["coverage/**"] },
  // 1) Base JS + CommonJS config
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // your base rules
    },
  },
  // 2) React files
  {
    files: ["**/*.{js,jsx}"],
    plugins: { react: pluginReact },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
    },
    settings: {
      react: { version: "detect" },
    },
  },
]);