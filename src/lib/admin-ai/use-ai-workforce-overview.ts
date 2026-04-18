import { useQuery } from "@tanstack/react-query";
import { fetchWorkforceRoles, fetchWorkforceRoleHealth, fetchWorkforceInvocations, fetchWorkforceRecommendations, fetchWorkforceLaunchHonesty } from "./admin-ai-workforce-client";

export function useAIWorkforceOverview() {
  return useQuery({
    queryKey: ["ai-workforce-overview"],
    queryFn: async () => {
      const [roles, health, invocations, recommendations, launchHonesty] = await Promise.all([
        fetchWorkforceRoles(),
        fetchWorkforceRoleHealth(),
        fetchWorkforceInvocations(100),
        fetchWorkforceRecommendations(100),
        fetchWorkforceLaunchHonesty(),
      ]);

      const activeRoles = roles.filter((r: any) => r.is_active).length;
      const healthyRoles = health.filter((h: any) => h.health_state === "healthy").length;
      const totalCost = invocations.reduce((s: number, i: any) => s + (i.cost_cents || 0), 0);
      const pendingRecs = recommendations.filter((r: any) => r.status === "new" || r.status === "reviewing").length;
      const acceptedRecs = recommendations.filter((r: any) => r.status === "accepted").length;

      return {
        totalRoles: roles.length,
        activeRoles,
        healthyRoles,
        degradedRoles: health.filter((h: any) => h.health_state === "degraded").length,
        totalInvocations: invocations.length,
        totalCostCents: totalCost,
        pendingRecommendations: pendingRecs,
        acceptedRecommendations: acceptedRecs,
        totalRecommendations: recommendations.length,
        launchHonestyCount: launchHonesty.length,
        roles,
        health,
      };
    },
    staleTime: 30_000,
  });
}
