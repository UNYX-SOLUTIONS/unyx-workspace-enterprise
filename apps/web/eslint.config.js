import config from "@unyx/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  ...config,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          allowExportNames: ["AuthContext", "ThemeContext", "ToastContext"],
        },
      ],
    },
  },
];
