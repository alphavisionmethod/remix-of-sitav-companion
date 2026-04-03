// ═══════════════════════════════════════════════════════════════
// SITA OS — Home Projection Service
// Aggregates pulse metrics across all domains
// ═══════════════════════════════════════════════════════════════

export interface HomePulse {
  timestamp: string;
  overallHealth: number;
  pendingApprovals: number;
  activeWorkflows: number;
  recentAlerts: number;
  domainSummaries: DomainPulseSummary[];
  quickActions: QuickAction[];
}

export interface DomainPulseSummary {
  domain: string;
  healthScore: number;
  trend: "improving" | "stable" | "declining";
  topMetric: { label: string; value: string };
  alertCount: number;
}

export interface QuickAction {
  id: string;
  label: string;
  domain: string;
  capabilityId: string;
  priority: "high" | "medium" | "low";
}

export function generateHomePulse(): HomePulse {
  const domains: DomainPulseSummary[] = [
    { domain: "business", healthScore: 82, trend: "improving", topMetric: { label: "Pipeline", value: "$1.2M" }, alertCount: 2 },
    { domain: "finance", healthScore: 91, trend: "stable", topMetric: { label: "Cash Position", value: "$340K" }, alertCount: 1 },
    { domain: "concierge", healthScore: 76, trend: "declining", topMetric: { label: "Tasks Due", value: "7" }, alertCount: 3 },
  ];

  const quickActions: QuickAction[] = [
    { id: "qa-1", label: "Review 3 pending approvals", domain: "platform", capabilityId: "approval-review", priority: "high" },
    { id: "qa-2", label: "Follow up on overdue invoice", domain: "business", capabilityId: "biz-comms-send", priority: "high" },
    { id: "qa-3", label: "Pay upcoming bills ($2,450)", domain: "finance", capabilityId: "fin-payment-execute", priority: "medium" },
    { id: "qa-4", label: "Confirm restaurant reservation", domain: "concierge", capabilityId: "con-booking-create", priority: "medium" },
  ];

  const avgHealth = domains.reduce((a, d) => a + d.healthScore, 0) / domains.length;

  return {
    timestamp: new Date().toISOString(),
    overallHealth: Math.round(avgHealth),
    pendingApprovals: 3,
    activeWorkflows: 5,
    recentAlerts: domains.reduce((a, d) => a + d.alertCount, 0),
    domainSummaries: domains,
    quickActions,
  };
}
