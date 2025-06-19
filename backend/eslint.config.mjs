import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

const reactFlat = pluginReact.configs.flat?.recommended ?? {};
const {
  languageOptions: reactLang = {},
  rules: reactRules = {},
  settings: reactSettings = {},
} = reactFlat;

export default defineConfig([
  // 1) base JS rules
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.browser,
        ...reactLang.globals,
      },
    },
    rules: {
      ...reactRules
    },
    settings: {
      react: { version: "detect" },
      ...reactSettings
    },
  },
]);