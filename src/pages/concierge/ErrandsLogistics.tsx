import { ConciergePageWrapper } from "@/components/concierge";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { ConciergeAdvisorInsightCard } from "@/components/concierge";
import { ErrandBundleCard, LogisticsTimelineCard, ConciergeEmptyState } from "@/components/concierge";
import type { ErrandBundle, ErrandItem, TimelineStop } from "@/components/concierge";
import { AddErrandDialog } from "@/components/concierge/AddErrandDialog";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useState, useMemo } from "react";
import { MapPin, Clock, Zap, Car, CheckCircle, Route, Package, Loader2 } from "lucide-react";
import { useErrands, useUpdateErrand, useDeleteErrand } from "@/hooks/use-concierge-data";
import { toast } from "sonner";

type ErrandsView = "bundles" | "timeline" | "quick-wins" | "all";

const ErrandsLogistics = () => {
  const [view, setView] = useState<ErrandsView>("bundles");
  const { data: rawErrands, isLoading } = useErrands();
  const updateErrand = useUpdateErrand();
  const deleteErrand = useDeleteErrand();

  // Map DB rows to ErrandItem shape
  const allErrands: ErrandItem[] = useMemo(() =>
    (rawErrands ?? []).map((e: any) => ({
      id: e.id,
      title: e.title,
      location: e.location ?? undefined,
      estimatedMinutes: e.estimated_minutes ?? undefined,
      priority: (e.priority ?? "medium") as "high" | "medium" | "low",
      combinable: e.combinable ?? false,
      bundleId: e.bundle_id ?? undefined,
      status: e.status ?? "pending",
      dueDate: e.due_date ?? undefined,
    })),
    [rawErrands],
  );

  // Derive bundles by grouping on bundle_id
  const bundles: ErrandBundle[] = useMemo(() => {
    const groups: Record<string, typeof allErrands> = {};
    for (const e of allErrands) {
      const key = e.bundleId || "Unbundled";
      (groups[key] ??= []).push(e);
    }
    return Object.entries(groups).map(([label, errands]) => ({
      id: label,
      label,
      errands,
      totalMinutes: errands.reduce((s, e) => s + (e.estimatedMinutes ?? 0), 0),
      area: undefined,
    }));
  }, [allErrands]);

  // Derive timeline from errands sorted by due_date
  const timeline: TimelineStop[] = useMemo(() =>
    [...allErrands]
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
      .map((e, i) => ({
        id: e.id,
        time: e.dueDate
          ? new Date(e.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `#${i + 1}`,
        title: e.title,
        location: e.location,
        status: (e.status === "done" ? "done" : i === 0 ? "current" : "upcoming") as TimelineStop["status"],
      })),
    [allErrands],
  );

  const pendingErrands = allErrands.filter((e) => e.status !== "done");
  const totalErrands = pendingErrands.length;
  const highPriority = pendingErrands.filter((e) => e.priority === "high").length;
  const combinableCount = pendingErrands.filter((e) => e.combinable).length;
  const totalMinutes = pendingErrands.reduce((s, e) => s + (e.estimatedMinutes ?? 0), 0);

  const handleToggleDone = (errandId: string) => {
    const errand = allErrands.find((e) => e.id === errandId);
    if (!errand) return;
    const newStatus = errand.status === "done" ? "pending" : "done";
    updateErrand.mutate({ id: errandId, status: newStatus }, {
      onError: () => toast.error("Failed to update errand"),
    });
  };

  const handleDelete = (errandId: string) => {
    deleteErrand.mutate(errandId, {
      onError: () => toast.error("Failed to delete errand"),
    });
  };

  const quickWinErrands = allErrands.filter((e) => !e.location && e.status !== "done");

  if (isLoading) {
    return (
      <ConciergePageWrapper className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </ConciergePageWrapper>
    );
  }

  return (
    <ConciergePageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <AddErrandDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Open Errands" value={String(totalErrands)} icon={Package} />
        <KPITile label="High Priority" value={String(highPriority)} icon={Zap} sub="Handle first" />
        <KPITile label="Combinable" value={String(combinableCount)} icon={Route} sub="Save time" />
        <KPITile label="Est. Time" value={`${totalMinutes}m`} icon={Clock} sub="Across all bundles" />
      </div>

      <SitaTabs
        tabs={[
          { key: "bundles", label: "Route Bundles" },
          { key: "timeline", label: "Timeline" },
          { key: "quick-wins", label: "Quick Wins" },
          { key: "all", label: "All Errands" },
        ]}
        active={view}
        onChange={(k) => setView(k as ErrandsView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {allErrands.length === 0 && (
            <ConciergeEmptyState domain="errands" icon={Package} />
          )}

          {view === "bundles" && bundles.map((b) => (
            <ErrandBundleCard key={b.id} bundle={b} onToggleDone={handleToggleDone} onDelete={handleDelete} />
          ))}

          {view === "timeline" && allErrands.length > 0 && (
            <LogisticsTimelineCard stops={timeline} label="Errand Timeline" />
          )}

          {view === "quick-wins" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Quick Wins</h3>
              {quickWinErrands.length === 0 && (
                <p className="text-xs text-muted-foreground px-2">No quick wins right now.</p>
              )}
              {quickWinErrands.map((e) => (
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={e.id} >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${e.priority === "high" ? "bg-destructive" : e.priority === "medium" ? "bg-amber-500" : "bg-chart-2"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      {e.estimatedMinutes && <p className="text-xs text-muted-foreground">~{e.estimatedMinutes} minutes</p>}
                    </div>
                    <button
                      onClick={() => handleToggleDone(e.id)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "all" && allErrands.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">All Errands</h3>
              {allErrands.map((e) => (
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3.5 micro-hover-lift" key={e.id} >
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleDone(e.id)} className="shrink-0">
                      <CheckCircle className={`h-4 w-4 ${e.status === "done" ? "text-chart-2" : "text-muted-foreground/30"}`} />
                    </button>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${e.priority === "high" ? "bg-destructive" : e.priority === "medium" ? "bg-amber-500" : "bg-chart-2"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${e.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.location || "Home / Online"}{e.estimatedMinutes ? ` · ~${e.estimatedMinutes}m` : ""}</p>
                    </div>
                    {e.combinable && <span className="text-[9px] bg-accent/10 text-accent rounded-full px-1.5 py-0.5">combinable</span>}
                    <button onClick={() => handleDelete(e.id)} className="shrink-0 text-muted-foreground/30 hover:text-destructive transition-colors text-xs">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <GlassCard glow="accent" intensity="subtle" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-foreground">Route Suggestion</p>
            </div>
            <p className="text-xs text-foreground mb-2">
              {bundles.length >= 2
                ? `Combine "${bundles[0]?.label}" and "${bundles[1]?.label}" into a single outing to save travel time.`
                : "Add more errands with locations to get route optimization suggestions."}
            </p>
          </GlassCard>

          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Can Be Combined</h4>
            </div>
            <div className="space-y-1.5">
              {allErrands.filter((e) => e.combinable).length === 0 && (
                <p className="text-xs text-muted-foreground">No combinable errands yet.</p>
              )}
              {allErrands.filter((e) => e.combinable).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-chart-2" />
                  <span className="text-foreground">{e.title}</span>
                </div>
              ))}
            </div>
          </div>

          <ConciergeAdvisorInsightCard insight={{
            role: "Logistics Advisor",
            message: totalErrands > 0
              ? `You have ${totalErrands} pending errands across ${bundles.length} group(s), estimated at ~${totalMinutes} minutes total. ${highPriority > 0 ? `${highPriority} high-priority items need attention first.` : "No urgent items right now."}`
              : "Add errands to get intelligent logistics advice and route optimization.",
            linkedItems: bundles.slice(0, 3).map((b) => b.label),
            confidence: totalErrands > 3 ? "high" : "medium",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default ErrandsLogistics;
