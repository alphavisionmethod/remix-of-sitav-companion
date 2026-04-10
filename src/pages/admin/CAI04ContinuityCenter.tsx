import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { RefreshCw, Monitor, Smartphone, Watch } from "lucide-react";

const surfaceIcons: Record<string, any> = { desktop: Monitor, mobile: Smartphone, watch: Watch };

export default function CAI04ContinuityCenter() {
  const { continuityEngine } = useSitaOS();

  const threads = continuityEngine.getActiveThreads?.() ?? [];
  const surfaces = continuityEngine.getRegisteredSurfaces?.() ?? [];
  const handoffLog = continuityEngine.getHandoffLog?.() ?? [];
  const score = continuityEngine.getContinuityScore?.() ?? 0;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={RefreshCw} title="Ambient Continuity & Handoff" subtitle="Context flows across surfaces — resume anywhere, preserve intent, carry state" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Active Threads" value={threads.length} /></SitaCard>
        <SitaCard><SitaMetric label="Surfaces" value={surfaces.length} /></SitaCard>
        <SitaCard><SitaMetric label="Handoffs" value={handoffLog.length} /></SitaCard>
        <SitaCard><SitaMetric label="Continuity Score" value={`${Math.round(score * 100)}%`} trend={score > 0.8 ? "up" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Registered Surfaces" subtitle="Active devices and contexts" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {surfaces.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No surfaces registered yet.</p></SitaCard>}
        {surfaces.map((s: any, i: number) => {
          const Icon = surfaceIcons[s.type] ?? Monitor;
          return (
            <SitaCard key={i}>
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{s.label ?? s.type ?? `Surface ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{s.status ?? "active"} · {s.lastSeen ?? "now"}</p>
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      <SitaSectionHeader title="Active Threads" subtitle="Tasks and contexts that can be resumed on any surface" />
      <div className="space-y-2">
        {threads.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No active continuity threads.</p></SitaCard>}
        {threads.slice(0, 10).map((t: any, i: number) => (
          <SitaCard key={i} lane="opportunity">
            <SitaCardHeader>
              <SitaCardTitle sub={t.surface ?? "any"}>{t.title ?? t.intent ?? `Thread #${i + 1}`}</SitaCardTitle>
              <span className="text-xs text-muted-foreground">{t.state ?? "resumable"}</span>
            </SitaCardHeader>
          </SitaCard>
        ))}
      </div>

      {handoffLog.length > 0 && (
        <>
          <SitaSectionHeader title="Handoff Log" subtitle="Recent cross-surface context transfers" />
          <div className="space-y-2">
            {handoffLog.slice(0, 8).map((h: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{h.from ?? "?"} → {h.to ?? "?"}</span>
                  <span className="text-xs text-muted-foreground">{h.timestamp ?? ""}</span>
                </div>
                {h.context && <p className="mt-1 text-xs text-muted-foreground">{h.context}</p>}
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
