// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor & Mission Control Data Hook (Contract Masking)
// Wraps advisor-mission-control mocks behind a hook interface.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as amc from "@/lib/mock-data/advisor-mission-control";

export type { AdvisorSummary, AdvisorRecommendation, SafeModeState } from "@/lib/mock-data/advisor-mission-control";

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
