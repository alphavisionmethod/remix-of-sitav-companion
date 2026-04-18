// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Proof Registry
// Layer 3 · Canonical proof / receipt class catalog
// Companion doc: docs/architecture/PROOF_AND_AUDIT_MODEL.md
// ═══════════════════════════════════════════════════════════════

export type ProofClass =
  | "approval"            // a decision was made
  | "execution"           // an action was performed
  | "reversal"            // an action was rolled back
  | "audit"               // an inspectable event was recorded
  | "negative"            // an action was refused (with reason)
  | "verification"        // an outcome was verified after execution
  | "lineage"             // a derived data record (hash chain)
  | "attestation"         // device / runtime signed assertion
  | "consent"             // user authorized something explicitly
  | "ai-inference";       // AI invocation receipt

export type ProofMedium = "db-row" | "event-stream" | "blob-store" | "external-anchor";

export interface ProofRegistryEntry {
  readonly proofId: string;
  readonly proofClass: ProofClass;
  readonly displayName: string;
  readonly storageTable: string | null;       // canonical Supabase table
  readonly storageMedium: ProofMedium;
  readonly retentionDays: number;
  readonly chained: boolean;                  // hash-chained?
  readonly externallyAnchored: boolean;       // anchored to external KMS / log?
  readonly userVisible: boolean;              // surfaced in user UI?
  readonly adminVisible: boolean;             // surfaced in admin UI?
  readonly minimumTrustToProduce: number;     // 0-100
}

export const PROOF_REGISTRY: readonly ProofRegistryEntry[] = [
  { proofId: "approval-decision",      proofClass: "approval",     displayName: "Approval Decision",        storageTable: "ai_workforce_approval_queue",         storageMedium: "db-row",       retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: true,  adminVisible: true,  minimumTrustToProduce: 50 },
  { proofId: "execution-binding",      proofClass: "execution",    displayName: "Execution Binding",        storageTable: "recommendation_execution_bindings",   storageMedium: "db-row",       retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: false, adminVisible: true,  minimumTrustToProduce: 50 },
  { proofId: "execution-event",        proofClass: "execution",    displayName: "Execution Event",          storageTable: "recommendation_execution_events",     storageMedium: "event-stream", retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: false, adminVisible: true,  minimumTrustToProduce: 50 },
  { proofId: "outcome-verification",   proofClass: "verification", displayName: "Outcome Verification",     storageTable: "recommendation_outcome_verifications",storageMedium: "db-row",       retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: true,  adminVisible: true,  minimumTrustToProduce: 60 },
  { proofId: "negative-receipt",       proofClass: "negative",     displayName: "Negative Receipt (Refusal)", storageTable: "negative_receipts",                  storageMedium: "db-row",      retentionDays: 365 * 3, chained: true,  externallyAnchored: false, userVisible: true,  adminVisible: true,  minimumTrustToProduce: 0  },
  { proofId: "audit-event",            proofClass: "audit",        displayName: "Admin Action Audit",       storageTable: "admin_action_audit",                  storageMedium: "event-stream", retentionDays: 365 * 7, chained: true,  externallyAnchored: true,  userVisible: false, adminVisible: true,  minimumTrustToProduce: 70 },
  { proofId: "ai-inference-receipt",   proofClass: "ai-inference", displayName: "AI Inference Receipt",     storageTable: "ai_inference_receipts",               storageMedium: "db-row",       retentionDays: 365,     chained: false, externallyAnchored: false, userVisible: false, adminVisible: true,  minimumTrustToProduce: 30 },
  { proofId: "flagship-loop-step",     proofClass: "lineage",      displayName: "Flagship Loop Step",       storageTable: "flagship_loop_completions",           storageMedium: "event-stream", retentionDays: 365,     chained: true,  externallyAnchored: false, userVisible: false, adminVisible: true,  minimumTrustToProduce: 30 },
  { proofId: "device-attestation",     proofClass: "attestation",  displayName: "Device Attestation",       storageTable: "device_attestations",                 storageMedium: "db-row",       retentionDays: 365 * 2, chained: true,  externallyAnchored: true,  userVisible: false, adminVisible: true,  minimumTrustToProduce: 80 },
  { proofId: "consent-record",         proofClass: "consent",      displayName: "User Consent Record",      storageTable: "consent_records",                     storageMedium: "db-row",       retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: true,  adminVisible: true,  minimumTrustToProduce: 0  },
  { proofId: "reversal-receipt",       proofClass: "reversal",     displayName: "Reversal Receipt",         storageTable: "reversal_receipts",                   storageMedium: "db-row",       retentionDays: 365 * 7, chained: true,  externallyAnchored: false, userVisible: true,  adminVisible: true,  minimumTrustToProduce: 60 },
] as const;

export function getProofEntry(proofId: string): ProofRegistryEntry | undefined {
  return PROOF_REGISTRY.find((e) => e.proofId === proofId);
}

export function getProofsByClass(proofClass: ProofClass): readonly ProofRegistryEntry[] {
  return PROOF_REGISTRY.filter((e) => e.proofClass === proofClass);
}

export function userVisibleProofs(): readonly ProofRegistryEntry[] {
  return PROOF_REGISTRY.filter((e) => e.userVisible);
}
