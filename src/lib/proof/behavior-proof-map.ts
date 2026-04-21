// ═══════════════════════════════════════════════════════════════
// SITA OS — Behavior Proof Map
// Maps behavioral proof artifacts to subsystems.
// ═══════════════════════════════════════════════════════════════

import type { SubsystemId } from "./system-proof-registry";

export interface BehaviorProofEntry {
  readonly subsystem: SubsystemId;
  readonly proofType: "e2e-test" | "integration-test" | "runtime-probe" | "manual-verification" | "nightly-run";
  readonly description: string;
  readonly artifactRef?: string;
  readonly lastVerified?: string;    // ISO date
  readonly automated: boolean;
}

export const BEHAVIOR_PROOF_MAP: readonly BehaviorProofEntry[] = [
  { subsystem: "ai-runtime",        proofType: "runtime-probe",       description: "AI gateway health probe",                  artifactRef: "supabase/functions/ai-gateway/",    automated: true },
  { subsystem: "ai-runtime",        proofType: "nightly-run",         description: "AI receipt completeness nightly",           artifactRef: "generated/ai-receipt-completeness-report.json", automated: true },
  { subsystem: "app-platform",      proofType: "integration-test",    description: "Launcher profile filter tests",            artifactRef: "src/shell-runtime/launcher-profile.ts", automated: true },
  { subsystem: "security",          proofType: "integration-test",    description: "Session validation logic tests",           artifactRef: "src/packages/auth/index.ts",         automated: true },
  { subsystem: "release",           proofType: "nightly-run",         description: "Release evidence pack generation",         artifactRef: "generated/release-evidence-packs-report.json", automated: true },
  { subsystem: "truth-governance",  proofType: "nightly-run",         description: "Truth governance check",                   artifactRef: "generated/truth-governance-report.json", automated: true },
  { subsystem: "frontend",          proofType: "manual-verification", description: "Page render verification across routes",   automated: false },
  { subsystem: "mobile",            proofType: "manual-verification", description: "PWA install and offline test",             automated: false },
  { subsystem: "desktop",           proofType: "manual-verification", description: "Electron shell launch test",               automated: false },
  { subsystem: "notifications",     proofType: "manual-verification", description: "Push notification delivery test",          automated: false },
  { subsystem: "search",            proofType: "manual-verification", description: "Command palette cross-domain search test", automated: false },
] as const;