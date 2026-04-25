import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Lightbulb, TrendingUp, DollarSign } from "lucide-react";

export default function CAI12OpportunityBoard() {
  const { opportunityEngine } = useSitaOS();

  const stats = opportunityEngine.getStats();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Lightbulb} title="Opportunity Detection Board" subtitle="Leverage, anomalies, strategic openings — the OS detects what you might miss" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Signals" value={stats.total} /></SitaCard>
        <SitaCard><SitaMetric label="Est. Value" value={stats.totalValue ? `$${stats.totalValue.toLocaleString()}` : "—"} trend={stats.totalValue > 0 ? "up" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="By Type" value={Object.keys(stats.byType).length} /></SitaCard>
        <SitaCard><SitaMetric label="By Status" value={Object.keys(stats.byStatus).length} /></SitaCard>
      </div>

      <SitaSectionHeader title="By Type" subtitle="Distribution of detected opportunities" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.byType).map(([type, count]) => (
          <SitaCard key={type}>
            <SitaMetric label={type} value={count} />
          </SitaCard>
        ))}
        {Object.keys(stats.byType).length === 0 && (
          <SitaCard><p className="text-sm text-muted-foreground">No opportunities detected yet. The engine scans continuously.</p></SitaCard>
        )}
      </div>

      <SitaSectionHeader title="By Status" subtitle="Lifecycle of detected opportunities" />
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <SitaCard key={status}>
            <SitaMetric label={status} value={count} />
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="How It Works" />
      <SitaCard>
        <div className="space-y-3">
          {[
            { icon: Lightbulb, label: "Detection", desc: "Cross-domain pattern matching identifies opportunities" },
            { icon: TrendingUp, label: "Scoring", desc: "Each signal is scored by confidence and estimated value" },
            { icon: DollarSign, label: "Routing", desc: "Opportunities are routed to daily pulse, boardroom, or task suggestions" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
