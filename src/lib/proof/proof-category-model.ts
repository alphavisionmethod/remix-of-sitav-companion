// ═══════════════════════════════════════════════════════════════
// SITA OS — 7-Category Hard Proof Model
// Canonical definition of deployment-readiness proof categories.
// Orthogonal to runtime ProofClass (approval/execution/audit).
// ═══════════════════════════════════════════════════════════════

export type HardProofCategory =
  | "IMPLEMENTATION"   // code/file exists
  | "WIRING"           // actually connected and imported
  | "BEHAVIOR"         // works end-to-end
  | "FAILURE"          // degrades safely
  | "RECOVERY"         // can be restored
  | "OPERATIONAL"      // visible, supportable, diagnosable
  | "RELEASE";         // shippable artifact is validated

export interface ProofCategoryDefinition {
  readonly category: HardProofCategory;
  readonly displayName: string;
  readonly description: string;
  readonly minimumEvidence: readonly string[];
  readonly confidenceWeight: number; // 0-1, how much this contributes to overall confidence
  readonly blockerIfMissing: boolean;
}

export const PROOF_CATEGORIES: readonly ProofCategoryDefinition[] = [
  {
    category: "IMPLEMENTATION",
    displayName: "Implementation Proof",
    description: "Source code, configuration, and schema files exist on disk.",
    minimumEvidence: ["file-exists", "exports-defined", "types-valid"],
    confidenceWeight: 0.15,
    blockerIfMissing: true,
  },
  {
    category: "WIRING",
    displayName: "Wiring Proof",
    description: "Code is imported, registered, and reachable from entry points.",
    minimumEvidence: ["import-chain-valid", "route-registered", "barrel-exported"],
    confidenceWeight: 0.15,
    blockerIfMissing: true,
  },
  {
    category: "BEHAVIOR",
    displayName: "Behavior Proof",
    description: "Feature works end-to-end under normal conditions.",
    minimumEvidence: ["e2e-test-pass", "manual-verification", "runtime-probe-ok"],
    confidenceWeight: 0.20,
    blockerIfMissing: true,
  },
  {
    category: "FAILURE",
    displayName: "Failure Proof",
    description: "Feature degrades safely under failure conditions.",
    minimumEvidence: ["error-boundary-exists", "fallback-renders", "no-data-loss"],
    confidenceWeight: 0.15,
    blockerIfMissing: false,
  },
  {
    category: "RECOVERY",
    displayName: "Recovery Proof",
    description: "Feature can be restored after failure.",
    minimumEvidence: ["rollback-tested", "state-recoverable", "data-restorable"],
    confidenceWeight: 0.10,
    blockerIfMissing: false,
  },
  {
    category: "OPERATIONAL",
    displayName: "Operational Proof",
    description: "Feature is visible, supportable, and diagnosable.",
    minimumEvidence: ["logs-structured", "error-codes-defined", "runbook-exists"],
    confidenceWeight: 0.10,
    blockerIfMissing: false,
  },
  {
    category: "RELEASE",
    displayName: "Release Proof",
    description: "Shippable artifact is validated and distribution-ready.",
    minimumEvidence: ["build-passes", "checksum-valid", "signing-verified"],
    confidenceWeight: 0.15,
    blockerIfMissing: true,
  },
] as const;

export function getProofCategory(cat: HardProofCategory): ProofCategoryDefinition {
  return PROOF_CATEGORIES.find((c) => c.category === cat)!;
}

export function getBlockingCategories(): readonly ProofCategoryDefinition[] {
  return PROOF_CATEGORIES.filter((c) => c.blockerIfMissing);
}