// ═══════════════════════════════════════════════════════════════
// SITA OS — Growth Advisor compact header stats.
// Live, RLS-scoped growth pulse: 30-day activity, funnel stages
// tracked, lifecycle cohorts, and active experiments.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, GitBranch, Users, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  /** App launch events in the last 30 days (real activity signal). */
  activity30d: number;
  /** Distinct funnel stages tracked. */
  funnelStages: number;
  /** Distinct lifecycle cohorts defined. */
  lifecycleCohorts: number;
  /** Currently running conversion experiments. */
  activeExperiments: number;
}

export function GrowthAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [activityRes, stagesRes, cohortsRes, expRes] = await Promise.all([
        supabase
          .from("app_launch_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", thirtyDaysAgo),
        supabase
          .from("customer_journey_stages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("customer_lifecycle_stages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("conversion_experiments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "running"),
      ]);

      if (cancelled) return;

      setStats({
        activity30d: activityRes.count ?? 0,
        funnelStages: stagesRes.count ?? 0,
        lifecycleCohorts: cohortsRes.count ?? 0,
        activeExperiments: expRes.count ?? 0,
      });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const items = [
    { icon: Activity, label: "Activity 30d", value: String(stats.activity30d) },
    { icon: GitBranch, label: "Funnel stages", value: String(stats.funnelStages) },
    { icon: Users, label: "Lifecycle cohorts", value: String(stats.lifecycleCohorts) },
    { icon: FlaskConical, label: "Active experiments", value: String(stats.activeExperiments) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</p>
                <p className="text-lg font-semibold truncate">{it.value}</p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}