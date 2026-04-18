import { useQuery } from "@tanstack/react-query";
import { fetchWorkforceBudgetClasses, fetchWorkforceInvocations } from "./admin-ai-workforce-client";

export function useAIWorkforceBudgetClasses() {
  return useQuery({
    queryKey: ["ai-workforce-budget-classes"],
    queryFn: fetchWorkforceBudgetClasses,
    staleTime: 60_000,
  });
}

export function useAIWorkforceCostSummary() {
  return useQuery({
    queryKey: ["ai-workforce-cost-summary"],
    queryFn: async () => {
      const invocations = await fetchWorkforceInvocations(200);
      const totalCost = invocations.reduce((s, i) => s + (i.cost_cents || 0), 0);
      const totalTokens = invocations.reduce((s, i) => s + (i.tokens_used || 0), 0);
      const byRole: Record<string, { cost: number; count: number; tokens: number }> = {};
      for (const inv of invocations) {
        const key = inv.role_key || "unknown";
        if (!byRole[key]) byRole[key] = { cost: 0, count: 0, tokens: 0 };
        byRole[key].cost += inv.cost_cents || 0;
        byRole[key].count += 1;
        byRole[key].tokens += inv.tokens_used || 0;
      }
      return { totalCost, totalTokens, totalInvocations: invocations.length, byRole };
    },
    staleTime: 30_000,
  });
}
