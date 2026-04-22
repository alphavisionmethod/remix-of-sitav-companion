import { useMemo, useState, useEffect } from "react";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { Activity, Brain, Briefcase, DollarSign, Headphones, BarChart3, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DAY_LABELS, DEMO_FEATURES } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



// ── Heatmap Grid ────────────────────────────────────────────

const DAYS = 7;
const WEEKS = 20;
function generateDemoData(): Record<string, number> {
  const data: Record<string, number> = {};
  const today = new Date();
  for (let w = WEEKS - 1; w >= 0; w--) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().slice(0, 10);
      data[key] = Math.floor(Math.random() * 12);
    }
  }
  return data;
}

const intensityClass = (count: number): string => {
  if (count === 0) return "bg-muted/30";
  if (count <= 2) return "bg-primary/15";
  if (count <= 5) return "bg-primary/30";
  if (count <= 8) return "bg-primary/50";
  return "bg-primary/80";
};

const HeatmapGrid = ({ data }: { data: Record<string, number> }) => {
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  const { isDemoMode } = useDataMode();
  for (let w = WEEKS - 1; w >= 0; w--) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().slice(0, 10);
      cells.push({ date: key, count: data[key] || 0 });
    }
  }

  return (
    <div className="flex gap-1">
{/* Day labels */}
      <div className="flex flex-col gap-[3px] mr-1 pt-5">
        {(isDemoMode ? DEMO_DAY_LABELS : [] as typeof DEMO_DAY_LABELS).map((l, i) => (
          <span key={i} className="text-[8px] text-muted-foreground h-[14px] flex items-center">{l}</span>
        ))}
      </div>
      {/* Grid */}
      <div className="flex gap-[3px] overflow-x-auto">
        {Array.from({ length: WEEKS }, (_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: DAYS }, (_, d) => {
              const idx = w * DAYS + d;
              const cell = cells[idx];
              return (
                <div
                  key={d}
                  title={`${cell?.date}: ${cell?.count || 0} actions`}
                  className={cn("h-[14px] w-[14px] rounded-[3px] transition-colors", intensityClass(cell?.count || 0))}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Feature Usage Stats ─────────────────────────────────────

const MyActivity = () => {
  const { user, isDemo } = useAuth();
  const { isDemoMode } = useDataMode();
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [totalActions, setTotalActions] = useState(0);

  useEffect(() => {
    if (isDemo || !user) {
      setHeatmapData(generateDemoData());
      setFeatureUsage({ brain: 47, business: 32, money: 28, concierge: 15, boardroom: 8 });
      setTotalActions(130);
      return;
    }
    // Load from audit_logs
    (async () => {
      const { data } = await fromTable("audit_logs")
        .select("created_at, category")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - WEEKS * 7 * 86400000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (!data || data.length === 0) {
        setHeatmapData(generateDemoData());
        setFeatureUsage({ brain: 47, business: 32, money: 28, concierge: 15, boardroom: 8 });
        setTotalActions(130);
        return;
      }

      const hm: Record<string, number> = {};
      const fu: Record<string, number> = {};
      data.forEach((row: Record<string, any>) => {
        const day = row.created_at.slice(0, 10);
        hm[day] = (hm[day] || 0) + 1;
        const cat = row.category || "other";
        fu[cat] = (fu[cat] || 0) + 1;
      });
      setHeatmapData(hm);
      setFeatureUsage(fu);
      setTotalActions(data.length);
    })();
  }, [user, isDemo]);

  const topFeature = useMemo(() => {
    const entries = Object.entries(featureUsage);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [featureUsage]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if ((heatmapData[key] || 0) > 0) count++;
      else break;
    }
    return count;
  }, [heatmapData]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SitaPageHeader
        title="My Activity"
        subtitle="Your usage patterns and system engagement"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Actions", value: totalActions.toString(), sub: `Last ${WEEKS} weeks` },
          { label: "Current Streak", value: `${streak} days`, sub: streak > 7 ? "🔥 On fire!" : "Keep going" },
          { label: "Top Feature", value: topFeature?.[0] || "—", sub: topFeature ? `${topFeature[1]} uses` : "" },
          { label: "This Week", value: Object.entries(heatmapData).filter(([k]) => { const d = new Date(k); const now = new Date(); return now.getTime() - d.getTime() < 7 * 86400000; }).reduce((s, [, v]) => s + v, 0).toString(), sub: "actions" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-semibold text-foreground mt-1">{card.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Activity Heatmap</h3>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span>Less</span>
            {[0, 2, 5, 8, 12].map((n) => (
              <div key={n} className={cn("h-[10px] w-[10px] rounded-[2px]", intensityClass(n))} />
            ))}
            <span>More</span>
          </div>
        </div>
        <HeatmapGrid data={heatmapData} />
      </div>

      {/* Feature breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Feature Usage</h3>
        <div className="space-y-3">
          {(isDemoMode ? DEMO_FEATURES : [] as typeof DEMO_FEATURES).map((f) => {
            const count = featureUsage[f.key] || 0;
            const max = Math.max(...Object.values(featureUsage), 1);
            const pct = (count / max) * 100;
            const Icon = f.icon;
            return (
              <div key={f.key} className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4 shrink-0", f.color)} />
                <span className="text-xs text-foreground w-20">{f.label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyActivity;
