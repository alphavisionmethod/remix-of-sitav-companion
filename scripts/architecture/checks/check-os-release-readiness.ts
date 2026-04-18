/* eslint-disable no-console */
// SITA OS — Release Readiness Aggregator
// Reads every generated/*-readiness-report.json from Part-1 + Part-2 gates
// and produces a single canonical release-readiness verdict.

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

interface GateReport {
  gate?: string;
  generatedAt?: string;
  ok?: boolean;
  errorCount?: number;
  warningCount?: number;
  issues?: Array<{ severity: string; area: string; message: string }>;
}

interface AggregateReport {
  generatedAt: string;
  gate: "os-release-readiness";
  phase: "phase-12-native-deployability";
  inputs: Array<{ file: string; gate: string; ok: boolean; errors: number; warnings: number }>;
  totalErrors: number;
  totalWarnings: number;
  missingGates: string[];
  ok: boolean;
  verdict: "GREEN" | "YELLOW" | "RED";
}

// Gate names match generated/<gate>-report.json
const REQUIRED_GATES = [
  "os-build-pipeline",
  "os-trust-chain-readiness",
  "os-update-readiness",
  "os-recovery-readiness",
  "native-shell-session-readiness",
  "qemu-vm-readiness",
  "os-support-bundle-readiness",
  "native-observability-readiness",
  // Part 3 — 5-Plane Reorganization gates
  "deployment-profile-coverage",
  "route-plane-coverage",
  "5-plane-boundaries",
  // Part 2 — Profile-aware composition gates
  "app-plane-map",
  "user-profile-readiness",
  "operator-readiness",
  // Part 3 — Mobile distribution gates
  "mobile-store-readiness",
  "mobile-build-pipeline",
  // Phase 14 — Production launch hardening
  "ks-payments-auth-readiness",
  "ci-artifacts-proof",
  "electron-signing-readiness",
  // Phase 15 — src/lib decomposition (Wave 8 guardrails + verifier)
  "lib-decomposition-readiness",
  "lib-ownership-drift",
  "misplaced-runtime-logic",
  "misplaced-data-logic",
  "misplaced-domain-logic",
  "legacy-wrapper-usage",
  // Phase G — Profile & Runtime Hardening (8 block-level gates + 1 orchestrator)
  "profile-runtime-hardening",
  "launcher-registry-completeness",
  "app-profile-matrix",
  "hidden-app-routes",
  "mobile-capability-truth",
  "profile-route-coverage",
  "command-palette-profile-leakage",
  "shared-component-profile-pollution",
  "route-guard-coverage",
  // Phase H — Baseline drift detection (sealed surface guard)
  "profile-runtime-baseline-drift",
  // Boardroom Layer 7 — Follow-through closure (BLOCK gate)
  "boardroom-layer7-closure",
  // Claim-Safety Hardening — 9 BLOCK gates (Phase 5)
  "os-claim-safety",
  "track-b-language-boundaries",
  "no-prohibited-native-claims",
  "demo-only-surface-badging",
  "future-vision-route-containment",
  "device-surface-claim-safety",
  "deployment-wording-safety",
  "launch-honesty-alignment",
  "qualifier-required-claims",
  // Final Proof Verification — 5 BLOCK gates (Section A–E)
  "gate-meaningfulness",
  "app-store-lifecycle-reality",
  "frontend-polish-coverage",
  "admin-operator-coherence",
  "human-use-operational-readiness",
  // Internal AI Workforce — Phase 1 closure (6 BLOCK gates)
  "internal-agent-registry",
  "internal-agent-runtime-coverage",
  "internal-agent-admin-pages",
  "internal-agent-escalation-runtime",
  "internal-agent-seed-integrity",
  "internal-agent-runtime-loop",
  // Flagship Surface Closure — Admin AI Engineering scope (2 BLOCK gates)
  "admin-ai-runtime-drilldowns",
  "admin-integrations-health-visibility",
  // Internal AI Workforce — Phase 2 closure (8 BLOCK gates)
  "internal-agent-execute-action",
  "autonomous-action-safety-gates",
  "autonomous-action-receipts",
  "autonomous-action-rollback-coverage",
  "error-patrol-triage-page",
  "agent-primitive-wiring",
  "priority-bridge-wiring",
  "kill-switch-backfill",
  // Internal AI Workforce — Phase 3 closure (3 BLOCK gates)
  "internal-agent-reflection-table",
  "internal-agent-reflect-function",
  "reflection-board-page",
  // Internal AI Workforce — Phase 4 closure (4 BLOCK gates)
  "internal-agent-policy-drafts-table",
  "internal-agent-policy-architect-function",
  "policy-draft-review-page",
  "policy-draft-never-auto-apply",
  // Internal AI Workforce — Phase 5 closure (6 BLOCK gates)
  "internal-agent-trust-ladder-table",
  "internal-agent-trust-evaluator-function",
  "trust-ladder-board-page",
  "trust-ladder-never-self-promote",
  "knowledge-bus-write-discipline",
  "trust-ladder-supervisor-readout",
];

