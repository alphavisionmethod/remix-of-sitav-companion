import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Heart, Clock } from "lucide-react";

export default function CAI08RelationshipCenter() {
  const { relationships } = useSitaOS();

  const overdue = relationships.getOverdueFollowUps();
  const upcoming = relationships.getUpcomingKeyDates();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Heart} title="Relationship Memory Center" subtitle="Who matters, what's pending, interpersonal context — the human context engine" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Overdue Follow-ups" value={overdue.length} trend={overdue.length > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Upcoming Key Dates" value={upcoming.length} /></SitaCard>
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
                <p className="text-xs text-muted-foreground">Due: {followUp.dueDate} · {contact.type}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <SitaSectionHeader title="Upcoming Key Dates" subtitle="Important dates in the next 30 days" />
          <div className="space-y-2">
            {upcoming.slice(0, 8).map(({ contact, keyDate, daysUntil }, i) => (
              <SitaCard key={i}>
                <SitaCardHeader>
                  <SitaCardTitle sub={contact.name}>{keyDate.label}</SitaCardTitle>
                </SitaCardHeader>
                <p className="text-xs text-muted-foreground">{keyDate.date} · {daysUntil} days away</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {overdue.length === 0 && upcoming.length === 0 && (
        <SitaCard><p className="text-sm text-muted-foreground">No relationships tracked yet. Add contacts to begin.</p></SitaCard>
      )}
    </div>
  );
}
