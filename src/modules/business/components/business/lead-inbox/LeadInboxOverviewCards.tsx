import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { InboxItem, getInboxStats } from "./mock-inbox-data";
import type { LeadSource } from "./LeadSourceBadge";
import { LeadSourceBadge } from "./LeadSourceBadge";

const QualityGauge = ({ items }: { items: InboxItem[] }) => {
  const pending = items.filter(i => i.triage_status === "new" || i.triage_status === "reviewing");
  const high = pending.filter(i => i.quality_score >= 75).length;
  const mid = pending.filter(i => i.quality_score >= 40 && i.quality_score < 75).length;
  const low = pending.filter(i => i.quality_score < 40).length;
  const total = pending.length || 1;

  return (
    <SitaCard hover={false} className="p-4">
      <p className="text-xs font-semibold text-foreground mb-3">Quality Distribution</p>
      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted/30">
        {high > 0 && <div className="bg-[hsl(var(--trust-safe))] rounded-l-full transition-all" style={{ width: `${(high / total) * 100}%` }} />}
        {mid > 0 && <div className="bg-[hsl(var(--sita-gold))] transition-all" style={{ width: `${(mid / total) * 100}%` }} />}
        {low > 0 && <div className="bg-[hsl(var(--trust-degraded))] rounded-r-full transition-all" style={{ width: `${(low / total) * 100}%` }} />}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))]" /> High ({high})</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sita-gold))]" /> Medium ({mid})</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-degraded))]" /> Low ({low})</span>
      </div>
    </SitaCard>
  );
};

const SourceMix = ({ items }: { items: InboxItem[] }) => {
  const stats = getInboxStats(items);
  return (
    <SitaCard hover={false} className="p-4">
      <p className="text-xs font-semibold text-foreground mb-3">Source Mix</p>
      <div className="space-y-2">
        {stats.sources.slice(0, 5).map(([src, count]) => (
          <div key={src} className="flex items-center justify-between">
            <LeadSourceBadge source={src as LeadSource} size="xs" />
            <div className="flex items-center gap-2 flex-1 ml-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-primary/40 transition-all" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono w-4 text-right">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </SitaCard>
  );
};

const ArrivalTimeline = ({ items }: { items: InboxItem[] }) => {
  const pending = items.filter(i => i.triage_status === "new");
  const last6h = pending.filter(i => Date.now() - new Date(i.created_at).getTime() < 6 * 3600000).length;
  const last24h = pending.filter(i => Date.now() - new Date(i.created_at).getTime() < 24 * 3600000).length;

  return (
    <SitaCard hover={false} className="p-4">
      <p className="text-xs font-semibold text-foreground mb-3">Arrival Velocity</p>
      <div className="flex items-end gap-3">
        <div className="text-center flex-1">
          <p className="font-display text-2xl font-bold text-primary">{last6h}</p>
          <p className="text-[10px] text-muted-foreground">Last 6h</p>
        </div>
        <div className="text-center flex-1">
          <p className="font-display text-2xl font-bold text-foreground">{last24h}</p>
          <p className="text-[10px] text-muted-foreground">Last 24h</p>
        </div>
        <div className="text-center flex-1">
          <p className="font-display text-2xl font-bold text-muted-foreground">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Pending</p>
        </div>
      </div>
    </SitaCard>
  );
};

export const LeadInboxOverviewCards = ({ items }: { items: InboxItem[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <SourceMix items={items} />
    <QualityGauge items={items} />
    <ArrivalTimeline items={items} />
  </div>
);
