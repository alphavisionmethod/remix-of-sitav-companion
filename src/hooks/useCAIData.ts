// ═══════════════════════════════════════════════════════════════
// SITA OS — React Query hooks for CAI persisted data
// Used by CAI admin pages to show historical DB records
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { caiQueries } from "@/data/persistence/cai-persistence-bridge";

type QueryFilters = { limit?: number; since?: string };

const defaults: QueryFilters = { limit: 50 };

export const useGraphNodes = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "graph-nodes", f], queryFn: () => caiQueries.graphNodes(f ?? defaults), staleTime: 30_000 });

export const useGraphEdges = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "graph-edges", f], queryFn: () => caiQueries.graphEdges(f ?? defaults), staleTime: 30_000 });

export const useIntentResolutions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "intents", f], queryFn: () => caiQueries.intents(f ?? defaults), staleTime: 15_000 });

export const useCommandOrchestrations = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "commands", f], queryFn: () => caiQueries.commands(f ?? defaults), staleTime: 15_000 });

export const usePriorityStacks = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "priorities", f], queryFn: () => caiQueries.priorities(f ?? defaults), staleTime: 30_000 });

export const useAttentionDecisions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "attention", f], queryFn: () => caiQueries.attentionDecisions(f ?? defaults), staleTime: 15_000 });

export const useContinuitySessions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "continuity", f], queryFn: () => caiQueries.continuitySessions(f ?? defaults), staleTime: 30_000 });

export const useHandoffContexts = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "handoffs", f], queryFn: () => caiQueries.handoffs(f ?? defaults), staleTime: 30_000 });

export const useTrustActions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "trust-actions", f], queryFn: () => caiQueries.trustActions(f ?? defaults), staleTime: 15_000 });

export const useActionEscalations = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "escalations", f], queryFn: () => caiQueries.escalations(f ?? defaults), staleTime: 30_000 });

export const useAssistantRoleStates = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "assistant-roles", f], queryFn: () => caiQueries.assistantRoles(f ?? defaults), staleTime: 30_000 });

export const useAssistantSessions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "assistant-sessions", f], queryFn: () => caiQueries.assistantSessions(f ?? defaults), staleTime: 30_000 });

export const useTimingDecisions = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "timing", f], queryFn: () => caiQueries.timingDecisions(f ?? defaults), staleTime: 15_000 });

export const useRelationshipContexts = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "relationships", f], queryFn: () => caiQueries.relationships(f ?? defaults), staleTime: 30_000 });

export const useHumanObligations = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "obligations", f], queryFn: () => caiQueries.obligations(f ?? defaults), staleTime: 30_000 });

export const useDigestCompilations = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "digests", f], queryFn: () => caiQueries.digests(f ?? defaults), staleTime: 30_000 });

export const useOperatingModes = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "operating-modes", f], queryFn: () => caiQueries.operatingModes(f ?? defaults), staleTime: 30_000 });

export const useAdaptiveProfiles = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "adaptive-profiles", f], queryFn: () => caiQueries.interfaceProfiles(f ?? defaults), staleTime: 30_000 });

export const useOpportunitySignals = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "opportunities", f], queryFn: () => caiQueries.opportunitySignals(f ?? defaults), staleTime: 15_000 });

export const useMemoryGovernanceRecords = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "memory-governance", f], queryFn: () => caiQueries.memoryGovernance(f ?? defaults), staleTime: 30_000 });

export const useMemoryCorrections = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "memory-corrections", f], queryFn: () => caiQueries.memoryCorrections(f ?? defaults), staleTime: 30_000 });

export const useBoundaryPolicies = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "boundary-policies", f], queryFn: () => caiQueries.boundaryPolicies(f ?? defaults), staleTime: 30_000 });

export const useExperienceRules = (f?: QueryFilters) =>
  useQuery({ queryKey: ["cai", "experience-rules", f], queryFn: () => caiQueries.experienceRules(f ?? defaults), staleTime: 30_000 });
