import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Zap, Filter, XCircle } from "lucide-react";
import { useState } from "react";

export default function CAI02IntentTraceBoard() {
  const { intentOrchestrator } = useSitaOS();
  const [filter, setFilter] = useState<string>("all");

  const stats = intentOrchestrator.getStats();
  const recentIntents = intentOrchestrator.getRecentIntents?.() ?? [];
  const sources = ["all", "voice", "text", "ui", "automation", "wearable"];

  const filtered = filter === "all" ? recentIntents : recentIntents.filter((i: any) => i.source === filter);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Zap} title="Intent & Command Trace Board" subtitle="Every action flows through the unified intent orchestrator — inspect, trace, and debug" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Processed" value={stats.totalProcessed ?? 0} /></SitaCard>
        <SitaCard><SitaMetric label="Success Rate" value={`${stats.successRate ?? 100}%`} trend={stats.successRate >= 95 ? "up" : "down"} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Latency" value={`${stats.avgLatencyMs ?? 0}ms`} /></SitaCard>
        <SitaCard><SitaMetric label="Failed" value={stats.failedCount ?? 0} trend={stats.failedCount > 0 ? "down" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Recent Intents" subtitle="Trace log of processed commands and actions" action={
        <div className="flex gap-1.5">
          {sources.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      } />

      <div className="space-y-2">
        {filtered.length === 0 && (
          <SitaCard><p className="text-sm text-muted-foreground">No intents recorded yet. Interact with the OS to generate traces.</p></SitaCard>
        )}
        {filtered.slice(0, 20).map((intent: any, i: number) => (
          <SitaCard key={i} lane={intent.status === "failed" ? "unresolved" : intent.status === "deferred" ? "changed" : "action"}>
            <SitaCardHeader>
              <SitaCardTitle sub={`${intent.source ?? "unknown"} → ${intent.domain ?? "general"}`}>
                {intent.raw ?? intent.classification ?? `Intent #${i + 1}`}
              </SitaCardTitle>
              <span className={`text-xs font-medium ${intent.status === "failed" ? "text-destructive" : "text-trust-safe"}`}>
                {intent.status ?? "resolved"}
              </span>
            </SitaCardHeader>
            {intent.resolution && <p className="text-xs text-muted-foreground">{intent.resolution}</p>}
          </SitaCard>
        ))}
      </div>

      {(stats.failedCount ?? 0) > 0 && (
        <>
          <SitaSectionHeader title="Failed Intents" subtitle="Commands that could not be resolved" />
          <SitaCard lane="unresolved">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-foreground">{stats.failedCount} intents failed classification or routing</p>
            </div>
          </SitaCard>
        </>
      )}
    </div>
  );
}
