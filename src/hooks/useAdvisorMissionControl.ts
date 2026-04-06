// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Mission Control Data Hook
// Masks mock data behind a clean contract interface.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  mockAdvisors, mockRecommendations, mockSimulations, mockApprovals,
  mockProofHistory, mockMemoryItems, mockSynthesis,
  mockInternalAgents, mockIncidents, mockConnectorHealth,
  mockStuckWorkflows, mockCostAnomalies, mockPolicyAnomalies,
  mockReleaseSafety,
} from "@/lib/mock-data/advisor-mission-control";
import type {
  AdvisorSummary, AdvisorRecommendation, SimulationResult,
  ApprovalRequest, ProofHistoryItem, MemoryItem,
  MultiAdvisorSynthesis, InternalAgentSummary, IncidentSummary,
  ConnectorHealthItem, StuckWorkflow, CostAnomaly,
  PolicyAnomaly, ReleaseSafetyState,
} from "@/lib/mock-data/advisor-mission-control";

export type {
  AdvisorSummary, AdvisorRecommendation, SimulationResult,
  ApprovalRequest, ProofHistoryItem, MemoryItem,
  MultiAdvisorSynthesis, InternalAgentSummary, IncidentSummary,
  ConnectorHealthItem, StuckWorkflow, CostAnomaly,
  PolicyAnomaly, ReleaseSafetyState,
};

export interface AdvisorMissionControlData {
  advisors: AdvisorSummary[];
  recommendations: AdvisorRecommendation[];
  simulations: SimulationResult[];
  approvals: ApprovalRequest[];
  proofHistory: ProofHistoryItem[];
  memoryItems: MemoryItem[];
  synthesis: MultiAdvisorSynthesis[];
  internalAgents: InternalAgentSummary[];
  incidents: IncidentSummary[];
  connectorHealth: ConnectorHealthItem[];
  stuckWorkflows: StuckWorkflow[];
  costAnomalies: CostAnomaly[];
  policyAnomalies: PolicyAnomaly[];
  releaseSafety: ReleaseSafetyState;
  isDemoData: boolean;
}

export function useAdvisorMissionControl(): AdvisorMissionControlData {
  return useMemo(() => ({
    advisors: mockAdvisors,
    recommendations: mockRecommendations,
    simulations: mockSimulations,
    approvals: mockApprovals,
    proofHistory: mockProofHistory,
    memoryItems: mockMemoryItems,
    synthesis: mockSynthesis,
    internalAgents: mockInternalAgents,
    incidents: mockIncidents,
    connectorHealth: mockConnectorHealth,
    stuckWorkflows: mockStuckWorkflows,
    costAnomalies: mockCostAnomalies,
    policyAnomalies: mockPolicyAnomalies,
    releaseSafety: mockReleaseSafety,
    isDemoData: true,
  }), []);
}
