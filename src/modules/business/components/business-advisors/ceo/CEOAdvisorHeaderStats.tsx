// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor compact header stats.
// Cross-advisor synthesis pulse: total advisor recommendations,
// distinct contributing advisors, high-urgency items, and pending
// actions across the board. All counts are RLS-scoped via the
// authenticated user_id.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Users, Flame, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Threshold above which a recommendation is treated as high-urgency. */
export const CEO_HIGH_URGENCY_THRESHOLD = 0.7;

interface Stats {
  totalRecs: number;
  distinctAdvisors: number;
  highUrgencyRecs: number;
  pendingActions: number;
}

export function CEOAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const [totalRes, advisorsRes, urgentRes, pendingRes] = await Promise.all([
        supabase
          .from("advisor_board_recommendations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("advisor_board_recommendations")
          .select("advisor_id")
          .eq("user_id", userId)
          .limit(500),
        supabase
          .from("advisor_board_recommendations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("urgency_score", CEO_HIGH_URGENCY_THRESHOLD)
          .neq("status", "resolved"),
        supabase
          .from("advisor_board_actions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("status", ["proposed", "approved"]),
      ]);

      if (cancelled) return;
      const advisorRows = (advisorsRes.data ?? []) as Array<{ advisor_id: string }>;
      const distinct = new Set(advisorRows.map((r) => r.advisor_id)).size;

      setStats({
        totalRecs: totalRes.count ?? 0,
        distinctAdvisors: distinct,
        highUrgencyRecs: urgentRes.count ?? 0,
        pendingActions: pendingRes.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
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
    { icon: Crown, label: "Board recs", value: String(stats.totalRecs) },
    { icon: Users, label: "Advisors active", value: String(stats.distinctAdvisors) },
    { icon: Flame, label: "High urgency", value: String(stats.highUrgencyRecs) },
    { icon: ListChecks, label: "Pending actions", value: String(stats.pendingActions) },
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