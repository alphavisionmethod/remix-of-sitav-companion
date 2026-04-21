// ═══════════════════════════════════════════════════════════════
// SITA OS — Cost Model
// Unit economics estimation framework
// ═══════════════════════════════════════════════════════════════

export interface CostCategory {
  id: string;
  name: string;
  subsystem: string;
  monthlyEstimateUsd: number;
  costDriver: string;
  scaleFactor: string;
  notes: string;
}

export const COST_MODEL: readonly CostCategory[] = [
  { id: "CC-001", name: "Database (Postgres)", subsystem: "infrastructure", monthlyEstimateUsd: 25, costDriver: "Row count + connections", scaleFactor: "Linear with users", notes: "Lovable Cloud managed" },
  { id: "CC-002", name: "Edge Functions Compute", subsystem: "infrastructure", monthlyEstimateUsd: 10, costDriver: "Invocations + duration", scaleFactor: "Linear with AI calls", notes: "Cold start impact" },
  { id: "CC-003", name: "Storage (Files/Documents)", subsystem: "infrastructure", monthlyEstimateUsd: 5, costDriver: "GB stored + bandwidth", scaleFactor: "Linear with uploads", notes: "Deal room docs main driver" },
  { id: "CC-004", name: "AI Inference (Primary Models)", subsystem: "ai", monthlyEstimateUsd: 50, costDriver: "Token count", scaleFactor: "Per session × tokens", notes: "Budget-gated, fallback reduces cost" },
  { id: "CC-005", name: "AI Inference (Fallback Models)", subsystem: "ai", monthlyEstimateUsd: 10, costDriver: "Token count (cheaper models)", scaleFactor: "Triggered by failures", notes: "Cost savings vs primary" },
  { id: "CC-006", name: "Email/Messaging Delivery", subsystem: "messaging", monthlyEstimateUsd: 15, costDriver: "Messages sent", scaleFactor: "Linear with campaigns", notes: "Transactional + campaign" },
  { id: "CC-007", name: "Analytics/Attribution", subsystem: "analytics", monthlyEstimateUsd: 5, costDriver: "Events tracked", scaleFactor: "Linear with traffic", notes: "Event volume dependent" },
  { id: "CC-008", name: "CDN/Static Assets", subsystem: "infrastructure", monthlyEstimateUsd: 5, costDriver: "Bandwidth", scaleFactor: "Linear with traffic", notes: "Build downloads add spikes" },
] as const;

export interface UnitEconomics {
  totalMonthlyUsd: number;
  costPerActiveUser: number;
  costPerAiSession: number;
  costPerBoardroomSession: number;
  costPerCampaignSend: number;
  aiCostPercent: number;
}

export function estimateUnitEconomics(
  activeUsers: number = 100,
  aiSessionsPerMonth: number = 500,
  boardroomSessionsPerMonth: number = 50,
  campaignSendsPerMonth: number = 1000
): UnitEconomics {
  const totalMonthly = COST_MODEL.reduce((sum, c) => sum + c.monthlyEstimateUsd, 0);
  const aiCost = COST_MODEL.filter((c) => c.subsystem === "ai").reduce((sum, c) => sum + c.monthlyEstimateUsd, 0);
  return {
    totalMonthlyUsd: totalMonthly,
    costPerActiveUser: activeUsers > 0 ? Math.round((totalMonthly / activeUsers) * 100) / 100 : 0,
    costPerAiSession: aiSessionsPerMonth > 0 ? Math.round((aiCost / aiSessionsPerMonth) * 100) / 100 : 0,
    costPerBoardroomSession: boardroomSessionsPerMonth > 0 ? Math.round(((aiCost * 0.4) / boardroomSessionsPerMonth) * 100) / 100 : 0,
    costPerCampaignSend: campaignSendsPerMonth > 0 ? Math.round((15 / campaignSendsPerMonth) * 1000) / 1000 : 0,
    aiCostPercent: totalMonthly > 0 ? Math.round((aiCost / totalMonthly) * 100) : 0,
  };
}