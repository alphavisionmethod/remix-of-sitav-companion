// ═══════════════════════════════════════════════════════════════
// SITA OS — Failure / Recovery Proof Map
// Maps failure and recovery proof artifacts to subsystems.
// ═══════════════════════════════════════════════════════════════

import type { SubsystemId } from "./system-proof-registry";

export interface FailureProofEntry {
  readonly subsystem: SubsystemId;
  readonly proofType: "chaos-drill" | "kill-switch-test" | "rollback-validation" | "error-boundary" | "fallback-chain" | "dr-drill" | "reconnection-drill";
  readonly description: string;
  readonly artifactRef?: string;
  readonly status: "verified" | "planned" | "missing";
  readonly lastDrillDate?: string;   // ISO date
}

export const FAILURE_PROOF_MAP: readonly FailureProofEntry[] = [
  { subsystem: "ai-runtime",        proofType: "fallback-chain",      description: "AI model fallback chain",                    artifactRef: "src/lib/ai-platform/ai-fallback.ts",       status: "verified" },
  { subsystem: "ai-runtime",        proofType: "kill-switch-test",    description: "AI kill switch activation",                   status: "planned" },
  { subsystem: "app-platform",      proofType: "error-boundary",      description: "App crash isolation via error boundaries",    status: "verified" },
  { subsystem: "frontend",          proofType: "error-boundary",      description: "Route-level error boundaries",                artifactRef: "src/components/ui/error-boundary.tsx",     status: "verified" },
  { subsystem: "security",          proofType: "kill-switch-test",    description: "Auth session force-expiry test",              status: "planned" },
  { subsystem: "release",           proofType: "rollback-validation", description: "Release rollback mechanism",                  artifactRef: "generated/install-upgrade-rollback-report.json", status: "verified" },
  { subsystem: "connectors",        proofType: "reconnection-drill",  description: "Connector reconnection after failure",        status: "missing" },
  { subsystem: "advisor-boardroom", proofType: "chaos-drill",         description: "Advisor failure isolation drill",             status: "missing" },
  { subsystem: "desktop",           proofType: "dr-drill",            description: "Desktop crash recovery drill",                status: "missing" },
  { subsystem: "mobile",            proofType: "dr-drill",            description: "Mobile offline queue recovery drill",         status: "planned" },
  { subsystem: "os-runtime",        proofType: "chaos-drill",         description: "OS runtime failure drill",                    status: "missing" },
  { subsystem: "notifications",     proofType: "fallback-chain",      description: "Notification delivery fallback",              status: "missing" },
  { subsystem: "search",            proofType: "fallback-chain",      description: "Search failure fallback",                     status: "missing" },
  { subsystem: "truth-governance",  proofType: "chaos-drill",         description: "Truth system contradiction chaos drill",      status: "planned" },
  { subsystem: "admin",             proofType: "dr-drill",            description: "Admin state recovery drill",                  status: "missing" },
] as const;