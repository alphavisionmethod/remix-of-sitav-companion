// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor & Mission Control Data Hook (Contract Masking)
// Wraps advisor-mission-control mocks behind a hook interface.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as amc from "@/lib/mock-data/advisor-mission-control";

export type { AdvisorSummary, AdvisorRecommendation, SafeModeState } from "@/lib/mock-data/advisor-mission-control";

// ── Named re-exports for module-scope usage in sub-components ──
// Pages import these instead of importing from mock-data directly.
export const mockAdvisors = amc.mockAdvisors;
export const mockRecommendations = amc.mockRecommendations;
export const mockSynthesis = amc.mockSynthesis;
export const mockApprovals = amc.mockApprovals;
export const mockProofHistory = amc.mockProofHistory;
export const mockSimulations = amc.mockSimulations;
export const mockMemoryItems = amc.mockMemoryItems;
export const mockInternalAgents = amc.mockInternalAgents;
export const mockIncidents = amc.mockIncidents;
export const mockConnectorHealth = amc.mockConnectorHealth;
export const mockStuckWorkflows = amc.mockStuckWorkflows;
export const mockCostAnomalies = amc.mockCostAnomalies;
export const mockPolicyAnomalies = amc.mockPolicyAnomalies;
export const mockReleaseSafety = amc.mockReleaseSafety;
export const mockSafeMode = amc.mockSafeMode;

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
