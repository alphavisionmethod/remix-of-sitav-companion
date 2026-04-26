// ═══════════════════════════════════════════════════════════════
// ProofMatrixExplorer — UI catalog (Wave 9.2)
//
// Authored proof catalog: receipt records, evidence chains,
// finality classifications. Live receipts come from the receipt
// verification context; this file provides operator-facing
// reference proof records and color/finality maps.
// ═══════════════════════════════════════════════════════════════

export type ProofType = "action" | "approval" | "verification" | "rollback" | "payment" | "system";
export type Finality = "tentative" | "provisional" | "committed" | "finalized" | "irreversible";

export interface ProofRecord {
  id: string;
  type: ProofType;
  action: string;
  actor: string;
  timestamp: string;
  verified: boolean;
  receiptId?: string;
  evidenceCount: number;
  chain: string[];
  domain: string;
  finality: Finality;
  rollbackEligible: boolean;
}

export const PROOF_TYPE_CONFIG: Record<ProofType, { color: string; label: string }> = {
  action: { color: "text-blue-400", label: "Action" },
  approval: { color: "text-purple-400", label: "Approval" },
  verification: { color: "text-emerald-400", label: "Verification" },
  rollback: { color: "text-amber-400", label: "Rollback" },
  payment: { color: "text-green-400", label: "Payment" },
  system: { color: "text-muted-foreground", label: "System" },
};

export const PROOF_FINALITY_CONFIG: Record<Finality, { color: string }> = {
  tentative: { color: "text-muted-foreground" },
  provisional: { color: "text-amber-400" },
  committed: { color: "text-blue-400" },
  finalized: { color: "text-emerald-400" },
  irreversible: { color: "text-red-400" },
};

/** Authored proof matrix records. */
export const PROOF_RECORDS: ProofRecord[] = [
  {
    id: "pr-001", type: "approval", action: "Approved release v2.14.0 promotion",
    actor: "release-manager", timestamp: "2026-04-08T10:30:00Z",
    verified: true, receiptId: "rcpt-r214", evidenceCount: 5,
    chain: ["proposal", "review", "approval", "promotion", "smoke-test"],
    domain: "platform", finality: "irreversible", rollbackEligible: false,
  },
  {
    id: "pr-002", type: "action", action: "Connector Slack reconnect",
    actor: "ops-team", timestamp: "2026-04-10T08:15:00Z",
    verified: true, receiptId: "rcpt-c019", evidenceCount: 3,
    chain: ["intent", "approval", "exec"],
    domain: "connector", finality: "committed", rollbackEligible: true,
  },
  {
    id: "pr-003", type: "rollback", action: "Reverted budget policy BP-3 update",
    actor: "finance-lead", timestamp: "2026-04-08T14:30:00Z",
    verified: true, receiptId: "rcpt-bp3", evidenceCount: 4,
    chain: ["trigger", "approval", "rollback", "verify"],
    domain: "finance", finality: "finalized", rollbackEligible: false,
  },
  {
    id: "pr-004", type: "verification", action: "Verified RLS coverage on profiles",
    actor: "security-auditor", timestamp: "2026-04-09T11:00:00Z",
    verified: true, evidenceCount: 2,
    chain: ["scan", "verify"],
    domain: "security", finality: "committed", rollbackEligible: false,
  },
  {
    id: "pr-005", type: "payment", action: "Stripe invoice charge — Acme Apr",
    actor: "billing-system", timestamp: "2026-04-01T09:00:00Z",
    verified: true, receiptId: "rcpt-stripe-441", evidenceCount: 6,
    chain: ["invoice", "approval", "charge", "settle", "receipt", "ledger"],
    domain: "finance", finality: "irreversible", rollbackEligible: false,
  },
  {
    id: "pr-006", type: "system", action: "Auto-scaled projection-worker to 3 replicas",
    actor: "auto-scaler", timestamp: "2026-04-10T10:15:00Z",
    verified: false, evidenceCount: 1,
    chain: ["signal", "scale"],
    domain: "platform", finality: "provisional", rollbackEligible: true,
  },
  {
    id: "pr-007", type: "approval", action: "Approved AI Cache v2 promotion",
    actor: "cost-engineer", timestamp: "2026-04-09T16:20:00Z",
    verified: true, receiptId: "rcpt-cache-v2", evidenceCount: 4,
    chain: ["proposal", "review", "approval", "deploy"],
    domain: "ai-platform", finality: "finalized", rollbackEligible: true,
  },
  {
    id: "pr-008", type: "action", action: "Migrated concierge bookings to receipt-emitter v2",
    actor: "backend-engineer", timestamp: "2026-04-09T13:00:00Z",
    verified: false, evidenceCount: 2,
    chain: ["plan", "exec"],
    domain: "concierge", finality: "tentative", rollbackEligible: true,
  },
];