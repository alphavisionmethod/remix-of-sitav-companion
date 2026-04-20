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
  // Flagship Surface Closure — Admin AI Engineering scope (2 BLOCK + 6 honest WARN-tier hybrid)
  "admin-ai-runtime-drilldowns",
  "admin-integrations-health-visibility",
  // Flagship Surface Closure — honest WARN-tier hybrid validators (deferred-to-user-flagship)
  "onboarding-simulated-persona-disclosure",
  "boardroom-briefing-truth-alignment",
  "concierge-ai-state-handling",
  "communications-connector-state-alignment",
  "flagship-surface-trust-copy",
  "flagship-surface-responsive-quality",
  // Admin Empty-State Closure — 4 honest WARN-tier hybrid validators (deferred-to-domain-pass)
  "admin-empty-state-patterns",
  "cross-domain-coherence-empty-state",
  "cost-spotlight-empty-state",
  "sbom-history-empty-state",
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
  // Connector Truth Closure — 7 BLOCK gates (live OAuth refresh proof)
  "google-refresh-nightly",
  "microsoft-refresh-nightly",
  "slack-refresh-nightly",
  "connector-health-state-consistency",
  "no-ambiguous-connected-state",
  "long-tail-provider-classification",
  "connector-refresh-streak",
  // Mobile Scope Closure — 5 BLOCK gates (native iOS/Android out of scope; archived posture)
  "mobile-native-out-of-scope-truth",
  "no-active-native-mobile-claims",
  "install-page-mobile-honesty",
  "mobile-manifest-archive-classification",
  "generated-mobile-truth-consistency",
  // Frontend Polish Closure — 7 BLOCK gates (Admin AI Engineer hub polish)
  "empty-state-coverage",
  "cta-integrity",
  "no-shell-only-production-pages",
  "state-handling-consistency",
  "admin-board-polish",
  "trust-copy-quality",
  "responsive-surface-integrity",
  // Admin & Validation Truth Closure — 8 BLOCK gates (operator pathfinding + gate-quality)
  "admin-top-task-discoverability",
  "no-museum-boards",
  "admin-action-orientation",
  "edge-function-contract-coverage",
  "warn-ratchet-meaningfulness",
  "evidence-freshness-blocking",
  "behavioral-ci-coverage",
  "gate-quality-classification",
  // Hardware & Operator Readiness Closure — 7 BLOCK gates (real-device + human-use proof)
  "real-hardware-proof",
  "hardware-certification-matrix",
  "attestation-evidence-freshness",
  "operator-drill-execution",
  "runbook-human-use-proof",
  "kill-switch-drill-readiness",
  "supportability-freshness",
  // Security & Portability Closure — 10 BLOCK gates (cadence + adversarial + portability)
  "secret-rotation-cadence",
  "secret-rotation-freshness",
  "security-adversarial-proof",
  "rls-under-stress",
  "electron-threat-detection-proof",
  "debugger-tamper-proof",
  "session-threat-behavior",
  "no-browser-trapped-shared-hooks",
  "runtime-host-abstraction",
  "portability-boundaries",
  // Architectural Cleanup Closure — 5 BLOCK gates (additive cleanup pass; zero deletions)
  "no-browser-globals-in-portable-code",
  "edge-function-structured-logging",
  "no-duplicate-truth-manifests",
  "no-stale-canonical-docs",
  "safe-cleanup-regressions",
  // Economic-Trust-Future Closure — 7 BLOCK gates (per-user ceilings + trust UX + future containment)
  "per-user-ai-ceilings",
  "ai-budget-hard-stop",
  "calm-mode-default-posture",
  "agency-wording-lockdown",
  "future-surfaces-registered",
  "negative-receipts-emitted",
  "economic-trust-future-closure",
  // Architecture Hardening Closure — 6 BLOCK gates (additive hardening; zero deletions)
  "runtime-host-boundaries",
  "shell-runtime-portability",
  "edge-function-log-shape",
  "mobile-archived-scope",
  "no-kernel-overclaim",
  "doc-canonicality",
  // Phase 0–4 Evidence Persistence Closure (5 BLOCK gates)
  "canonical-paths",
  "5-plane-boundaries",
  "evidence-graph-completeness",
  "cron-execution-evidence",
  "release-decision-persistence",
  // Phase 5–9 Closure Pack (4 BLOCK gates)
  "ai-receipt-completeness",
  "connector-reauth-telemetry",
  "security-fabric-probes",
  "app-sdk-extension-registry",
  // Phase 10–14 Closure Pack (5 BLOCK gates)
  "boardroom-cockpit-telemetry",
  "onboarding-branch-telemetry",
  "mobile-deferral-attestation",
  "app-sdk-extension-events",
  "release-evidence-graph-snapshot",
  // Phase 15 Final Closure Pack (5 BLOCK gates)
  "owner-copilot-readonly",
  "federation-optin-append-only",
  "dr-drill-evidence",
  "chaos-drill-classification",
  "production-launch-attestation",
  // Phase 18 Layout & CI Truth (2 BLOCK gates)
  "electron-domain-layout",
  "os-ci-end-to-end",
  // Phase 19 Public Artifact Surfacing (1 BLOCK gate — mirror drift detector)
  "public-artifact-mirror",
  // Phase 23 Onboarding components folder canonicalization (1 BLOCK gate)
  "onboarding-components-folder",
  // Phase 24 Artifact index traceability (1 BLOCK gate — external validator entrypoint)
  "artifact-index-traceability",
  // Phase 25 Runbook coverage (1 BLOCK gate — operator narrative + kill-switch ↔ runbook bidirectional integrity)
  "runbook-coverage",
  // Phase 26 Per-edge-function ownership manifest (1 BLOCK gate — 100% owner coverage + mirror parity + freshness)
  "edge-function-ownership-completeness",
  // Phase 27 Per-provider client registry (1 BLOCK gate — src/lib/connectors/<provider>/client.ts coverage + canonical registry)
  "connector-client-registry-completeness",
  // Phase 28 Admin runbook surface IA wiring (1 BLOCK gate — registry + mount + hub tab parity)
  "admin-runbook-surface-wiring",
  "recovery-boot-evidence",
  // Phase 30 Producer→consumer ownership graph (1 BLOCK gate — directed graph + transitive staleness for 459 artifacts)
  "artifact-ownership-graph",
  // Phase 31 Cross-tier capability matrix (1 BLOCK gate — registry is single source of truth; no hard-coded tier literals)
  "cross-tier-capability-matrix",
  // Phase 32 First-use spec coverage (1 BLOCK gate — 29-screen master spec ↔ SetupPhaseId mapping is typed + verified)
  "first-use-spec-coverage",
  // Internal AI Workforce — Runtime Truth (1 BLOCK gate, registered as gate #22 of the workforce series)
  // Asserts every registry agent has an explicit runtimeStatus and that
  // "deferred" agents carry deferredReason + deferredEta. Prevents "40 agents
  // wired" overclaim by failing if status coverage < 100% or if any "wired"
  // agent's runtimeInvocationPath does not actually reference the agent ID.
  "internal-agent-deferred-set-explicitness",
  // Phase 27 Cluster README coverage (1 BLOCK gate — anchors src/lib ambiguous clusters
  // with canonical README.md files containing Purpose/Layer/Canonical-neighbors headings.
  // Prevents cognitive-risk regressions from folder-browsing without context.)
  "cluster-readme-coverage",
  // Phase 28 AI Shim Integrity (1 BLOCK gate — asserts every *.ts in the 4
  // legacy AI clusters (ai, ai-engineering, ai-gateway, sovereign-ai-gateway)
  // is a thin DEPRECATED SHIM re-exporting from @/lib/ai-platform/*. Prevents
  // physical re-introduction of the naming-overlap problem.)
  "ai-shim-integrity",
  // Wave 6 — ISO/OVA/RAW production readiness (3 BLOCK gates).
  // Physically verify build artifacts exist on disk after a release-tagged
  // build. Each gate runs in two modes (ci|dev) selected by SITA_RELEASE_MODE.
  // Dev mode reports OK when artifacts are absent so local validators are
  // not blocked by the absence of a heavyweight ISO build.
  "iso-artifact-presence",
  "ova-artifact-presence",
  "raw-img-artifact-presence",
  // Wave 7 — Stub & Demo-Flag Hardening (BLOCK gate #248)
  // Prevents reintroduction of hardcoded module-scope `isDemoMode = true|false`
  // declarations in production pages/components per
  // constraints/reality-mode-wiring. Excludes __tests__.
  "hardcoded-demo-flags",
];

