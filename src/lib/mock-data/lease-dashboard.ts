// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Lease Dashboard
// ═══════════════════════════════════════════════════════════════

export const MOCK_DEMO_LEASES = [
  { userId: "owner-1", advisorId: "money-advisor", entityId: "personal", intent: "Negotiate insurance renewal", capabilityId: "finance.negotiate", allowedActions: ["negotiate", "query", "compare"], allowedSystems: ["insurance-api", "comparison-engine"], durationMs: 86400000, spendCap: 500, riskCeiling: "medium" as const, requireReceipt: true, requireRollbackPosture: true },
  { userId: "owner-1", advisorId: "business-advisor", entityId: "business-1", intent: "Update CRM lead status", capabilityId: "business.update-lead", allowedActions: ["update", "query"], allowedSystems: ["crm"], durationMs: 3600000, spendCap: 0, riskCeiling: "low" as const },
  { userId: "owner-1", advisorId: "money-advisor", entityId: "personal", intent: "Pay utility bills", capabilityId: "finance.pay-bill", allowedActions: ["pay", "schedule", "query"], allowedSystems: ["plaid", "bank-api"], durationMs: 7200000, spendCap: 1000, riskCeiling: "high" as const, requireReceipt: true, requireApprovalAbove: 200 },
  { userId: "owner-1", advisorId: "concierge-advisor", entityId: "household", intent: "Order weekly groceries", capabilityId: "concierge.order", allowedActions: ["order", "query", "compare"], allowedSystems: ["grocery-api"], durationMs: 172800000, spendCap: 300, riskCeiling: "low" as const, requireSimulation: true },
];
