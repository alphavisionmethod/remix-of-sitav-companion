// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Projection Service
// Recent receipts + chain status
// ═══════════════════════════════════════════════════════════════

export interface ProofProjection {
  timestamp: string;
  chainLength: number;
  chainIntegrity: "valid" | "broken" | "unknown";
  recentReceipts: RecentReceiptSummary[];
  bundleCount: number;
  lastVerification: { actionId: string; match: boolean; timestamp: string } | null;
}

export interface RecentReceiptSummary {
  id: string;
  type: string;
  timestamp: string;
  domain: string;
  summary: string;
}

export function generateProofProjection(): ProofProjection {
  return {
    timestamp: new Date().toISOString(),
    chainLength: 147,
    chainIntegrity: "valid",
    recentReceipts: [
      { id: "r-1", type: "execution", timestamp: new Date(Date.now() - 600000).toISOString(), domain: "finance", summary: "Payment of $2,450 to vendor" },
      { id: "r-2", type: "approval", timestamp: new Date(Date.now() - 1200000).toISOString(), domain: "finance", summary: "Owner approved transfer" },
      { id: "r-3", type: "action", timestamp: new Date(Date.now() - 1800000).toISOString(), domain: "business", summary: "Follow-up email sent to Acme Corp" },
      { id: "r-4", type: "verification", timestamp: new Date(Date.now() - 3600000).toISOString(), domain: "finance", summary: "Balance reconciliation verified" },
    ],
    bundleCount: 34,
    lastVerification: { actionId: "act-45", match: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
  };
}

