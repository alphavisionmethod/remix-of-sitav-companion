import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { Database, AlertTriangle, Trash2, RefreshCw, CheckCircle } from "lucide-react";

export default function CAI13MemoryGovernance() {
  const { memoryGovernance } = useSitaOS();

  const stats = memoryGovernance.getStats?.() ?? { total: 0, active: 0, decayed: 0, corrected: 0, forgotten: 0 };
  const contradictions = memoryGovernance.getContradictions?.() ?? [];
  const corrections = memoryGovernance.getCorrections?.() ?? [];
  const forgetRequests = memoryGovernance.getForgetRequests?.() ?? [];
  const audit = memoryGovernance.getAuditLog?.() ?? [];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Database} title="Memory Governance Console" subtitle="Memory must be intelligent — confidence, freshness, correction, forgetting, and audit" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SitaCard><SitaMetric label="Total Memories" value={stats.total} /></SitaCard>
        <SitaCard><SitaMetric label="Active" value={stats.active} trend="up" /></SitaCard>
        <SitaCard><SitaMetric label="Decayed" value={stats.decayed} /></SitaCard>
        <SitaCard><SitaMetric label="Corrected" value={stats.corrected} /></SitaCard>
        <SitaCard><SitaMetric label="Forgotten" value={stats.forgotten} /></SitaCard>
      </div>

      {contradictions.length > 0 && (
        <>
          <SitaSectionHeader title="Contradictions Detected" subtitle="Conflicting memories that need resolution" />
          <div className="space-y-2">
            {contradictions.map((c: any, i: number) => (
              <SitaCard key={i} lane="unresolved" glow>
                <SitaCardHeader>
                  <SitaCardTitle sub={c.domain ?? "general"}>{c.description ?? `Contradiction #${i + 1}`}</SitaCardTitle>
                  <AlertTriangle className="h-4 w-4 text-urgency-high" />
                </SitaCardHeader>
                {c.memoryA && c.memoryB && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>A: {c.memoryA}</p>
                    <p>B: {c.memoryB}</p>
                  </div>
                )}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {corrections.length > 0 && (
        <>
          <SitaSectionHeader title="Recent Corrections" subtitle="Memories updated with new evidence" />
          <div className="space-y-2">
            {corrections.slice(0, 6).map((c: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-foreground">{c.description ?? `Correction ${i + 1}`}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.reason ?? "Updated based on new information"}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {forgetRequests.length > 0 && (
        <>
          <SitaSectionHeader title="Forget Requests" subtitle="Pending memory deletion requests" />
          <div className="space-y-2">
            {forgetRequests.map((f: any, i: number) => (
              <SitaCard key={i} lane="changed">
                <SitaCardHeader>
                  <SitaCardTitle>{f.memoryId ?? f.description ?? `Request ${i + 1}`}</SitaCardTitle>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </SitaCardHeader>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Audit Trail" subtitle="All memory governance actions" />
      <div className="space-y-2">
        {audit.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No audit entries yet.</p></SitaCard>}
        {audit.slice(0, 10).map((a: any, i: number) => (
          <SitaCard key={i}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{a.action ?? a.type ?? `Entry ${i + 1}`}</span>
              <span className="text-xs text-muted-foreground">{a.timestamp ?? ""}</span>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
