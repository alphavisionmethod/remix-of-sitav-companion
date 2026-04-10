import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Heart, Clock } from "lucide-react";

export default function CAI08RelationshipCenter() {
  const { relationships } = useSitaOS();

  const overdue = relationships.getOverdueFollowUps();
  const network = relationships.getNetwork();
  const contacts = Object.values(network);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Heart} title="Relationship Memory Center" subtitle="Who matters, what's pending, interpersonal context — the human context engine" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Total Contacts" value={contacts.length} /></SitaCard>
        <SitaCard><SitaMetric label="Overdue Follow-ups" value={overdue.length} trend={overdue.length > 0 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Tiers" value={new Set(contacts.map(c => c.tier)).size} /></SitaCard>
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

      <SitaSectionHeader title="Contact Network" subtitle="All tracked relationships by tier" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No contacts tracked yet.</p></SitaCard>}
        {contacts.slice(0, 12).map((c) => (
          <SitaCard key={c.id}>
            <SitaCardHeader>
              <SitaCardTitle sub={c.relationship}>{c.name}</SitaCardTitle>
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">Tier: {c.tier} · Reciprocity: {Math.round(c.reciprocityScore * 100)}%</p>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
