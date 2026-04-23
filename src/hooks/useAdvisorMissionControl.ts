// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor & Mission Control Data Hook (Contract Masking)
// Wraps advisor-mission-control mocks behind a hook interface.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as amc from "@/data/fixtures/mock-data/advisor-mission-control";

export type { AdvisorSummary, AdvisorRecommendation, SafeModeState } from "@/data/fixtures/mock-data/advisor-mission-control";

// ── Named re-exports for module-scope usage in sub-components ──
// Pages import these instead of importing from mock-data directly.
export const advisors = amc.mockAdvisors;
export const recommendations = amc.mockRecommendations;
export const synthesis = amc.mockSynthesis;
export const approvals = amc.mockApprovals;
export const proofHistory = amc.mockProofHistory;
export const simulations = amc.mockSimulations;
export const memoryItems = amc.mockMemoryItems;
export const internalAgents = amc.mockInternalAgents;
export const incidents = amc.mockIncidents;
export const connectorHealth = amc.mockConnectorHealth;
export const stuckWorkflows = amc.mockStuckWorkflows;
export const costAnomalies = amc.mockCostAnomalies;
export const policyAnomalies = amc.mockPolicyAnomalies;
export const releaseSafety = amc.mockReleaseSafety;
export const safeMode = amc.mockSafeMode;

export function useAdvisorMissionControl() {
  const { isDemoMode } = useDataMode();

  return {
    isDemoMode,
    advisors: amc.mockAdvisors,
    recommendations: amc.mockRecommendations,
    synthesis: amc.mockSynthesis,
    approvals: amc.mockApprovals,
    proofHistory: amc.mockProofHistory,
    simulations: amc.mockSimulations,
    memoryItems: amc.mockMemoryItems,
    internalAgents: amc.mockInternalAgents,
    incidents: amc.mockIncidents,
    connectorHealth: amc.mockConnectorHealth,
    stuckWorkflows: amc.mockStuckWorkflows,
    costAnomalies: amc.mockCostAnomalies,
    policyAnomalies: amc.mockPolicyAnomalies,
    releaseSafety: amc.mockReleaseSafety,
    safeMode: amc.mockSafeMode,
  };
}
