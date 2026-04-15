import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-imports": ["warn", {
        "patterns": [
          {
            "group": ["@/lib/core-services/*"],
            "message": "Use @/planes/backend barrel instead of direct core-services imports. See docs/architecture/MIGRATION-BLUEPRINT.md"
          },
          {
            "group": ["@/lib/nova-sdk/*"],
            "message": "Use @/planes/os barrel instead of direct nova-sdk imports. See docs/architecture/MIGRATION-BLUEPRINT.md"
          },
          {
            "group": ["@/lib/platform-plane/*"],
            "message": "Use @/planes/admin or @/planes/founder barrel instead of direct platform-plane imports."
          }
        ]
      }],
    },
  },
);
