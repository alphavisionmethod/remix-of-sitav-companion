// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Workflow Replay
// ═══════════════════════════════════════════════════════════════

import type { ReplayableWorkflowView } from "@/packages/contracts";

export const MOCK_REPLAYABLE_WORKFLOWS: ReplayableWorkflowView[] = [
  { id: "wf-001", name: "Invoice Payment — Acme Corp", domain: "finance", status: "failed", failedAt: new Date(Date.now() - 3600000).toISOString(), stuckReason: "Connector timeout", replayCount: 0, riskLevel: "medium" },
  { id: "wf-002", name: "Lead Follow-up — Enterprise Deal", domain: "business", status: "replayable", replayCount: 1, lastReplay: new Date(Date.now() - 7200000).toISOString(), riskLevel: "low" },
  { id: "wf-003", name: "Grocery Reorder — Weekly Supplies", domain: "concierge", status: "risky", stuckReason: "Payment method expired", replayCount: 0, riskLevel: "high" },
  { id: "wf-004", name: "Customer Health Check — Q1 Batch", domain: "business", status: "completed", replayCount: 2, lastReplay: new Date(Date.now() - 86400000).toISOString(), riskLevel: "low" },
  { id: "wf-005", name: "Budget Reconciliation — March", domain: "finance", status: "replayable", replayCount: 0, riskLevel: "medium" },
  { id: "wf-006", name: "Subscription Renewal — BigCorp", domain: "business", status: "failed", failedAt: new Date(Date.now() - 7200000).toISOString(), stuckReason: "API rate limit", replayCount: 1, riskLevel: "high" },
];
