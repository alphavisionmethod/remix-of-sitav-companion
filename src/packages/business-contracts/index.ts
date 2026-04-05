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

// ── New sub-modules ─────────────────────────────────────────
export * from "./_contract-scaffold";
export * from "./booking";
export * from "./booking-confirmation";
export * from "./business-boardroom-packet";
export * from "./business-kpi";
export * from "./callback-task";
export * from "./capacity-monetization-signal";
export * from "./collection-step";
export * from "./collection-sequence";
export * from "./contact-record";
export * from "./customer-lifecycle";
export * from "./customer-dashboard";

// ── Core business entities (expanded) ───────────────────────
export * from "./deal";
export * from "./deal-risk";
export * from "./lead-expanded";
export * from "./quote-expanded";
export * from "./opportunity-record";
export * from "./pipeline-stage";
export * from "./customer-message";

// ── Revenue intelligence ────────────────────────────────────
export * from "./pricing-proposal";
export * from "./revenue-leakage-signal";
export * from "./repeat-purchase-timing";

// ── Collections & follow-up ─────────────────────────────────
export * from "./invoice-followup";
export * from "./no-show-risk";

// ── Outreach & communication ────────────────────────────────
export * from "./outbound-communication";
export * from "./outreach-plan";
export * from "./referral-prompt";
export * from "./handoff-route";

// ── Service & operations ────────────────────────────────────
export * from "./review-request";
export * from "./service-order";
export * from "./task-assignment";

// ── Vertical configuration ──────────────────────────────────
export * from "./vertical-approval-default";
export * from "./vertical-comms-template";
export * from "./vertical-pack-config";
export * from "./vertical-playbook";
export * from "./vertical-role-default";

// ── Sub-packages ────────────────────────────────────────────
export * from "./revenue-ops";
export * from "./website";
