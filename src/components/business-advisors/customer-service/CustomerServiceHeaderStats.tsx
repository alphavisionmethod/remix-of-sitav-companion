// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor compact header stats strip.
// Live counts pulled from support_cases + customers (RLS-scoped).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, AlarmClock, AlertTriangle, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  open: number;
  urgent: number;       // open AND priority in (high, urgent) AND age > 1 day
  escalated: number;    // escalated_to_role IS NOT NULL AND status != 'resolved'
  atRisk: number;       // customers with health_score < 40
}

const URGENT_PRIORITIES = ["high", "urgent"];
const RESOLVED_STATUSES = "(resolved,closed)";

export function CustomerServiceHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [openCnt, urgentCnt, escalatedCnt, atRiskCnt] = await Promise.all([
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("status", "in", RESOLVED_STATUSES),
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("priority", URGENT_PRIORITIES)
          .not("status", "in", RESOLVED_STATUSES)
          .lt("created_at", oneDayAgo),
        supabase
          .from("support_cases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("escalated_to_role", "is", null)
          .not("status", "in", RESOLVED_STATUSES),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .lt("health_score", 40),
      ]);
      if (cancelled) return;
      setStats({
        open: openCnt.count ?? 0,
        urgent: urgentCnt.count ?? 0,
        escalated: escalatedCnt.count ?? 0,
        atRisk: atRiskCnt.count ?? 0,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  const items = [
    { icon: Inbox, label: "Open cases", value: stats.open },
    { icon: AlarmClock, label: "Urgent (>24h)", value: stats.urgent },
    { icon: AlertTriangle, label: "Escalated", value: stats.escalated },
    { icon: HeartPulse, label: "At-risk customers", value: stats.atRisk },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</p>
                <p className="text-lg font-semibold">{it.value}</p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}