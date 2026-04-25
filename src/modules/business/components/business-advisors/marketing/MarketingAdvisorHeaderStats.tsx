// ═══════════════════════════════════════════════════════════════
// SITA OS — Marketing & Advertising Advisor compact header stats.
// Live, RLS-scoped acquisition pulse: 30-day inbound volume,
// active leads, top channel concentration, qualification rate.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Users, Megaphone, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  /** New inbound campaign signals in the last 30 days. */
  inbound30d: number;
  /** Active (non-disqualified, non-won) leads in pipeline. */
  activeLeads: number;
  /** Most concentrated source/channel name + share. */
  topChannel: { name: string; sharePct: number } | null;
  /** Qualification rate = qualified / total inbound (last 30d), 0-100. */
  qualificationPct: number;
}

const ACTIVE_LEAD_STATUSES = ["new", "working", "nurture", "qualified", "engaged"];

export function MarketingAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [inboxRes, leadsRes, channelRes] = await Promise.all([
        supabase
          .from("lead_inbox_items")
          .select("triage_status", { count: "exact" })
          .eq("user_id", userId)
          .gte("created_at", thirtyDaysAgo)
          .limit(2000),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("status", ACTIVE_LEAD_STATUSES),
        supabase
          .from("leads")
          .select("source")
          .eq("user_id", userId)
          .gte("created_at", thirtyDaysAgo)
          .limit(2000),
      ]);

      if (cancelled) return;

      const inboxRows = (inboxRes.data ?? []) as Array<{ triage_status: string | null }>;
      const inbound30d = inboxRes.count ?? inboxRows.length;
      const qualified = inboxRows.filter((r) => (r.triage_status ?? "").toLowerCase() === "qualified").length;
      const qualificationPct = inboxRows.length > 0 ? (qualified / inboxRows.length) * 100 : 0;

      const channelRows = (channelRes.data ?? []) as Array<{ source: string | null }>;
      const channelCounts = new Map<string, number>();
      for (const r of channelRows) {
        const k = (r.source ?? "(unknown)").toLowerCase().trim() || "(unknown)";
        channelCounts.set(k, (channelCounts.get(k) ?? 0) + 1);
      }
      let topChannel: Stats["topChannel"] = null;
      if (channelRows.length > 0) {
        const sorted = [...channelCounts.entries()].sort((a, b) => b[1] - a[1]);
        const [name, count] = sorted[0]!;
        topChannel = { name, sharePct: (count / channelRows.length) * 100 };
      }

      setStats({
        inbound30d,
        activeLeads: leadsRes.count ?? 0,
        topChannel,
        qualificationPct,
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
    { icon: Inbox, label: "Inbound 30d", value: String(stats.inbound30d) },
    { icon: Users, label: "Active leads", value: String(stats.activeLeads) },
    {
      icon: Megaphone,
      label: "Top channel",
      value: stats.topChannel ? `${stats.topChannel.name} · ${stats.topChannel.sharePct.toFixed(0)}%` : "—",
    },
    { icon: Target, label: "Qualified rate", value: `${stats.qualificationPct.toFixed(0)}%` },
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