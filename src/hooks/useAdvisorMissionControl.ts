// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor & Mission Control Data Hook (Contract Masking)
// Wraps advisor-mission-control mocks behind a hook interface.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as amc from "@/data/fixtures/mock-data/advisor-mission-control";

export type { AdvisorSummary, AdvisorRecommendation, SafeModeState } from "@/data/fixtures/mock-data/advisor-mission-control";

// ── Named re-exports for module-scope usage in sub-components ──
// Pages import these instead of importing from mock-data directly.
export const advisors = amc.advisors;
export const recommendations = amc.recommendations;
export const synthesis = amc.synthesis;
export const approvals = amc.approvals;
export const proofHistory = amc.proofHistory;
export const simulations = amc.simulations;
export const memoryItems = amc.memoryItems;
export const internalAgents = amc.internalAgents;
export const incidents = amc.incidents;
export const connectorHealth = amc.connectorHealth;
export const stuckWorkflows = amc.stuckWorkflows;
export const costAnomalies = amc.costAnomalies;
export const policyAnomalies = amc.policyAnomalies;
export const releaseSafety = amc.releaseSafety;
export const safeMode = amc.safeMode;

export function useAdvisorMissionControl() {
  const { isDemoMode } = useDataMode();

  return {
    isDemoMode,
    advisors: amc.advisors,
    recommendations: amc.recommendations,
    synthesis: amc.synthesis,
    approvals: amc.approvals,
    proofHistory: amc.proofHistory,
    simulations: amc.simulations,
    memoryItems: amc.memoryItems,
    internalAgents: amc.internalAgents,
    incidents: amc.incidents,
    connectorHealth: amc.connectorHealth,
    stuckWorkflows: amc.stuckWorkflows,
    costAnomalies: amc.costAnomalies,
    policyAnomalies: amc.policyAnomalies,
    releaseSafety: amc.releaseSafety,
    safeMode: amc.safeMode,
  };
}
