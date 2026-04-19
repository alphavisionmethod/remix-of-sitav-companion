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
  "bridge-status-contract",
  // Internal AI Workforce — Phase 3 closure (3 BLOCK gates)
  "internal-agent-reflection-table",
  "internal-agent-reflect-function",
  "reflection-board-page",
  // Phase 3 expansion — Suggestions / Digest / Dependencies / Trust / Linkage (6 BLOCK gates)
  "implementation-suggestions-pipeline",
  "suggestion-generator-function",
  "weekly-digest-generation",
  "dependency-upgrade-proposer",
  "trust-score-update-logic",
  "reflection-to-action-linkage",
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
  // Internal AI Workforce — Phase 6 closure (7 BLOCK gates)
  "internal-agent-consensus-tables",
  "internal-agent-cost-proposals-table",
  "internal-agent-runbook-tables",
  "cross-council-l3-ceiling",
  "cost-proposals-never-auto-apply",
  "self-healer-safe-catalogue",
  "cross-council-board-page",
  // Internal AI Workforce — Phase 7 closure (6 BLOCK gates)
  "internal-agent-phase7-tables",
  "tenant-l3-ceiling",
  "owner-copilot-bff-readonly",
  "tenant-kill-switch-justification",
  "slo-evaluator-function",
  "phase7-admin-pages",
  // Internal AI Workforce — Phase 8 closure (9 BLOCK gates)
  "internal-agent-phase8-tables",
  "assurance-l3-ceiling",
  "chaos-safe-catalogue",
  "external-workforce-api-readonly",
  "webhook-hmac-signing",
  "federation-optin-required",
  "dp-noise-floor",
  "knowledge-anonymization",
  "phase8-admin-pages",
  // Phase 9 closure — Sovereign DR + Tenant Console + Compliance (9 BLOCK gates)
  "internal-agent-phase9-tables",
  "dr-l3-ceiling",
  "signed-release-artifacts",
  "audit-export-immutable",
  "tenant-self-service-isolation",
  "tenant-quota-hard-ceiling",
  "compliance-evidence-allowlisted",
  "attestation-packet-signed",
  "phase9-admin-pages",
  // Phase 9 hardening — Cutover, hardening, polish (7 BLOCK gates)
  "tenant-admin-role-gate",
  "dp-epsilon-budget-ledger",
  "webhook-retry-queue",
  "compliance-collector-allowlist",
  "pg-cron-schedules",
  "pg-extensions-enabled",
  "release-artifact-signer",
  // Final last-mile deployment closure — meta-gates (gates 118–124)
  "final-deployment-readiness",
  "final-runtime-proof",
  "final-mobile-truth",
  "final-ai-workforce-readiness",
  "final-launch-honesty",
  "final-supportability-readiness",
  "final-gate-meaningfulness",
  // AI Runtime Truth Closure — 6 BLOCK gates (live-provider behavioral proof)
  "ai-live-provider-nightly",
  "ai-receipt-persistence",
  "ai-ledger-write-verification",
  "ai-fallback-verification",
  "ai-budget-enforcement-under-load",
  "ai-runtime-streak-health",
  // Connector Truth Closure — 8 BLOCK gates (live OAuth refresh proof)
  "google-refresh-nightly",
  "microsoft-refresh-nightly",
  "slack-refresh-nightly",
  "connector-health-state-consistency",
  "no-ambiguous-connected-state",
  "long-tail-provider-classification",
  "connector-refresh-streak",
  "connector-reauth-surfacing",
];

// Mobile Deployment Closure — WARN-tier (mobile is secondary distribution surface;
// these gates report state but do not BLOCK desktop-primary releases on Apple membership)
const MOBILE_WARN_GATES = [
  // Closure track — signing / submission readiness
  "mobile-canonical-stack",
  "no-flutter-mobile-truth-drift",
  "android-release-path",
  "ios-release-path",
  "mobile-push-claim-safety",
  "mobile-submission-blockers",
  // Identity & Stack Truth Reconciliation track — gates 131–138
  "mobile-project-identification",
  "mobile-identity-source-of-truth",
  "no-flutter-stack-drift",
  "capacitor-mobile-truth",
  "android-native-generation",
  "ios-native-generation",
  "native-project-generation-contract",
  "mobile-bootstrap-contract",
  "mobile-build-model-consistency",
  "mobile-env-strategy-consistency",
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

// Mobile WARN-tier gates — read state but do not block release verdict
const mobileInputs: AggregateReport["inputs"] = [];
let mobileWarnings = 0;
for (const gate of MOBILE_WARN_GATES) {
  const file = gateToFile.get(gate);
  if (!file || !existsSync(file)) {
    mobileInputs.push({ file: "", gate: `${gate} (warn)`, ok: false, errors: 0, warnings: 1 });
    mobileWarnings += 1;
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as GateReport;
    const errors = data.errorCount ?? 0;
    const warnings = data.warningCount ?? 0;
    const ok = (data.ok ?? errors === 0) && errors === 0;
    mobileInputs.push({ file, gate: `${gate} (warn)`, ok, errors: 0, warnings: errors + warnings });
    mobileWarnings += errors + warnings;
  } catch {
    mobileInputs.push({ file, gate: `${gate} (warn)`, ok: false, errors: 0, warnings: 1 });
    mobileWarnings += 1;
  }
}
inputs.push(...mobileInputs);
totalWarnings += mobileWarnings;

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
