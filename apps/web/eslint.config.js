import baseConfig from "@unyx/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  ...baseConfig,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none", ignoreRestSiblings: true }],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
