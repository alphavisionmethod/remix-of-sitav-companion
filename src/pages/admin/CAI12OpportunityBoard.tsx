import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Lightbulb, TrendingUp, DollarSign, Layers } from "lucide-react";

export default function CAI12OpportunityBoard() {
  const { opportunityEngine } = useSitaOS();

  const signals = opportunityEngine.getActiveSignals?.() ?? [];
  const patterns = opportunityEngine.getPatterns?.() ?? [];
  const stats = opportunityEngine.getStats?.() ?? { total: signals.length, totalValue: 0, crossDomain: 0 };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Lightbulb} title="Opportunity Detection Board" subtitle="Leverage, anomalies, strategic openings — the OS detects what you might miss" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Active Signals" value={signals.length} /></SitaCard>
        <SitaCard><SitaMetric label="Patterns" value={patterns.length} /></SitaCard>
        <SitaCard><SitaMetric label="Cross-Domain" value={stats.crossDomain ?? 0} /></SitaCard>
        <SitaCard><SitaMetric label="Est. Value" value={stats.totalValue ? `$${stats.totalValue.toLocaleString()}` : "—"} trend={stats.totalValue > 0 ? "up" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Active Opportunity Signals" subtitle="Detected leverage points across all domains" />
      <div className="space-y-2">
        {signals.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No opportunities detected yet. The engine scans continuously.</p></SitaCard>}
        {signals.map((s: any, i: number) => (
          <SitaCard key={i} lane="opportunity" glow={s.priority === "high"}>
            <SitaCardHeader>
              <SitaCardTitle sub={s.domain ?? s.category ?? "general"}>{s.title ?? s.description ?? `Opportunity #${i + 1}`}</SitaCardTitle>
              <div className="flex items-center gap-1.5">
                {s.estimatedValue && <span className="text-xs font-medium text-trust-safe"><DollarSign className="inline h-3 w-3" />{s.estimatedValue}</span>}
              </div>
            </SitaCardHeader>
            {s.rationale && <p className="text-xs text-muted-foreground">{s.rationale}</p>}
            {s.domains && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.domains.map((d: string) => <span key={d} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{d}</span>)}
              </div>
            )}
          </SitaCard>
        ))}
      </div>

      {patterns.length > 0 && (
        <>
          <SitaSectionHeader title="Detected Patterns" subtitle="Recurring opportunities and trends" />
          <div className="grid gap-2 sm:grid-cols-2">
            {patterns.map((p: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-trust-safe" />
                  <span className="text-sm text-foreground">{p.description ?? p.label ?? `Pattern ${i + 1}`}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Confidence: {Math.round((p.confidence ?? 0.5) * 100)}%</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
