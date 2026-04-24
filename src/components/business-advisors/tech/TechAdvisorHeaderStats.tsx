// ═══════════════════════════════════════════════════════════════
// SITA OS — Tech Advisor compact header stats.
// Live, RLS-scoped reliability pulse: open incidents, 7-day error
// volume, unresolved error fingerprints, and most-recent incident
// severity.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Bug, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  openIncidents: number;
  errors7d: number;
  unresolvedFingerprints: number;
  lastIncidentSeverity: string | null;
}

export function TechAdvisorHeaderStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [openIncRes, errors7dRes, unresolvedRes, lastIncRes] = await Promise.all([
        supabase
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .neq("status", "resolved"),
        supabase
          .from("error_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("last_seen_at", sevenDaysAgo),
        supabase
          .from("error_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .is("resolved_at", null),
        supabase
          .from("incidents")
          .select("severity")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;

      const lastIncRow = (lastIncRes.data ?? []) as Array<{ severity: string }>;

      setStats({
        openIncidents: openIncRes.count ?? 0,
        errors7d: errors7dRes.count ?? 0,
        unresolvedFingerprints: unresolvedRes.count ?? 0,
        lastIncidentSeverity: lastIncRow[0]?.severity ?? null,
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
    { icon: AlertTriangle, label: "Open incidents", value: String(stats.openIncidents) },
    { icon: Bug, label: "Errors 7d", value: String(stats.errors7d) },
    { icon: ShieldAlert, label: "Unresolved", value: String(stats.unresolvedFingerprints) },
    { icon: Clock, label: "Last severity", value: stats.lastIncidentSeverity ?? "—" },
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