// Mobile Deployment Closure — RETIRED (2026-04-19)
// Native iOS/Android moved to ARCHIVED / FUTURE_VISION_ONLY status.
// All previous mobile WARN-tier gates have been retired and their validators
// archived under archive/scripts/validation/. The 5 new BLOCK gates above
// (mobile-scope-closure) replace them with stricter drift-prevention.
const MOBILE_WARN_GATES: string[] = [];

// Admin AI Engineer Hub Hardening — Phase 3-6 (WARN-tier; promotes to BLOCK after sweep).
const ADMIN_AI_ENGINEER_WARN_GATES: string[] = [
  "ai-engineer-tab-registry",
  "ai-engineer-wiring-coverage",
  "ai-engineer-primitive-coverage",
  "ai-engineer-action-coverage",
];

const GENERATED_DIR = "generated";
mkdirSync(GENERATED_DIR, { recursive: true });

// ─── REQUIRED_OUTPUT_WRITERS (Wave 3 lock-in) ─────────────────────
// Maps required gate ids to the validator scripts that MUST write
// generated/<gate-id>-report.json. The startup assertion below fails the
// aggregator immediately if a writer script is missing — turning a generic
// "missing report" failure at the end into a precise, actionable one at the
// top. Wave 1 fixed three gaps (runbook-coverage, connector-client-registry-
// completeness, admin-runbook-surface-wiring); this lock-in prevents
// silent regression.
// ──────────────────────────────────────────────────────────────────
const REQUIRED_OUTPUT_WRITERS: Record<string, string> = {
  "runbook-coverage": "scripts/architecture/checks/check-runbook-coverage.ts",
  "connector-client-registry-completeness":
    "scripts/architecture/checks/check-connector-client-registry.ts",
  "admin-runbook-surface-wiring":
    "scripts/architecture/checks/check-admin-runbook-surface-wiring.ts",
  // Wave 6 lock-in
  "iso-artifact-presence":
    "scripts/architecture/checks/check-iso-artifact-presence.ts",
  "ova-artifact-presence":
    "scripts/architecture/checks/check-ova-artifact-presence.ts",
  "raw-img-artifact-presence":
    "scripts/architecture/checks/check-raw-img-artifact-presence.ts",
  // Wave 7 lock-in
  "hardcoded-demo-flags":
    "scripts/architecture/checks/check-hardcoded-demo-flags.ts",
};
const writerStartupErrors: string[] = [];
for (const [gateId, scriptPath] of Object.entries(REQUIRED_OUTPUT_WRITERS)) {
  if (!existsSync(scriptPath)) {
    writerStartupErrors.push(
      `REQUIRED_OUTPUT_WRITERS["${gateId}"] points to missing script: ${scriptPath}`,
    );
  }
}
if (writerStartupErrors.length > 0) {
  console.error("❌ Wave-3 startup assertion failed:");
  for (const err of writerStartupErrors) console.error(`  • ${err}`);
  process.exit(1);
}

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

