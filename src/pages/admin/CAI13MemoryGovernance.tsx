import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Database, RefreshCw } from "lucide-react";
import { useMemoryGovernanceRecords, useMemoryCorrections } from "@/hooks/useCAIData";

export default function CAI13MemoryGovernance() {
  const { memoryGovernance } = useSitaOS();
  const { data: dbGovernance = [], isLoading: loadingGov } = useMemoryGovernanceRecords();
  const { data: dbCorrections = [], isLoading: loadingCorr } = useMemoryCorrections();

  const stats = memoryGovernance.getStats();
  const corrections = memoryGovernance.getCorrections();
  const auditLog = memoryGovernance.getAuditLog();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Database} title="Memory Governance Console" subtitle="Memory must be intelligent — confidence, freshness, correction, forgetting, and audit" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SitaCard><SitaMetric label="Total Memories" value={stats.totalMemories} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Confidence" value={`${Math.round(stats.avgConfidence * 100)}%`} trend={stats.avgConfidence > 0.7 ? "up" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Contradictions" value={stats.contradictions} trend={stats.contradictions > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Corrections" value={stats.corrections} /></SitaCard>
        <SitaCard><SitaMetric label="DB Records" value={dbGovernance.length} /></SitaCard>
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
        </div>
      </SitaCard>

      {corrections.length > 0 && (
        <>
          <SitaSectionHeader title="Recent Corrections (In-Memory)" subtitle="Memories updated with new evidence" />
          <div className="space-y-2">
            {corrections.slice(0, 6).map((c) => (
              <SitaCard key={c.id}>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-foreground">Memory {c.memoryId}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.reason} · by {c.correctedBy}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {/* Persisted DB corrections */}
      <SitaSectionHeader title="Persisted Corrections (DB)" subtitle={loadingCorr ? "Loading…" : `${dbCorrections.length} records`} />
      <div className="space-y-2">
        {dbCorrections.slice(0, 10).map((c: any) => (
          <SitaCard key={c.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-foreground">{c.correction_type}: {c.memory_ref}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p>
          </SitaCard>
        ))}
        {dbCorrections.length === 0 && !loadingCorr && (
          <SitaCard><p className="text-sm text-muted-foreground">No persisted correction records yet.</p></SitaCard>
        )}
      </div>

      {/* Persisted governance records */}
      {!loadingGov && dbGovernance.length > 0 && (
        <>
          <SitaSectionHeader title="Governance Records (DB)" subtitle={`${dbGovernance.length} tracked memories`} />
          <div className="space-y-2">
            {dbGovernance.slice(0, 10).map((g: any) => (
              <SitaCard key={g.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{g.memory_ref}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">{g.correction_state}</span>
                    <span className="text-[10px] text-muted-foreground">confidence: {Math.round((g.confidence ?? 0) * 100)}%</span>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {auditLog.length > 0 && (
        <>
          <SitaSectionHeader title="Audit Trail (In-Memory)" />
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
