#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Output Map
// Maps generator scripts to their output artifacts
// ═══════════════════════════════════════════════════════════════

export interface ScriptOutput {
  script: string;
  outputs: string[];
  outputType: "json" | "markdown" | "config" | "deploy" | "release" | "report" | "side-effect";
}

export const SCRIPT_OUTPUT_MAP: ScriptOutput[] = [
  // ── Core manifests ──
  { script: "scripts/manifests/generate/generate-service-manifest.ts", outputs: ["generated/service-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-route-manifest.ts", outputs: ["generated/route-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-capability-index.ts", outputs: ["generated/capability-index.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-prompt-index.ts", outputs: ["generated/prompt-index.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-connector-catalog.ts", outputs: ["generated/connector-catalog.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-advisor-registry.ts", outputs: ["generated/advisor-registry.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-internal-agent-registry.ts", outputs: ["generated/internal-agent-registry.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-formula-registry.ts", outputs: ["generated/formula-registry.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-outcome-index.ts", outputs: ["generated/outcome-index.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-subject-manifest.ts", outputs: ["generated/subject-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-startup-order.ts", outputs: ["generated/startup-order.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-feature-integration-index.ts", outputs: ["generated/feature-integration-index.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-boardroom-template-index.ts", outputs: ["generated/boardroom-template-index.json"], outputType: "json" },

  // ── Capability matrices ──
  { script: "scripts/manifests/generate/generate-capability-matrices.ts", outputs: [
    "generated/capability-event-matrix.json",
    "generated/capability-owner-map.json",
    "generated/capability-policy-matrix.json",
    "generated/capability-receipt-matrix.json",
    "generated/capability-surface-matrix.json",
  ], outputType: "json" },
  { script: "scripts/manifests/generate/generate-capability-family-index.ts", outputs: ["generated/capability-family-index.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-capability-quality-metric.ts", outputs: ["generated/capability-quality-metric.json"], outputType: "json" },

  // ── Contract & shell ──
  { script: "scripts/contracts/generate/generate-contract-manifest.ts", outputs: ["generated/contract-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-shell-space-registry.ts", outputs: ["generated/shell-space-registry.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-subscription-replacement-matrix.ts", outputs: ["generated/subscription-replacement-matrix.json"], outputType: "json" },

  // ── Runtime ──
  { script: "scripts/runtime/generate/generate-runtime-conformance.ts", outputs: ["generated/runtime-conformance-manifest.json"], outputType: "json" },
  { script: "scripts/runtime/generate/generate-runtime-ports.ts", outputs: ["generated/runtime-ports.json"], outputType: "json" },

  // ── Operational ──
  { script: "scripts/manifests/generate/generate-service-consolidation.ts", outputs: ["generated/service-consolidation-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-admin-support-visibility.ts", outputs: ["generated/admin-support-visibility-manifest.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-operational-scorecards.ts", outputs: ["generated/operational-scorecards.json", "generated/operational-metrics-snapshot.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-ownership-manifest.ts", outputs: ["generated/ownership-manifest.json"], outputType: "json" },

  // ── Thresholds ──
  { script: "scripts/manifests/generate/generate-maturity-thresholds.ts", outputs: ["generated/maturity-thresholds.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-release-gate-thresholds.ts", outputs: ["generated/release-gate-thresholds.json"], outputType: "json" },
  { script: "scripts/manifests/generate/generate-surface-performance-budget.ts", outputs: ["generated/surface-performance-budget.json"], outputType: "json" },

  // ── Compliance ──
  { script: "scripts/architecture/reports/generate-architecture-compliance.ts", outputs: [
    "generated/architecture-compliance-report.json",
    "generated/security-review-manifest.json",
    "generated/accessibility-summary.json",
    "generated/visual-regression-baseline.json",
  ], outputType: "report" },

  // ── Launch tier ──
  { script: "scripts/manifests/generate/generate-launch-tier-index.ts", outputs: ["generated/launch-tier-index.json"], outputType: "json" },

  // ── Validation summary ──
  { script: "scripts/manifests/reports/generate-validation-summary.ts", outputs: ["generated/validation-summary.json"], outputType: "report" },
];

export function getScriptOutputs(scriptPath: string): string[] {
  const entry = SCRIPT_OUTPUT_MAP.find(e => e.script === scriptPath || scriptPath.endsWith(e.script.split("/").pop()!));
  return entry?.outputs || [];
}

console.log(`✅ script-output-map: ${SCRIPT_OUTPUT_MAP.length} generators mapped to ${SCRIPT_OUTPUT_MAP.reduce((a, e) => a + e.outputs.length, 0)} output artifacts`);