// Admin AI Engineer Hub WARN-tier gates — same handling pattern as mobile.
const adminAIEngineerInputs: AggregateReport["inputs"] = [];
let adminAIEngineerWarnings = 0;
for (const gate of ADMIN_AI_ENGINEER_WARN_GATES) {
  const file = gateToFile.get(gate);
  if (!file || !existsSync(file)) {
    adminAIEngineerInputs.push({ file: "", gate: `${gate} (warn)`, ok: false, errors: 0, warnings: 1 });
    adminAIEngineerWarnings += 1;
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as GateReport;
    const errors = data.errorCount ?? 0;
    const warnings = data.warningCount ?? 0;
    const ok = (data.ok ?? errors === 0) && errors === 0;
    adminAIEngineerInputs.push({ file, gate: `${gate} (warn)`, ok, errors: 0, warnings: errors + warnings });
    adminAIEngineerWarnings += errors + warnings;
  } catch {
    adminAIEngineerInputs.push({ file, gate: `${gate} (warn)`, ok: false, errors: 0, warnings: 1 });
    adminAIEngineerWarnings += 1;
  }
}
inputs.push(...adminAIEngineerInputs);
totalWarnings += adminAIEngineerWarnings;

// Advisory ingestion — surfaces every validator classified as `advisory`
// in generated/validator-gate-map.json. Failures NEVER affect BLOCK verdict.
interface AdvisoryEntry { validator: string; gateId: string; classification: string }
const advisoryInputs: AggregateReport["inputs"] = [];
let advisoryWarnings = 0;
let validatorMapCoverage: number | null = null;
let validatorMapTotal = 0;
const VALIDATOR_MAP_FILE = join(GENERATED_DIR, "validator-gate-map.json");
if (existsSync(VALIDATOR_MAP_FILE)) {
  try {
    const vmap = JSON.parse(readFileSync(VALIDATOR_MAP_FILE, "utf8")) as {
      coveragePercent?: number;
      totalValidators?: number;
      entries?: AdvisoryEntry[];
    };
    validatorMapCoverage = vmap.coveragePercent ?? null;
    validatorMapTotal = vmap.totalValidators ?? 0;
    const advisoryGates = (vmap.entries ?? []).filter(e => e.classification === "advisory");
    for (const entry of advisoryGates) {
      const file = gateToFile.get(entry.gateId);
      if (!file || !existsSync(file)) {
        // Missing advisory report = soft warning (not a blocker, not an error).
        advisoryInputs.push({ file: "", gate: `${entry.gateId} (advisory)`, ok: false, errors: 0, warnings: 0 });
        continue;
      }
      try {
        const data = JSON.parse(readFileSync(file, "utf8")) as GateReport;
        const errors = data.errorCount ?? 0;
        const warnings = data.warningCount ?? 0;
        const surfaced = errors + warnings;
        advisoryInputs.push({
          file,
          gate: `${entry.gateId} (advisory)`,
          ok: surfaced === 0,
          errors: 0,
          warnings: surfaced,
        });
        advisoryWarnings += surfaced;
      } catch {
        advisoryInputs.push({ file, gate: `${entry.gateId} (advisory)`, ok: false, errors: 0, warnings: 1 });
        advisoryWarnings += 1;
      }
    }
  } catch {
    // Malformed map — surface as a single warning, never block.
    advisoryWarnings += 1;
  }
}
inputs.push(...advisoryInputs);
totalWarnings += advisoryWarnings;

// BLOCK verdict — derived ONLY from REQUIRED_GATES. Advisory state is informational.
const ok = missingGates.length === 0 && totalErrors === 0;
const blockWarnings = totalWarnings - advisoryWarnings - mobileWarnings - adminAIEngineerWarnings;
const verdict: AggregateReport["verdict"] =
  missingGates.length > 0 || totalErrors > 0
    ? "RED"
    : blockWarnings > 0
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
  `| Advisory gates surfaced | ${advisoryInputs.length} |`,
  `| Validator-map coverage | ${validatorMapCoverage === null ? "n/a" : validatorMapCoverage + "%"} (${validatorMapTotal} validators) |`,
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
