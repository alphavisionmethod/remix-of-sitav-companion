import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import noImportInImport from "./eslint-rules/no-import-in-import.js";

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
      "sita-custom": { rules: { "no-import-in-import": noImportInImport } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "sita-custom/no-import-in-import": "error",
      "no-restricted-imports": ["warn", {
        "patterns": [
          // ── Backend plane: core-services ──
          { "group": ["@/lib/core-services/*"], "message": "Use @/planes/backend barrel instead." },
          // ── OS plane: nova-sdk ──
          { "group": ["@/lib/nova-sdk/*"], "message": "Use @/planes/os barrel instead." },
          // ── Backend plane: platform-plane ──
          { "group": ["@/lib/platform-plane/*"], "message": "Use @/planes/admin or @/planes/founder barrel instead." },
          // ── OS plane: os-services ──
          { "group": ["@/lib/os-services/*"], "message": "Use @/planes/os barrel instead." },
          // ── OS plane: os-security ──
          { "group": ["@/lib/os-security/*"], "message": "Use @/planes/os barrel instead." },
          // ── Backend plane: cloud-backbone ──
          { "group": ["@/lib/cloud-backbone/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: persistence ──
          { "group": ["@/lib/persistence/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: observability ──
          { "group": ["@/lib/observability/*"], "message": "Use @/planes/backend barrel instead." },
          // ── OS plane: sync-engine ──
          { "group": ["@/lib/sync-engine/*"], "message": "Use @/planes/os barrel instead." },
          // ── Backend plane: sovereign-ai-gateway ──
          { "group": ["@/lib/sovereign-ai-gateway/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: advisor-intelligence ──
          { "group": ["@/lib/advisor-intelligence/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: strategic-intelligence ──
          { "group": ["@/lib/strategic-intelligence/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: boardroom ──
          { "group": ["@/lib/boardroom/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: domain-engines ──
          { "group": ["@/lib/domain-engines/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: compute-governance ──
          { "group": ["@/lib/compute-governance/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: ai-engineering ──
          { "group": ["@/lib/ai-engineering/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Internal tools: simulation ──
          { "group": ["@/lib/simulation/*"], "message": "Use internal-tools barrel instead." },
          // ── Internal tools: fip ──
          { "group": ["@/lib/fip/*"], "message": "Use internal-tools barrel instead." },
          // ── Admin AI ──
          { "group": ["@/lib/admin-ai/*"], "message": "Use @/planes/admin barrel instead." },
          // ── Backend plane: intelligence-architecture ──
          { "group": ["@/lib/intelligence-architecture/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: advisor-protocol ──
          { "group": ["@/lib/advisor-protocol/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: detection ──
          { "group": ["@/lib/detection/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: verification ──
          { "group": ["@/lib/verification/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: no-hallucination ──
          { "group": ["@/lib/no-hallucination/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: dual-reality ──
          { "group": ["@/lib/dual-reality/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: shopify ──
          { "group": ["@/lib/shopify/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: internal-agents ──
          { "group": ["@/lib/internal-agents/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: platform-law ──
          { "group": ["@/lib/platform-law/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: capabilities ──
          { "group": ["@/lib/capabilities/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Backend plane: delivery-methodology ──
          { "group": ["@/lib/delivery-methodology/*"], "message": "Use @/planes/backend barrel instead." },
          // ── Internal tools: demo-data ──
          { "group": ["@/lib/demo-data/*"], "message": "Demo data must not leak into production code." },
          // ── Internal tools: mock-data ──
          { "group": ["@/lib/mock-data/*"], "message": "Mock data must not leak into production code." },
          // ── Internal tools: demo-scenarios ──
          { "group": ["@/lib/demo-scenarios/*"], "message": "Demo scenarios must not leak into production code." },
          // ── Internal tools: seed ──
          { "group": ["@/lib/seed/*"], "message": "Seed data must not leak into production code." },
          // ── Internal tools: reality-audit ──
          { "group": ["@/lib/reality-audit/*"], "message": "Use internal-tools barrel instead." },
          // ── Internal tools: reality-records ──
          { "group": ["@/lib/reality-records/*"], "message": "Use internal-tools barrel instead." },
        ]
      }],
    },
  },
);