const GENERATED_DIR = "generated";
mkdirSync(GENERATED_DIR, { recursive: true });

const inputs: AggregateReport["inputs"] = [];
const missingGates: string[] = [];
let totalErrors = 0;
let totalWarnings = 0;

const filesPresent = existsSync(GENERATED_DIR)
  ? readdirSync(GENERATED_DIR).filter(f => f.endsWith("-report.json"))
  : [];

const gateToFile = new Map<string, string>();
for (const f of filesPresent) {
  const gate = f.replace("-report.json", "");
  gateToFile.set(gate, join(GENERATED_DIR, f));
}

for (const gate of REQUIRED_GATES) {
  const file = gateToFile.get(gate);
  if (!file || !existsSync(file)) {
    missingGates.push(gate);
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as GateReport;
    const errors = data.errorCount ?? 0;
    const warnings = data.warningCount ?? 0;
    const ok = data.ok ?? errors === 0;
    inputs.push({ file, gate, ok, errors, warnings });
    totalErrors += errors;
    totalWarnings += warnings;
  } catch (e) {
    inputs.push({ file, gate, ok: false, errors: 1, warnings: 0 });
    totalErrors += 1;
  }
}

const ok = missingGates.length === 0 && totalErrors === 0;
const verdict: AggregateReport["verdict"] =
  missingGates.length > 0 || totalErrors > 0
    ? "RED"
    : totalWarnings > 0
      ? "YELLOW"
      : "GREEN";

const report: AggregateReport = {
  generatedAt: new Date().toISOString(),
  gate: "os-release-readiness",
  phase: "phase-12-native-deployability",
  inputs,
  totalErrors,
  totalWarnings,
  missingGates,
  ok,
  verdict,
};

writeFileSync(
  join(GENERATED_DIR, "os-release-readiness-report.json"),
  JSON.stringify(report, null, 2),
);

const md = [
  `# SITA OS — Release Readiness Report`,
  ``,
  `> Generated: ${report.generatedAt}`,
  `> Verdict: **${verdict}** ${verdict === "GREEN" ? "✅" : verdict === "YELLOW" ? "⚠️" : "❌"}`,
  ``,
  `## Summary`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  `| Gates required | ${REQUIRED_GATES.length} |`,
  `| Gates present  | ${inputs.length} |`,
  `| Gates missing  | ${missingGates.length} |`,
  `| Total errors   | ${totalErrors} |`,
  `| Total warnings | ${totalWarnings} |`,
  ``,
  `## Per-gate results`,
  ``,
  `| Gate | OK | Errors | Warnings |`,
  `|---|---|---|---|`,
  ...inputs.map(i =>
    `| \`${i.gate}\` | ${i.ok ? "✅" : "❌"} | ${i.errors} | ${i.warnings} |`,
  ),
  ...missingGates.map(g => `| \`${g}\` | ❌ MISSING | — | — |`),
  ``,
  `## Verdict`,
  ``,
  verdict === "GREEN"
    ? `✅ All required readiness gates passed with no warnings. Release is **cuttable**.`
    : verdict === "YELLOW"
      ? `⚠️ All required gates passed, but ${totalWarnings} warning(s) present. Release is cuttable but review warnings.`
      : `❌ Release is **NOT cuttable**. Fix ${totalErrors} error(s) and resolve ${missingGates.length} missing gate(s).`,
  ``,
  `## Related`,
  ``,
  `- \`docs/os/VALIDATION_MATRIX.md\` — full pre-release matrix`,
  `- \`docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md\` — deployment verdict`,
  ``,
].join("\n");

writeFileSync(join(GENERATED_DIR, "os-release-readiness-summary.md"), md);

console.log(`Release readiness: ${verdict} (${inputs.length}/${REQUIRED_GATES.length} gates, ${totalErrors} errors, ${totalWarnings} warnings)`);
if (missingGates.length > 0) console.log(`  missing: ${missingGates.join(", ")}`);
process.exit(ok ? 0 : 1);
