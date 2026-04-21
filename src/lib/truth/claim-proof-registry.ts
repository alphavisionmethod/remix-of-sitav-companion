// ═══════════════════════════════════════════════════════════════
// SITA OS — Claim-Proof Registry
// Maps major readiness claims to concrete proof artifacts
// ═══════════════════════════════════════════════════════════════

import type { ReadinessClaim } from "./readiness-claim-contract";

export const CLAIM_PROOF_REGISTRY: readonly ReadinessClaim[] = [
  // ── AI Runtime ──
  {
    claimId: "CLM-AI-001",
    claim: "AI Runtime is production-ready",
    subsystem: "ai-runtime",
    claimType: "readiness",
    dimensions: ["structural", "behavioral", "operational", "trust"],
    proofArtifacts: [
      "generated/ai-live-provider-nightly-report.json",
      "generated/ai-receipt-persistence-report.json",
      "generated/ai-ledger-write-verification-report.json",
      "generated/ai-fallback-verification-report.json",
      "generated/ai-budget-enforcement-under-load-report.json",
      "generated/ai-runtime-streak-health-report.json",
    ],
    evidenceSources: ["ai_runtime_nightly_runs", "ai_usage_ledger", "ai_inference_receipts"],
    owner: "ai-engineering",
    confidence: "high",
    advisorySensitivity: "medium",
    invalidationConditions: ["ai_model_registry schema change", "ai_capability_routing schema change", "nightly run failure"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "CONDITIONALLY_READY",
  },
  // ── Advisor Boardroom ──
  {
    claimId: "CLM-ADVISOR-001",
    claim: "Advisor layer is behaviorally closed",
    subsystem: "advisor-boardroom",
    claimType: "closure",
    dimensions: ["structural", "behavioral", "trust"],
    proofArtifacts: [
      "generated/advisor-boardroom-proof/advisor-identity-closure-check.json",
      "generated/advisor-boardroom-proof/advisor-tool-permission-check.json",
      "generated/advisor-boardroom-proof/advisor-reversibility-check.json",
      "generated/advisor-boardroom-proof/advisor-confidence-gates.json",
      "generated/advisor-boardroom-proof/advisor-persona-boundaries.json",
      "generated/advisor-boardroom-proof/advisor-escalation-policy.json",
      "generated/advisor-boardroom-proof/advisor-memory-aging.json",
      "generated/advisor-boardroom-proof/advisor-debate-orchestration.json",
      "generated/advisor-boardroom-proof/advisor-reflection-policy.json",
      "generated/advisor-boardroom-proof/advisor-disablement-policy.json",
      "generated/advisor-boardroom-proof/advisor-override-scopes.json",
      "generated/advisor-boardroom-proof/advisor-diagnostic-snapshot.json",
      "generated/advisor-boardroom-proof/advisor-edge-function-governance.json",
    ],
    evidenceSources: ["advisor_registry", "advisor_agents", "advisor_board_recommendations"],
    owner: "advisor-engineering",
    confidence: "high",
    advisorySensitivity: "low",
    invalidationConditions: ["advisor_registry schema change", "new advisor added without identity", "policy file modification"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "READY",
  },
  // ── Connector OAuth ──
  {
    claimId: "CLM-OAUTH-001",
    claim: "Connector OAuth is secure",
    subsystem: "connector-oauth",
    claimType: "security",
    dimensions: ["behavioral", "trust"],
    proofArtifacts: [
      "generated/connector-refresh-streak-report.json",
      "generated/oauth-security-closure-report.json",
      "generated/google-refresh-nightly-report.json",
      "generated/microsoft-refresh-nightly-report.json",
      "generated/slack-refresh-nightly-report.json",
    ],
    evidenceSources: ["connector_tokens", "connector_credentials", "sync_logs"],
    owner: "security-engineering",
    confidence: "medium",
    advisorySensitivity: "high",
    invalidationConditions: ["connector_tokens schema change", "encryption policy change", "token refresh failure"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "TRUST_GAP_OPEN",
  },
  // ── App Platform ──
  {
    claimId: "CLM-APP-001",
    claim: "App Platform lifecycle is closed",
    subsystem: "app-platform",
    claimType: "closure",
    dimensions: ["structural", "behavioral"],
    proofArtifacts: [
      "generated/app-identity-closure-report.json",
      "generated/app-lifecycle-coverage-report.json",
    ],
    evidenceSources: ["src/lib/app-platform/catalog.ts", "src/lib/app-platform/app-lifecycle-manager.ts"],
    owner: "app-engineering",
    confidence: "high",
    advisorySensitivity: "low",
    invalidationConditions: ["catalog.ts modification", "lifecycle-manager.ts modification", "new app state added"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "READY",
  },
  // ── Admin Operator ──
  {
    claimId: "CLM-ADMIN-001",
    claim: "Admin operator surfaces are production-ready",
    subsystem: "admin-operator",
    claimType: "readiness",
    dimensions: ["structural", "operational"],
    proofArtifacts: [
      "generated/admin-top-task-discoverability-report.json",
      "generated/admin-action-orientation-report.json",
      "generated/admin-runbook-surface-wiring-report.json",
    ],
    evidenceSources: ["src/pages/admin/**"],
    owner: "admin-engineering",
    confidence: "high",
    advisorySensitivity: "medium",
    invalidationConditions: ["admin route addition", "runbook registry change", "kill-switch addition"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "CONDITIONALLY_READY",
  },
  // ── Frontend UX ──
  {
    claimId: "CLM-FRONTEND-001",
    claim: "Frontend component layer is structurally sound",
    subsystem: "frontend-ux",
    claimType: "readiness",
    dimensions: ["structural"],
    proofArtifacts: [
      "generated/component-canonicalization-report.json",
      "generated/empty-state-coverage-report.json",
      "generated/responsive-surface-integrity-report.json",
    ],
    evidenceSources: ["src/components/**"],
    owner: "frontend-engineering",
    confidence: "medium",
    advisorySensitivity: "medium",
    invalidationConditions: ["component addition", "duplicate family detected", "dead page detected"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "CONDITIONALLY_READY",
  },
  {
    claimId: "CLM-FRONTEND-002",
    claim: "Frontend has no dead or orphaned pages",
    subsystem: "frontend-ux",
    claimType: "readiness",
    dimensions: ["structural"],
    proofArtifacts: ["generated/no-shell-only-production-pages-report.json"],
    evidenceSources: ["src/pages/**", "src/routes/**"],
    owner: "frontend-engineering",
    confidence: "medium",
    advisorySensitivity: "low",
    invalidationConditions: ["route addition", "page deletion", "navigation change"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "CONDITIONALLY_READY",
  },
  // ── Mobile Distribution ──
  {
    claimId: "CLM-MOBILE-001",
    claim: "Mobile is honestly classified as out-of-scope",
    subsystem: "mobile-distribution",
    claimType: "closure",
    dimensions: ["distribution"],
    proofArtifacts: [
      "generated/mobile-scope-closure/mobile-native-out-of-scope-truth-report.json",
      "generated/mobile-scope-closure/no-active-native-mobile-claims-report.json",
      "generated/mobile-scope-closure/install-page-mobile-honesty-report.json",
      "generated/mobile-scope-closure/mobile-manifest-archive-classification-report.json",
      "generated/mobile-scope-closure/generated-mobile-truth-consistency-report.json",
    ],
    evidenceSources: ["mobile-scope-closure validators"],
    owner: "platform-engineering",
    confidence: "high",
    advisorySensitivity: "none",
    invalidationConditions: ["mobile re-scoping decision", "native mobile claim reintroduction"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "DISTRIBUTION_BLOCKED",
  },
  // ── Security Trust ──
  {
    claimId: "CLM-TRUST-001",
    claim: "Security trust layer is production-grade",
    subsystem: "security-trust",
    claimType: "security",
    dimensions: ["trust", "operational"],
    proofArtifacts: [
      "generated/secret-rotation-cadence-report.json",
      "generated/security-adversarial-proof-report.json",
      "generated/rls-under-stress-report.json",
    ],
    evidenceSources: ["security validators", "admin_action_audit"],
    owner: "security-engineering",
    confidence: "medium",
    advisorySensitivity: "high",
    invalidationConditions: ["RLS policy change", "secret rotation failure", "new table without RLS"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "TRUST_GAP_OPEN",
  },
  // ── Electron Distribution ──
  {
    claimId: "CLM-DIST-001",
    claim: "Desktop distribution is production-ready",
    subsystem: "mobile-distribution",
    claimType: "readiness",
    dimensions: ["distribution"],
    proofArtifacts: ["generated/electron-signing-readiness-report.json"],
    evidenceSources: ["electron build pipeline"],
    owner: "platform-engineering",
    confidence: "low",
    advisorySensitivity: "high",
    invalidationConditions: ["signing certificate expiry", "notarization status change"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "DISTRIBUTION_BLOCKED",
  },
  // ── Electron Identity ──
  {
    claimId: "CLM-ELECTRON-001",
    claim: "Electron app identity and signing are complete",
    subsystem: "mobile-distribution",
    claimType: "readiness",
    dimensions: ["distribution", "trust"],
    proofArtifacts: ["generated/electron-signing-readiness-report.json"],
    evidenceSources: ["electron-builder config", "code signing certificates"],
    owner: "platform-engineering",
    confidence: "low",
    advisorySensitivity: "high",
    invalidationConditions: ["certificate rotation", "notarization completion"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "DISTRIBUTION_BLOCKED",
  },
  // ── OS Boot ──
  {
    claimId: "CLM-OS-001",
    claim: "OS boot and recovery are production-ready",
    subsystem: "ai-runtime",
    claimType: "readiness",
    dimensions: ["structural", "behavioral"],
    proofArtifacts: [
      "generated/os-boot-recovery-closure-report.json",
      "generated/recovery-boot-evidence-report.json",
    ],
    evidenceSources: ["os-boot validators", "qemu-vm-readiness"],
    owner: "os-engineering",
    confidence: "medium",
    advisorySensitivity: "medium",
    invalidationConditions: ["boot sequence change", "recovery flow modification"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "BEHAVIORALLY_PARTIAL",
  },
  // ── Behavioral Proof ──
  {
    claimId: "CLM-BEHAVIORAL-001",
    claim: "E2E boot-to-login validation exists",
    subsystem: "ai-runtime",
    claimType: "behavioral",
    dimensions: ["behavioral"],
    proofArtifacts: ["generated/qemu-vm-readiness-report.json"],
    evidenceSources: ["QEMU CI pipeline"],
    owner: "os-engineering",
    confidence: "low",
    advisorySensitivity: "high",
    invalidationConditions: ["CI pipeline change", "boot image modification"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "DEFERRED",
  },
  // ── Release Aggregate ──
  {
    claimId: "CLM-RELEASE-001",
    claim: "Release is cuttable (all BLOCK gates pass)",
    subsystem: "admin-operator",
    claimType: "readiness",
    dimensions: ["structural", "behavioral", "operational"],
    proofArtifacts: ["generated/os-release-readiness-report.json"],
    evidenceSources: ["check-os-release-readiness.ts"],
    owner: "release-engineering",
    confidence: "high",
    advisorySensitivity: "high",
    invalidationConditions: ["any BLOCK gate failure", "advisory count > 5000", "stale evidence"],
    lastVerified: new Date().toISOString(),
    currentVerdict: "CONDITIONALLY_READY",
  },
] as const;

export function getClaimById(id: string): ReadinessClaim | undefined {
  return CLAIM_PROOF_REGISTRY.find(c => c.claimId === id);
}

export function getClaimsForSubsystem(subsystem: string): readonly ReadinessClaim[] {
  return CLAIM_PROOF_REGISTRY.filter(c => c.subsystem === subsystem);
}

export function getClaimsWithVerdict(verdict: string): readonly ReadinessClaim[] {
  return CLAIM_PROOF_REGISTRY.filter(c => c.currentVerdict === verdict);
}

export function getHighAdvisorySensitivityClaims(): readonly ReadinessClaim[] {
  return CLAIM_PROOF_REGISTRY.filter(c => c.advisorySensitivity === "high");
}