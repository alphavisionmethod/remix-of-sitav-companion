// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Mobile Pages
// ═══════════════════════════════════════════════════════════════

import type { AlertItem } from "@/platform/experience/components/mobile/AlertCard";
import type { ApprovalItem } from "@/platform/experience/components/mobile/ApprovalCard";
import type { ProofItem } from "@/platform/experience/components/mobile/ProofCard";

export const MOCK_MOBILE_ALERTS: AlertItem[] = [
  { id: "alt-001", severity: "critical", title: "Collections escalation required", message: "Invoice #892 is 92 days overdue. $8,400 outstanding — requires immediate action.", domain: "business", createdAt: new Date(Date.now() - 900000).toISOString(), read: false },
  { id: "alt-002", severity: "urgent", title: "Subscription auto-renewing in 3 days", message: "Notion Teams ($200/mo) will auto-renew. Usage score: 12%. Consider cancellation.", domain: "finance", createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "alt-003", severity: "warning", title: "Calendar conflict detected", message: "Client meeting and school pickup overlap on Thursday 3:30 PM. Needs resolution.", domain: "concierge", createdAt: new Date(Date.now() - 5400000).toISOString(), read: false },
  { id: "alt-004", severity: "warning", title: "Reserve funding below target", message: "Emergency reserve at 67% of target. Monthly contribution may need increase.", domain: "finance", createdAt: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: "alt-005", severity: "info", title: "4 leads promoted to qualified", message: "Lead scoring batch completed. 4 leads crossed qualification threshold.", domain: "business", createdAt: new Date(Date.now() - 10800000).toISOString(), read: true },
  { id: "alt-006", severity: "info", title: "Travel prep checklist generated", message: "NYC trip Mar 15-17: 6 prep items created. 0/6 completed.", domain: "concierge", createdAt: new Date(Date.now() - 14400000).toISOString(), read: true },
];

export const MOCK_MOBILE_APPROVALS: ApprovalItem[] = [
  { id: "apr-001", title: "Payment to vendor — Atlas Corp", domain: "finance", urgency: "high", requestedAt: new Date(Date.now() - 3600000).toISOString(), summary: "Wire transfer $12,500 for Q2 consulting retainer", amountCents: 1250000 },
  { id: "apr-002", title: "Lead reassignment — 8 stale leads", domain: "business", urgency: "medium", requestedAt: new Date(Date.now() - 7200000).toISOString(), summary: "Auto-detected 8 leads with 30+ days no contact. Reassigning to active reps." },
  { id: "apr-003", title: "Cancel subscription — Notion Teams", domain: "finance", urgency: "low", requestedAt: new Date(Date.now() - 14400000).toISOString(), summary: "Detected low usage (12%). Annual renewal in 14 days. Potential savings: $2,400/yr", amountCents: 240000 },
  { id: "apr-004", title: "Travel booking — NYC client visit", domain: "concierge", urgency: "medium", requestedAt: new Date(Date.now() - 21600000).toISOString(), summary: "Flight + hotel for March 15-17 client meeting. Budget: $1,800", amountCents: 180000 },
  { id: "apr-005", title: "Collections escalation — Invoice #892", domain: "business", urgency: "critical", requestedAt: new Date(Date.now() - 1800000).toISOString(), summary: "Invoice 92 days overdue. $8,400 outstanding. Recommend payment plan offer.", amountCents: 840000 },
];

export const MOCK_MOBILE_PROOFS: ProofItem[] = [
  { id: "prf-001", type: "receipt", title: "Invoice #1042 payment processed", status: "verified", timestamp: new Date(Date.now() - 1200000).toISOString(), domain: "Finance", hash: "a3f8c1d9e2b4567890abcdef12345678" },
  { id: "prf-002", type: "execution", title: "Lead scoring batch completed", status: "verified", timestamp: new Date(Date.now() - 3600000).toISOString(), domain: "Business", hash: "b7e2a4f1c3d8901234567890abcdef01" },
  { id: "prf-003", type: "verification", title: "Reserve health assessment", status: "verified", timestamp: new Date(Date.now() - 7200000).toISOString(), domain: "Finance", hash: "c9d1b3e5a7f2345678901234abcdef56" },
  { id: "prf-004", type: "execution", title: "Grocery list auto-generated", status: "pending", timestamp: new Date(Date.now() - 10800000).toISOString(), domain: "Concierge" },
  { id: "prf-005", type: "receipt", title: "Subscription cancellation — Dropbox", status: "verified", timestamp: new Date(Date.now() - 14400000).toISOString(), domain: "Finance", hash: "d2e4f6a8b0c1234567890abcdef78901" },
  { id: "prf-006", type: "verification", title: "Calendar conflict resolution", status: "failed", timestamp: new Date(Date.now() - 18000000).toISOString(), domain: "Concierge" },
  { id: "prf-007", type: "receipt", title: "Collections notice sent — Invoice #892", status: "verified", timestamp: new Date(Date.now() - 21600000).toISOString(), domain: "Business", hash: "e5f7a9b1c3d456789012345678abcdef" },
];

export const MOCK_MOBILE_WORKFLOW_STEPS = [
  { id: "s1", label: "Trigger: Invoice overdue", status: "completed" as const, detail: "Detected at 3:41 PM", time: "3:41 PM" as string | undefined },
  { id: "s2", label: "Classify & route", status: "completed" as const, detail: "Routed to Finance advisor", time: "3:41 PM" as string | undefined },
  { id: "s3", label: "Generate reminder email", status: "completed" as const, detail: "Template: friendly-reminder", time: "3:42 PM" as string | undefined },
  { id: "s4", label: "Owner approval", status: "active" as const, detail: "Awaiting your decision", time: "3:42 PM" as string | undefined },
  { id: "s5", label: "Send email", status: "pending" as const, detail: "", time: undefined as string | undefined },
  { id: "s6", label: "Create receipt", status: "pending" as const, detail: "", time: undefined as string | undefined },
];
