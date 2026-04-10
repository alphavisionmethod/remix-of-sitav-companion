import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Heart, Clock, AlertCircle } from "lucide-react";

export default function CAI08RelationshipCenter() {
  const { relationships } = useSitaOS();

  const overdue = relationships.getOverdueFollowUps();
  const stats = relationships.getStats();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Heart} title="Relationship Memory Center" subtitle="Who matters, what's pending, interpersonal context — the human context engine" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Contacts" value={stats.totalContacts} /></SitaCard>
        <SitaCard><SitaMetric label="Active Follow-ups" value={stats.activeFollowUps} /></SitaCard>
        <SitaCard><SitaMetric label="Overdue" value={overdue.length} trend={overdue.length > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Avg Reciprocity" value={`${Math.round(stats.avgReciprocity * 100)}%`} trend={stats.avgReciprocity > 0.5 ? "up" : "flat"} /></SitaCard>
      </div>

      {overdue.length > 0 && (
        <>
          <SitaSectionHeader title="Overdue Follow-ups" subtitle="Promised actions and commitments" />
          <div className="space-y-2">
            {overdue.slice(0, 8).map(({ contact, followUp }, i) => (
              <SitaCard key={followUp.id ?? i} lane="action">
                <SitaCardHeader>
                  <SitaCardTitle sub={contact.name}>{followUp.description}</SitaCardTitle>
                  <Clock className="h-3.5 w-3.5 text-urgency-high" />
                </SitaCardHeader>
                <p className="text-xs text-muted-foreground">Due: {followUp.dueDate}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Relationship Intelligence" subtitle="How the OS understands human context" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(stats.byTier ?? {}).map(([tier, count]) => (
            <div key={tier} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">{tier}</span>
              <span className="text-sm font-medium text-primary">{count as number}</span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
