// frontend/.eslintrc.cjs
module.exports = {
	// ignore CSS and coverage artifacts
	ignorePatterns: ["**/*.css", "coverage/**"],
      
	parserOptions: {
	  ecmaVersion: "latest",
	  sourceType:   "module",
	  ecmaFeatures: { jsx: true }
	},
      
	env: {
	  browser: true,
	  node:    true,
	  jest:    true,
	  es2021:  true
	},
      
	settings: {
	  react: { version: "detect" }
	},
      
	extends: [
	  "eslint:recommended",
	  "plugin:react/recommended"
	],
      
	plugins: [
	  "react"
	],
      
	rules: {
	  'react/react-in-jsx-scope': 'off',
	}
      };
      