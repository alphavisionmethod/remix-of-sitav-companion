import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Zap, XCircle } from "lucide-react";
import { useState } from "react";

export default function CAI02IntentTraceBoard() {
  const { intentOrchestrator } = useSitaOS();
  const [filter, setFilter] = useState<string>("all");

  const stats = intentOrchestrator.getStats();
  const recentIntents = intentOrchestrator.getRecentIntents?.() ?? [];
  const sources = ["all", "voice", "text", "ui", "automation", "wearable"];

  const filtered = filter === "all" ? recentIntents : recentIntents.filter((i: any) => i.source === filter);
  const failedCount = Object.values(stats.byClassification).reduce((a, b) => a + b, 0) - stats.total;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Zap} title="Intent & Command Trace Board" subtitle="Every action flows through the unified intent orchestrator — inspect, trace, and debug" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Processed" value={stats.total} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Duration" value={`${stats.avgDuration}ms`} /></SitaCard>
        <SitaCard><SitaMetric label="By Source" value={Object.keys(stats.bySource).length} /></SitaCard>
        <SitaCard><SitaMetric label="Classifications" value={Object.keys(stats.byClassification).length} /></SitaCard>
      </div>

      <SitaSectionHeader title="By Source" subtitle="Intent distribution by origin" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.bySource).map(([source, count]) => (
          <SitaCard key={source} hover onClick={() => setFilter(source)}>
            <SitaMetric label={source} value={count} />
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="By Classification" subtitle="How intents were classified" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.byClassification).map(([cls, count]) => (
          <SitaCard key={cls}>
            <SitaMetric label={cls} value={count} />
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Recent Intents" subtitle="Trace log of processed commands" action={
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
          <SitaCard key={i} lane={intent.status === "failed" ? "unresolved" : "action"}>
            <SitaCardHeader>
              <SitaCardTitle sub={`${intent.source ?? "unknown"} → ${intent.domain ?? "general"}`}>
                {intent.raw ?? intent.classification ?? `Intent #${i + 1}`}
              </SitaCardTitle>
              <span className={`text-xs font-medium ${intent.status === "failed" ? "text-destructive" : "text-trust-safe"}`}>
                {intent.status ?? "resolved"}
              </span>
            </SitaCardHeader>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
