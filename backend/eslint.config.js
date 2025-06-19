import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
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

  // 2) All React files
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // spread in all of the recommended React rules
      ...pluginReact.configs.flat.recommended.rules,
    },
    settings: {
      react: { version: "detect" },
    },
  },
]);
