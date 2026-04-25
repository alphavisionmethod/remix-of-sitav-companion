// ════════════════════════════════════════════════════════════
// Trust Layer — Stable platform surface for all 4 pillars
// ════════════════════════════════════════════════════════════
// This is the contract every module uses to interact with the
// trust fabric (receipts, approvals, permissions, audit, etc.).
// Keep this stable — internal services may move; this surface may not.

export const TRUST_LAYER = {
  id: "trust",
  label: "Trust Center",
  routePrefix: "/trust",
  description: "Receipts · Approvals · Permissions · Automation Authority · Audit",
} as const;

export type TrustLayer = typeof TRUST_LAYER;

// Stable hook contract — implementations live in existing services.
// Do NOT inline these in modules; always go through this surface.
export type TrustReceipt = {
  actionKey: string;
  pillar: "business" | "concierge" | "finance" | "health" | "shared";
  payload: Record<string, unknown>;
  reversible?: boolean;
};

export type ApprovalRequest = {
  actionKey: string;
  pillar: TrustReceipt["pillar"];
  justification: string;
  impactSummary?: string;
  riskTier?: "low" | "medium" | "high" | "critical";
};

// Re-export points (wired in Phase 2 when consolidation happens):
// export { emitActionReceipt } from "@/lib/services/audit-ledger";
// export { requireApproval }   from "@/lib/services/approval-engine";
// export { checkPermission }   from "@/lib/services/identity-auth";
// export { logAudit }          from "@/lib/services/audit-ledger";