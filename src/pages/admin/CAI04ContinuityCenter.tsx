import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { RefreshCw } from "lucide-react";

export default function CAI04ContinuityCenter() {
  const { continuityEngine } = useSitaOS();

  const threads = continuityEngine.getActiveThreads();
  const score = continuityEngine.getContinuityScore();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={RefreshCw} title="Ambient Continuity & Handoff" subtitle="Context flows across surfaces — resume anywhere, preserve intent, carry state" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Active Threads" value={threads.length} /></SitaCard>
        <SitaCard><SitaMetric label="Continuity Score" value={`${score.score}%`} trend={score.score > 80 ? "up" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Unresolved" value={score.unresolvedItems} trend={score.unresolvedItems > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Stale Surfaces" value={score.staleSurfaces} /></SitaCard>
      </div>

      <SitaSectionHeader title="Active Threads" subtitle="Tasks and contexts that can be resumed on any surface" />
      <div className="space-y-2">
        {threads.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No active continuity threads.</p></SitaCard>}
        {threads.slice(0, 10).map((t) => (
          <SitaCard key={t.id} lane="opportunity">
            <SitaCardHeader>
              <SitaCardTitle sub={t.domain}>{t.topic}</SitaCardTitle>
              <span className="text-xs text-muted-foreground">{t.priority}</span>
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">Surfaces: {t.surfaces.join(", ")} · Last: {t.lastActivity}</p>
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Continuity Health" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Score:</span> <span className="font-medium text-foreground">{score.score}%</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Avg Handoff Latency:</span> <span className="font-medium text-foreground">{score.avgHandoffLatency}ms</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Active Threads:</span> <span className="font-medium text-foreground">{score.activeThreads}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Stale Surfaces:</span> <span className="font-medium text-foreground">{score.staleSurfaces}</span></div>
        </div>
      </SitaCard>
    </div>
  );
}
