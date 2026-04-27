import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Zap, Database } from "lucide-react";
import { useState } from "react";
import { useIntentResolutions } from "@/modules/business/hooks/useCAIData";

export default function CAI02IntentTraceBoard() {
  const { intentOrchestrator } = useSitaOS();
  const [filter, setFilter] = useState<string>("all");
  const { data: persistedIntents = [], isLoading: loadingDB } = useIntentResolutions({ limit: 50 });

  const stats = intentOrchestrator.getStats();
  const recentIntents = intentOrchestrator.getRecentIntents?.() ?? [];
  const sources = ["all", ...Object.keys(stats.bySource)];

  const filtered = filter === "all" ? recentIntents : recentIntents.filter((i: any) => i.source === filter);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Zap} title="Intent & Command Trace Board" subtitle="Every action flows through the unified intent orchestrator — inspect, trace, and debug" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SitaCard><SitaMetric label="In-Memory" value={stats.total} /></SitaCard>
        <SitaCard><SitaMetric label="Persisted (DB)" value={persistedIntents.length} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Duration" value={`${stats.avgDuration}ms`} /></SitaCard>
        <SitaCard><SitaMetric label="Sources" value={Object.keys(stats.bySource).length} /></SitaCard>
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

      <SitaSectionHeader title="Recent Intents (In-Memory)" subtitle="Live trace log" action={
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

      {/* Persisted DB records */}
      <SitaSectionHeader title="Persisted Intent Resolutions" subtitle={loadingDB ? "Loading from database…" : `${persistedIntents.length} records from CAI tables`} action={
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Database className="h-3.5 w-3.5" /> Supabase</div>
      } />
      <div className="space-y-2">
        {persistedIntents.slice(0, 20).map((row: any) => (
          <SitaCard key={row.id}>
            <SitaCardHeader>
              <SitaCardTitle sub={`${row.source_surface ?? "unknown"} → ${row.target_capability ?? "general"}`}>
                {row.raw_input?.slice(0, 80) ?? row.resolved_intent ?? "Intent"}
              </SitaCardTitle>
              <div className="flex items-center gap-2">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{row.status}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(row.created_at).toLocaleTimeString()}</span>
              </div>
            </SitaCardHeader>
          </SitaCard>
        ))}
        {persistedIntents.length === 0 && !loadingDB && (
          <SitaCard><p className="text-sm text-muted-foreground">No persisted intent records yet. Intents will be saved as the OS processes commands.</p></SitaCard>
        )}
      </div>
    </div>
  );
}
