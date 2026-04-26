// ═══════════════════════════════════════════════════════════════
// TrustStateRegistry — UI catalog (Wave 9.2)
//
// Authored cross-domain trust catalog: domain trust posture, proof
// link graph, degraded surfaces. Live trust signals overlay this
// baseline via SecurityFabric posture and runtime trust events.
// ═══════════════════════════════════════════════════════════════

export type TrustStatus = "verified" | "degraded" | "unknown" | "failed";

export interface DomainTrust {
  domain: string;
  status: TrustStatus;
  proofCoverage: number;
  approvalChainComplete: boolean;
  receiptLinked: boolean;
  lastVerified: string;
  degradedReason?: string;
}

export interface ProofNode {
  id: string;
  type: string;
  from: string;
  to: string;
  status: TrustStatus;
  evidenceCount: number;
}

export interface DegradedSurface {
  surface: string;
  state: "fallback" | "partial" | "missing";
  source: string;
  reason: string;
  since: string;
}

export const TRUST_STATUS_BADGE: Record<TrustStatus, string> = {
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  unknown: "bg-muted text-muted-foreground border-border",
};

/** Authored cross-domain trust posture. */
export const TRUST_DOMAINS: DomainTrust[] = [
  { domain: "Business OS", status: "verified", proofCoverage: 94, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:30:00Z" },
  { domain: "Finance OS", status: "verified", proofCoverage: 91, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:28:00Z" },
  { domain: "Concierge OS", status: "degraded", proofCoverage: 72, approvalChainComplete: true, receiptLinked: false, lastVerified: "2026-04-10T08:15:00Z", degradedReason: "Receipt linkage incomplete for booking flows" },
  { domain: "Admin Control Plane", status: "verified", proofCoverage: 97, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:32:00Z" },
  { domain: "Boardroom", status: "verified", proofCoverage: 88, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:25:00Z" },
  { domain: "Device Layer", status: "degraded", proofCoverage: 65, approvalChainComplete: false, receiptLinked: false, lastVerified: "2026-04-10T07:00:00Z", degradedReason: "Apple Watch trust chain not fully verified" },
  { domain: "AI Gateway", status: "verified", proofCoverage: 96, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:31:00Z" },
  { domain: "Connector Control", status: "degraded", proofCoverage: 78, approvalChainComplete: true, receiptLinked: false, lastVerified: "2026-04-10T08:45:00Z", degradedReason: "3 connectors missing sync receipts" },
];

/** Authored proof link graph. */
export const TRUST_PROOF_NODES: ProofNode[] = [
  { id: "p1", type: "Approval → Receipt", from: "Invoice #4821", to: "Receipt R-4821", status: "verified", evidenceCount: 4 },
  { id: "p2", type: "Policy → Execution", from: "Budget Policy BP-3", to: "Spend Action SA-112", status: "verified", evidenceCount: 3 },
  { id: "p3", type: "Trigger → Approval", from: "Lead Recovery Signal", to: "Autopilot Approval AA-7", status: "degraded", evidenceCount: 1 },
  { id: "p4", type: "Execution → Receipt", from: "Connector Sync CS-19", to: "Receipt R-CS-19", status: "failed", evidenceCount: 0 },
  { id: "p5", type: "Approval → Execution", from: "Release Gate RG-5", to: "Deployment D-2.14", status: "verified", evidenceCount: 5 },
  { id: "p6", type: "Event → Projection", from: "OrderCreated E-901", to: "Revenue Projection RP-42", status: "verified", evidenceCount: 2 },
];

/** Authored degraded surfaces. */
export const TRUST_DEGRADED_SURFACES: DegradedSurface[] = [
  { surface: "Booking Continuity", state: "fallback", source: "Concierge OS", reason: "External calendar sync stale >10m", since: "2026-04-10T08:00:00Z" },
  { surface: "Device Trust Chain", state: "partial", source: "Device Layer", reason: "Apple Watch handoff not verified", since: "2026-04-10T06:30:00Z" },
  { surface: "Connector Receipts", state: "missing", source: "Connector Control", reason: "3 connectors have no sync receipts", since: "2026-04-10T07:45:00Z" },
];