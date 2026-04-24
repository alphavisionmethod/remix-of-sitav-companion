// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Automation Health data hook
// Wires crm_automations + advisor_board_recommendations.
// Fatigue alerts have no backing table yet → empty array (honest).
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface AutomationRow {
  name: string;
  status: "healthy" | "warning" | "error" | "underperforming";
  triggers: number;
  failures: number;
  contacts: number;
  lastRun: string;
  revenue: string;
  trend: number[];
  successRate: number;
}

export interface AdvisorInsightRow {
  advisor: string;
  insight: string;
  action: string;
}

export interface HealthMetric {
  label: string;
  value: number;
  target: number;
  color: string;
  icon: any;
}

export function useRevenueAutomationHealth() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["revenue-automation-health", uid],
    enabled: !!uid,
    queryFn: async (): Promise<{
      automations: AutomationRow[];
      advisorInsights: AdvisorInsightRow[];
      healthMetrics: HealthMetric[];
      fatigueAlerts: never[];
    }> => {
      const [autoRes, recRes] = await Promise.all([
        fromTable("crm_automations")
          .select("id, title, status, runs, last_run_at, execution_log, target_entity")
          .eq("user_id", uid!)
          .order("created_at", { ascending: false }),
        fromTable("advisor_board_recommendations")
          .select("id, advisor_id, title, summary, category, urgency_score")
          .eq("user_id", uid!)
          .eq("category", "automation")
          .eq("status", "new")
          .order("urgency_score", { ascending: false })
          .limit(10),
      ]);

      const automations: AutomationRow[] = ((autoRes as any).data ?? []).map((a: any) => {
        const log: any[] = Array.isArray(a.execution_log) ? a.execution_log : [];
        const failures = log.filter((e) => e?.status === "failed" || e?.outcome === "failed").length;
        const runs = a.runs ?? 0;
        const successRate = runs > 0 ? Math.round(((runs - failures) / runs) * 100) : 100;
        const status: AutomationRow["status"] =
          a.status === "paused" || a.status === "draft"
            ? "underperforming"
            : successRate >= 90
              ? "healthy"
              : successRate >= 70
                ? "warning"
                : "error";
        const trendBase = log.slice(-7).map((e: any) => (e?.status === "failed" ? 40 : 95));
        while (trendBase.length < 7) trendBase.unshift(85);
        return {
          name: a.title,
          status,
          triggers: runs,
          failures,
          contacts: 0,
          lastRun: a.last_run_at ? new Date(a.last_run_at).toLocaleString() : "Never",
          revenue: "—",
          trend: trendBase,
          successRate,
        };
      });

      const advisorInsights: AdvisorInsightRow[] = ((recRes as any).data ?? []).map((r: any) => ({
        advisor: r.advisor_id,
        insight: r.summary || r.title,
        action: "Review",
      }));

      // Aggregate health metrics from real data only
      const totalRuns = automations.reduce((s, a) => s + a.triggers, 0);
      const totalFailures = automations.reduce((s, a) => s + a.failures, 0);
      const avgSuccess =
        automations.length > 0
          ? Math.round(automations.reduce((s, a) => s + a.successRate, 0) / automations.length)
          : 0;
      const healthMetrics: HealthMetric[] =
        automations.length === 0
          ? []
          : [
              { label: "Avg Success Rate", value: avgSuccess, target: 90, color: "text-emerald-400", icon: null },
              { label: "Total Triggers", value: totalRuns, target: 0, color: "text-blue-400", icon: null },
              { label: "Failures (lifetime)", value: totalFailures, target: 0, color: "text-amber-400", icon: null },
              { label: "Active Automations", value: automations.filter((a) => a.status !== "underperforming").length, target: 0, color: "text-foreground", icon: null },
            ];

      return { automations, advisorInsights, healthMetrics, fatigueAlerts: [] };
    },
  });
}