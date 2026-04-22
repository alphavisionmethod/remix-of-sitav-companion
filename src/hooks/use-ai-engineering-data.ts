// ═══════════════════════════════════════════════════════════════
// SITA OS — useAIEngineeringData: Unified Hook for AI Engineering Control Plane
// In demo mode → returns DEMO_* data from admin-platform
// In live mode → queries ai_* Supabase tables via ai-ops-data-service
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { useQuery } from "@tanstack/react-query";
import { useAIEngineeringRealtime } from "@/hooks/use-ai-engineering-realtime";
import {
  aiEngineeringMissions,
  aiFixProposals,
  aiChangePlans,
  aiDesignDiffs,
  aiAgentDebateRecords,
  aiLearningPatterns,
  aiComplianceViolations,
  aiEfficiencyScores,
  aiApprovals,
  aiAuditTimeline,
  aiSelfHealingRules,
} from "@/data/repositories/ai-ops-data-service";

export type AIEngDomain =
  | "missions"
  | "fixes"
  | "changePlans"
  | "designDiffs"
  | "debates"
  | "learningPatterns"
  | "violations"
  | "efficiencyScores"
  | "approvals"
  | "auditTimeline"
  | "selfHealingRules";

const fetchers: Record<AIEngDomain, { list: (f?: any) => Promise<any[]> }> = {
  missions: aiEngineeringMissions,
  fixes: aiFixProposals,
  changePlans: aiChangePlans,
  designDiffs: aiDesignDiffs,
  debates: aiAgentDebateRecords,
  learningPatterns: aiLearningPatterns,
  violations: aiComplianceViolations,
  efficiencyScores: aiEfficiencyScores,
  approvals: aiApprovals,
  auditTimeline: aiAuditTimeline,
  selfHealingRules: aiSelfHealingRules,
};

/**
 * Fetch a single AI engineering domain.
 * In demo mode, returns demoData directly (no network).
 * In live mode, queries Supabase via ai-ops-data-service.
 */
export function useAIEngDomain<T>(
  domain: AIEngDomain,
  demoData: T[],
  limit = 100,
) {
  const { isDemoMode } = useDataMode();
  // Activate realtime — invalidates query keys automatically on DB changes
  const { isConnected: realtimeConnected } = useAIEngineeringRealtime();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ai-eng", domain, isDemoMode ? "demo" : "live"],
    queryFn: async () => {
      if (isDemoMode) return demoData;
      try {
        const result = await fetchers[domain].list({ limit });
        return (result as T[]) ?? [];
      } catch {
        return [];
      }
    },
    staleTime: isDemoMode ? Infinity : 30_000,
    refetchOnWindowFocus: !isDemoMode,
  });

  return {
    data: (data ?? demoData) as T[],
    isDemo: isDemoMode,
    isLoading: !isDemoMode && isLoading,
    error: error as Error | null,
    refetch,
    realtimeConnected,
    source: isDemoMode ? "demo" as const : (data && data.length > 0 ? "real" as const : "empty" as const),
  };
}

/**
 * Fetch multiple AI engineering domains in one hook call.
 * Returns a combined result object keyed by domain.
 */
export function useAIEngineeringData(demoSets: {
  missions?: any[];
  fixes?: any[];
  changePlans?: any[];
  designDiffs?: any[];
  debates?: any[];
  learningPatterns?: any[];
  violations?: any[];
  efficiencyScores?: any[];
  approvals?: any[];
  auditTimeline?: any[];
  selfHealingRules?: any[];
}) {
  const { isConnected: realtimeConnected } = useAIEngineeringRealtime();
  const { isDemoMode } = useDataMode();

  const domains = Object.keys(demoSets) as AIEngDomain[];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ai-eng-all", domains.join(","), isDemoMode ? "demo" : "live"],
    queryFn: async () => {
      if (isDemoMode) return demoSets;
      const results: Record<string, any[]> = {};
      await Promise.all(
        domains.map(async (domain) => {
          try {
            results[domain] = await fetchers[domain].list({ limit: 100 });
          } catch {
            results[domain] = [];
          }
        }),
      );
      return results;
    },
    staleTime: isDemoMode ? Infinity : 30_000,
    refetchOnWindowFocus: !isDemoMode,
  });

  const resolved = data ?? demoSets;

  return {
    data: resolved as typeof demoSets,
    isDemo: isDemoMode,
    isLoading: !isDemoMode && isLoading,
    error: error as Error | null,
    refetch,
    realtimeConnected,
  };
}
