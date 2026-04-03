// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Domain Contracts (Barrel)
// ═══════════════════════════════════════════════════════════════

// ── Existing types (kept inline for backward compat) ─────────
export interface Lead {
  id: string;
  name: string;
  email: string;
  status: "new" | "qualified" | "nurturing" | "lost" | "won";
  score: number;
  lastContact: string;
}

export interface CRMContact {
  id: string;
  accountId: string;
  name: string;
  role: string;
  email: string;
}

export interface CRMAccount {
  id: string;
  name: string;
  industry: string;
  healthScore: number;
}

export interface Quote {
  id: string;
  opportunityId: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected";
}

export interface Invoice {
  id: string;
  accountId: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./leads";
export * from "./opportunities";
export * from "./revenue-autopilot";
