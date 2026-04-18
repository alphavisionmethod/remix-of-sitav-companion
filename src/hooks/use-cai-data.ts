// ═══════════════════════════════════════════════════════════════
// SITA OS — CAI React Hooks
// TanStack Query hooks for all 23 CAI ambient intelligence tables
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as cai from "@/data/repositories/cai-data-service";

function useCaiList(key: string, fetcher: (f?: any) => Promise<any[]>) {
  return useQuery({ queryKey: [key], queryFn: () => fetcher() });
}

function useCaiMutation(key: string, mutator: (data: any) => Promise<any>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mutator,
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

// ── Graph ───────────────────────────────────────────────────────
export const useGraphNodes = () => useCaiList("cai-graph-nodes", cai.graphNodes.list);
export const useCreateGraphNode = () => useCaiMutation("cai-graph-nodes", cai.graphNodes.create);
export const useGraphEdges = () => useCaiList("cai-graph-edges", cai.graphEdges.list);
export const useCreateGraphEdge = () => useCaiMutation("cai-graph-edges", cai.graphEdges.create);

// ── Intent ──────────────────────────────────────────────────────
export const useIntentResolutions = () => useCaiList("cai-intents", cai.intents.list);
export const useCreateIntent = () => useCaiMutation("cai-intents", cai.intents.create);

// ── Commands ────────────────────────────────────────────────────
export const useCommandOrchestrations = () => useCaiList("cai-commands", cai.commands.list);
export const useCreateCommand = () => useCaiMutation("cai-commands", cai.commands.create);

// ── Priority ────────────────────────────────────────────────────
export const usePriorityStack = () => useCaiList("cai-priorities", cai.priorities.list);
export const useCreatePriority = () => useCaiMutation("cai-priorities", cai.priorities.create);

// ── Attention ───────────────────────────────────────────────────
export const useAttentionDecisions = () => useCaiList("cai-attention", cai.attentionDecisions.list);
export const useCreateAttentionDecision = () => useCaiMutation("cai-attention", cai.attentionDecisions.create);

// ── Trust Actions ───────────────────────────────────────────────
export const useTrustActions = () => useCaiList("cai-trust-actions", cai.trustActions.list);
export const useCreateTrustAction = () => useCaiMutation("cai-trust-actions", cai.trustActions.create);

// ── Escalations ─────────────────────────────────────────────────
export const useEscalations = () => useCaiList("cai-escalations", cai.escalations.list);
export const useCreateEscalation = () => useCaiMutation("cai-escalations", cai.escalations.create);

// ── Continuity ──────────────────────────────────────────────────
export const useContinuitySessions = () => useCaiList("cai-continuity", cai.continuitySessions.list);
export const useCreateContinuitySession = () => useCaiMutation("cai-continuity", cai.continuitySessions.create);

// ── Handoffs ────────────────────────────────────────────────────
export const useHandoffs = () => useCaiList("cai-handoffs", cai.handoffs.list);
export const useCreateHandoff = () => useCaiMutation("cai-handoffs", cai.handoffs.create);

// ── Assistant Roles ─────────────────────────────────────────────
export const useAssistantRoles = () => useCaiList("cai-assistant-roles", cai.assistantRoles.list);
export const useCreateAssistantRole = () => useCaiMutation("cai-assistant-roles", cai.assistantRoles.create);

// ── Assistant Sessions ──────────────────────────────────────────
export const useAssistantSessions = () => useCaiList("cai-assistant-sessions", cai.assistantSessions.list);
export const useCreateAssistantSession = () => useCaiMutation("cai-assistant-sessions", cai.assistantSessions.create);

// ── Timing ──────────────────────────────────────────────────────
export const useTimingDecisions = () => useCaiList("cai-timing", cai.timingDecisions.list);
export const useCreateTimingDecision = () => useCaiMutation("cai-timing", cai.timingDecisions.create);

// ── Relationships ───────────────────────────────────────────────
export const useRelationships = () => useCaiList("cai-relationships", cai.relationships.list);
export const useCreateRelationship = () => useCaiMutation("cai-relationships", cai.relationships.create);

// ── Obligations ─────────────────────────────────────────────────
export const useObligations = () => useCaiList("cai-obligations", cai.obligations.list);
export const useCreateObligation = () => useCaiMutation("cai-obligations", cai.obligations.create);

// ── Digests ─────────────────────────────────────────────────────
export const useDigests = () => useCaiList("cai-digests", cai.digests.list);
export const useCreateDigest = () => useCaiMutation("cai-digests", cai.digests.create);

// ── Operating Modes ─────────────────────────────────────────────
export const useOperatingModes = () => useCaiList("cai-operating-modes", cai.operatingModes.list);
export const useCreateOperatingMode = () => useCaiMutation("cai-operating-modes", cai.operatingModes.create);

// ── Interface Profiles ──────────────────────────────────────────
export const useInterfaceProfiles = () => useCaiList("cai-interface-profiles", cai.interfaceProfiles.list);
export const useCreateInterfaceProfile = () => useCaiMutation("cai-interface-profiles", cai.interfaceProfiles.create);

// ── Opportunity Signals ─────────────────────────────────────────
export const useOpportunitySignals = () => useCaiList("cai-opportunity-signals", cai.opportunitySignals.list);
export const useCreateOpportunitySignal = () => useCaiMutation("cai-opportunity-signals", cai.opportunitySignals.create);

// ── Memory Governance ───────────────────────────────────────────
export const useMemoryGovernance = () => useCaiList("cai-memory-governance", cai.memoryGovernance.list);
export const useCreateMemoryGovernanceRecord = () => useCaiMutation("cai-memory-governance", cai.memoryGovernance.create);

// ── Memory Corrections ──────────────────────────────────────────
export const useMemoryCorrections = () => useCaiList("cai-memory-corrections", cai.memoryCorrections.list);
export const useCreateMemoryCorrection = () => useCaiMutation("cai-memory-corrections", cai.memoryCorrections.create);

// ── Boundary Policies ───────────────────────────────────────────
export const useBoundaryPolicies = () => useCaiList("cai-boundary-policies", cai.boundaryPolicies.list);
export const useCreateBoundaryPolicy = () => useCaiMutation("cai-boundary-policies", cai.boundaryPolicies.create);

// ── Experience Rules ────────────────────────────────────────────
export const useExperienceRules = () => useCaiList("cai-experience-rules", cai.experienceRules.list);
export const useCreateExperienceRule = () => useCaiMutation("cai-experience-rules", cai.experienceRules.create);
