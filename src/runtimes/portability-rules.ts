// ═══════════════════════════════════════════════════════════════
// SITA OS — Portability Rules
// Cross-tier import boundaries enforced by governance scripts.
// ═══════════════════════════════════════════════════════════════

export interface PortabilityRule {
  id: string;
  description: string;
  /** Glob-like prefix of the source path. */
  sourcePrefix: string;
  /** Forbidden import path patterns. */
  forbiddenImportPatterns: readonly string[];
  severity: "error" | "warning";
  remediation: string;
}

export const PORTABILITY_RULES: readonly PortabilityRule[] = [
  {
    id: "web-pages-cannot-import-appliance",
    description: "Web pages MUST NOT import appliance-runtime modules directly.",
    sourcePrefix: "src/pages/",
    forbiddenImportPatterns: [
      "@/runtimes/appliance/",
      "scripts/release/appliance/",
    ],
    severity: "error",
    remediation:
      "Route appliance interactions through a runtime-aware service that " +
      "degrades honestly via TierGate / useCapability().",
  },
  {
    id: "web-pages-cannot-import-electron-bridge-directly",
    description: "Web pages MUST NOT import Electron preload modules directly.",
    sourcePrefix: "src/pages/",
    forbiddenImportPatterns: [
      "electron/main",
      "electron/preload",
      "electron/fs-bridge",
    ],
    severity: "error",
    remediation:
      "Use the typed desktop bridge surface from `@/runtimes/desktop/electron-bridge-contract`.",
  },
  {
    id: "appliance-modules-cannot-import-pages",
    description: "Appliance modules MUST NOT import UI page code.",
    sourcePrefix: "src/lib/runtime/appliance/",
    forbiddenImportPatterns: [
      "@/pages/",
      "src/pages/",
    ],
    severity: "error",
    remediation: "Appliance modules must remain runtime-pure.",
  },
  {
    id: "simulation-must-not-import-host-bridge",
    description:
      "Simulated OS surfaces MUST NOT import desktop or appliance bridges — " +
      "they must read capabilities through the runtime context.",
    sourcePrefix: "src/lib/runtime/simulation/",
    forbiddenImportPatterns: [
      "electron/",
      "@/runtimes/desktop/electron-bridge-contract",
      "@/runtimes/appliance/",
    ],
    severity: "warning",
    remediation: "Consume capabilities via `useCapability()` from runtime-context.",
  },
];

export function getRulesForSource(sourcePath: string): readonly PortabilityRule[] {
  return PORTABILITY_RULES.filter((r) => sourcePath.startsWith(r.sourcePrefix));
}
