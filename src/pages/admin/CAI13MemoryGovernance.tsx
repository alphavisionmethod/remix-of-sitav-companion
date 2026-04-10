import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Database, RefreshCw } from "lucide-react";

export default function CAI13MemoryGovernance() {
  const { memoryGovernance } = useSitaOS();

  const stats = memoryGovernance.getStats();
  const corrections = memoryGovernance.getCorrections();
  const auditLog = memoryGovernance.getAuditLog();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Database} title="Memory Governance Console" subtitle="Memory must be intelligent — confidence, freshness, correction, forgetting, and audit" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Memories" value={stats.totalMemories} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Confidence" value={`${Math.round(stats.avgConfidence * 100)}%`} trend={stats.avgConfidence > 0.7 ? "up" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Contradictions" value={stats.contradictions} trend={stats.contradictions > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Corrections" value={stats.corrections} /></SitaCard>
      </div>

      <SitaSectionHeader title="Memory Distribution" subtitle="By type" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.byType).map(([type, count]) => (
          <SitaCard key={type}>
            <SitaMetric label={type} value={count} />
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Health Metrics" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Avg Freshness:</span> <span className="font-medium text-foreground">{Math.round(stats.avgFreshness * 100)}%</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Forget Requests:</span> <span className="font-medium text-foreground">{stats.forgetRequests}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Contradictions:</span> <span className="font-medium text-foreground">{stats.contradictions}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Corrections:</span> <span className="font-medium text-foreground">{stats.corrections}</span></div>
        </div>
      </SitaCard>

      {corrections.length > 0 && (
        <>
          <SitaSectionHeader title="Recent Corrections" subtitle="Memories updated with new evidence" />
          <div className="space-y-2">
            {corrections.slice(0, 6).map((c) => (
              <SitaCard key={c.id}>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-foreground">{c.field}: {c.oldValue} → {c.newValue}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.reason} · by {c.correctedBy}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {auditLog.length > 0 && (
        <>
          <SitaSectionHeader title="Audit Trail" subtitle="All memory governance actions" />
          <div className="space-y-2">
            {auditLog.slice(0, 10).map((a) => (
              <SitaCard key={a.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{a.action}: {a.memoryId}</span>
                  <span className="text-xs text-muted-foreground">{a.timestamp}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
