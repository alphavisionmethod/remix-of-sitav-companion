// ═══════════════════════════════════════════════════════════════
// InvestorProofLedger — UI catalog (Wave 9.2)
//
// Authored ledger catalog: investor-grade proof entries, evidence
// bundles, migration snapshots, rollback evidence, compliance trails.
// ═══════════════════════════════════════════════════════════════

export type ProofStepStatus = "verified" | "pending" | "missing";
export type BundleStatus = "ready" | "building" | "failed";
export type ComplianceStatus = "compliant" | "partial" | "not_applicable" | "non_compliant";

export interface ProofChainStep {
  step: string;
  status: ProofStepStatus;
}

export interface ProofLedgerEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  proofChain: ProofChainStep[];
  rollbackEvidence: boolean;
  approvalContext: boolean;
  exportable: boolean;
}

export interface EvidenceBundle {
  id: string;
  name: string;
  entries: number;
  format: "compliance" | "pr-ready" | "investor";
  status: BundleStatus;
  createdAt: string;
}

export interface MigrationSnapshot {
  id: string;
  title: string;
  decision: string;
  actor: string;
  date: string;
  evidenceCount: number;
  rollbackReady: boolean;
}

export interface RollbackEvidenceEntry {
  id: string;
  action: string;
  rolledBackAt: string;
  reason: string;
  restorePoint: string;
  verified: boolean;
}

export interface ComplianceTrail {
  id: string;
  regulation: string;
  status: ComplianceStatus;
  lastAudit: string;
  gaps: number;
  evidenceEntries: number;
}

export const PROOF_STEP_BADGE: Record<ProofStepStatus, string> = {
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  missing: "bg-red-500/10 text-red-500 border-red-500/20",
};

/** Authored proof ledger entries with full chains. */
export const PROOF_LEDGER: ProofLedgerEntry[] = [
  {
    id: "pl-1",
    action: "Database Schema v4.2 Migration",
    actor: "CTO",
    timestamp: "2026-04-05T10:30:00Z",
    proofChain: [
      { step: "Proposal", status: "verified" },
      { step: "Approval", status: "verified" },
      { step: "Simulation", status: "verified" },
      { step: "Execution", status: "verified" },
      { step: "Receipt", status: "verified" },
    ],
    rollbackEvidence: true,
    approvalContext: true,
    exportable: true,
  },
  {
    id: "pl-2",
    action: "Budget Policy BP-3 Update",
    actor: "Finance Lead",
    timestamp: "2026-04-08T14:30:00Z",
    proofChain: [
      { step: "Proposal", status: "verified" },
      { step: "Approval", status: "verified" },
      { step: "Execution", status: "verified" },
      { step: "Receipt", status: "verified" },
    ],
    rollbackEvidence: true,
    approvalContext: true,
    exportable: true,
  },
  {
    id: "pl-3",
    action: "Connector Sync Configuration Change",
    actor: "Ops Engineer",
    timestamp: "2026-04-09T09:15:00Z",
    proofChain: [
      { step: "Proposal", status: "verified" },
      { step: "Approval", status: "verified" },
      { step: "Execution", status: "verified" },
      { step: "Receipt", status: "missing" },
    ],
    rollbackEvidence: false,
    approvalContext: true,
    exportable: false,
  },
  {
    id: "pl-4",
    action: "Release v2.14 Promotion",
    actor: "Release Manager",
    timestamp: "2026-04-08T10:30:00Z",
    proofChain: [
      { step: "Gate Review", status: "verified" },
      { step: "Approval", status: "verified" },
      { step: "Promotion", status: "verified" },
      { step: "Smoke Tests", status: "verified" },
      { step: "Receipt", status: "verified" },
    ],
    rollbackEvidence: true,
    approvalContext: true,
    exportable: true,
  },
];

/** Authored evidence bundles. */
export const EVIDENCE_BUNDLES: EvidenceBundle[] = [
  { id: "eb1", name: "Q1 2026 Platform Actions", entries: 47, format: "compliance", status: "ready", createdAt: "2026-04-01" },
  { id: "eb2", name: "Release v2.14 Evidence", entries: 12, format: "pr-ready", status: "ready", createdAt: "2026-04-08" },
  { id: "eb3", name: "Investor Due Diligence Pack", entries: 89, format: "compliance", status: "building", createdAt: "2026-04-10" },
];

/** Authored migration snapshot decisions. */
export const MIGRATION_SNAPSHOTS: MigrationSnapshot[] = [
  { id: "ms1", title: "Database Schema v4.2 Migration", decision: "Approved with rollback plan", actor: "CTO", date: "2026-04-05", evidenceCount: 8, rollbackReady: true },
  { id: "ms2", title: "AI Model Provider Switch (Anthropic → Mixed)", decision: "Approved — phased rollout", actor: "Founder Council", date: "2026-04-03", evidenceCount: 14, rollbackReady: true },
  { id: "ms3", title: "Payment Gateway Migration", decision: "Deferred — insufficient testing evidence", actor: "CTO", date: "2026-03-28", evidenceCount: 3, rollbackReady: false },
];

/** Authored rollback evidence ledger. */
export const ROLLBACK_EVIDENCE: RollbackEvidenceEntry[] = [
  { id: "re1", action: "AI Routing Override — Advisory Capability", rolledBackAt: "2026-04-10T08:05:00Z", reason: "Latency spike detected (p95 > 2s)", restorePoint: "Snapshot SP-441", verified: true },
  { id: "re2", action: "Budget Policy BP-3 Update", rolledBackAt: "2026-04-08T14:30:00Z", reason: "Operator reversal — threshold too aggressive", restorePoint: "Snapshot SP-438", verified: true },
  { id: "re3", action: "Connector Config — Slack Webhook", rolledBackAt: "2026-04-06T11:00:00Z", reason: "Webhook URL misconfigured — delivery failures", restorePoint: "Snapshot SP-435", verified: false },
];

/** Authored compliance trail registry. */
export const COMPLIANCE_TRAILS: ComplianceTrail[] = [
  { id: "ct1", regulation: "SOC 2 Type II", status: "compliant", lastAudit: "2026-03-15", gaps: 0, evidenceEntries: 142 },
  { id: "ct2", regulation: "GDPR Article 30", status: "compliant", lastAudit: "2026-03-20", gaps: 0, evidenceEntries: 67 },
  { id: "ct3", regulation: "ISO 27001 Annex A", status: "partial", lastAudit: "2026-02-28", gaps: 3, evidenceEntries: 89 },
  { id: "ct4", regulation: "PCI DSS v4.0", status: "not_applicable", lastAudit: "—", gaps: 0, evidenceEntries: 0 },
];