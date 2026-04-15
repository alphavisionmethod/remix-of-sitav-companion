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
          // ── Backend plane: core-services ──
          {
            "group": ["@/lib/core-services/*"],
            "message": "Use @/planes/backend barrel instead of direct core-services imports. See docs/architecture/MIGRATION-BLUEPRINT.md"
          },
          // ── OS plane: nova-sdk ──
          {
            "group": ["@/lib/nova-sdk/*"],
            "message": "Use @/planes/os barrel instead of direct nova-sdk imports. See docs/architecture/MIGRATION-BLUEPRINT.md"
          },
          // ── Backend plane: platform-plane ──
          {
            "group": ["@/lib/platform-plane/*"],
            "message": "Use @/planes/admin or @/planes/founder barrel instead of direct platform-plane imports."
          },
          // ── OS plane: os-services ──
          {
            "group": ["@/lib/os-services/*"],
            "message": "Use @/planes/os barrel instead of direct os-services imports."
          },
          // ── OS plane: os-security ──
          {
            "group": ["@/lib/os-security/*"],
            "message": "Use @/planes/os barrel instead of direct os-security imports."
          },
          // ── Backend plane: cloud-backbone ──
          {
            "group": ["@/lib/cloud-backbone/*"],
            "message": "Use @/planes/backend barrel instead of direct cloud-backbone imports."
          },
          // ── Backend plane: persistence ──
          {
            "group": ["@/lib/persistence/*"],
            "message": "Use @/planes/backend barrel instead of direct persistence imports."
          },
          // ── Backend plane: observability ──
          {
            "group": ["@/lib/observability/*"],
            "message": "Use @/planes/backend barrel instead of direct observability imports."
          },
          // ── OS plane: sync-engine ──
          {
            "group": ["@/lib/sync-engine/*"],
            "message": "Use @/planes/os barrel instead of direct sync-engine imports."
          },
          // ── Backend plane: sovereign-ai-gateway ──
          {
            "group": ["@/lib/sovereign-ai-gateway/*"],
            "message": "Use @/planes/backend barrel instead of direct sovereign-ai-gateway imports."
          },
          // ── Backend plane: advisor-intelligence ──
          {
            "group": ["@/lib/advisor-intelligence/*"],
            "message": "Use @/planes/backend barrel instead of direct advisor-intelligence imports."
          },
          // ── Backend plane: strategic-intelligence ──
          {
            "group": ["@/lib/strategic-intelligence/*"],
            "message": "Use @/planes/backend barrel instead of direct strategic-intelligence imports."
          },
          // ── Backend plane: boardroom ──
          {
            "group": ["@/lib/boardroom/*"],
            "message": "Use @/planes/backend barrel instead of direct boardroom imports."
          },
          // ── Backend plane: domain-engines ──
          {
            "group": ["@/lib/domain-engines/*"],
            "message": "Use @/planes/backend barrel instead of direct domain-engines imports."
          },
          // ── Backend plane: compute-governance ──
          {
            "group": ["@/lib/compute-governance/*"],
            "message": "Use @/planes/backend barrel instead of direct compute-governance imports."
          },
          // ── Backend plane: ai-engineering ──
          {
            "group": ["@/lib/ai-engineering/*"],
            "message": "Use @/planes/backend barrel instead of direct ai-engineering imports."
          },
          // ── Internal tools: simulation ──
          {
            "group": ["@/lib/simulation/*"],
            "message": "Use internal-tools barrel or @/planes/shared instead of direct simulation imports."
          },
          // ── Internal tools: fip ──
          {
            "group": ["@/lib/fip/*"],
            "message": "Use internal-tools barrel instead of direct fip imports."
          },
          // ── Admin AI ──
          {
            "group": ["@/lib/admin-ai/*"],
            "message": "Use @/planes/admin barrel instead of direct admin-ai imports."
          },
        ]
      }],
    },
  },
);
