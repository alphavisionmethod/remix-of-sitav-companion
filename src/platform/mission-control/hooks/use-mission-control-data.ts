import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
export function useMissionControlLive() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  return useQuery({
    queryKey: ["mission-control-live", user?.id, isDemoMode],
    queryFn: async () => {
      if (!user?.id || isDemoMode) return null;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { data: telemetry },
        { data: incidents },
        { data: connectors },
        { data: workflowRuns },
        { data: advisorResponses },
      ] = await Promise.all([
        fromTable("agent_telemetry").select("*").eq("user_id", user.id).gte("recorded_at", sevenDaysAgo).order("recorded_at", { ascending: false }).limit(500),
        fromTable("incidents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        fromTable("connector_configs").select("*").eq("user_id", user.id),
        fromTable("workflow_runs").select("*").eq("user_id", user.id).gte("created_at", sevenDaysAgo).limit(200),
        fromTable("advisor_responses").select("tokens_used, latency_ms, model_used, created_at").eq("user_id", user.id).gte("created_at", sevenDaysAgo).limit(500),
      ]);

      // Aggregate telemetry
      const agentMetrics = new Map<string, { invocations: number; latency: number[]; errors: number }>();
      (telemetry || []).forEach((t: any) => {
        const key = t.agent_id;
        if (!agentMetrics.has(key)) agentMetrics.set(key, { invocations: 0, latency: [], errors: 0 });
        const m = agentMetrics.get(key)!;
        if (t.metric_name === "invocation") m.invocations += t.metric_value;
        if (t.metric_name === "latency") m.latency.push(t.metric_value);
        if (t.metric_name === "error") m.errors += t.metric_value;
      });

      // Incident summary
      const openIncidents = (incidents || []).filter((i: any) => i.status === "open");
      const criticalIncidents = openIncidents.filter((i: any) => i.severity === "critical");

      // Workflow summary
      const totalRuns = (workflowRuns || []).length;
      const failedRuns = (workflowRuns || []).filter((r: any) => r.status === "failed").length;
      const runningRuns = (workflowRuns || []).filter((r: any) => r.status === "running").length;

      // AI spend
      const totalTokens = (advisorResponses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
      const totalRequests = (advisorResponses || []).length;
      const avgLatency = totalRequests > 0
        ? Math.round((advisorResponses || []).reduce((s: number, r: any) => s + (r.latency_ms || 0), 0) / totalRequests)
        : 0;

      // By model
      const byModel: Record<string, { count: number; tokens: number }> = {};
      (advisorResponses || []).forEach((r: any) => {
        const model = r.model_used || "unknown";
        if (!byModel[model]) byModel[model] = { count: 0, tokens: 0 };
        byModel[model].count++;
        byModel[model].tokens += r.tokens_used || 0;
      });

      // Active connectors
      const activeConnectors = (connectors || []).filter((c: any) => c.status === "active").length;
      const totalConnectors = (connectors || []).length;

      return {
        systemStatus: criticalIncidents.length > 0 ? "critical" : openIncidents.length > 0 ? "warning" : "healthy",
        incidents: { open: openIncidents.length, critical: criticalIncidents.length, total: (incidents || []).length, recent: openIncidents.slice(0, 5) },
        workflows: { total: totalRuns, failed: failedRuns, running: runningRuns, successRate: totalRuns > 0 ? Math.round(((totalRuns - failedRuns) / totalRuns) * 100) : 100 },
        ai: { totalTokens, totalRequests, avgLatency, byModel },
        connectors: { active: activeConnectors, total: totalConnectors, list: connectors || [] },
        agents: Object.fromEntries(agentMetrics),
      };
    },
    enabled: !!user?.id && !isDemoMode,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
