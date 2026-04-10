import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Heart, UserCheck, Clock, AlertCircle } from "lucide-react";

export default function CAI08RelationshipCenter() {
  const { relationships } = useSitaOS();

  const contacts = relationships.getContacts?.() ?? [];
  const neglected = relationships.getNeglectedContacts?.() ?? [];
  const overdue = relationships.getOverdueFollowUps?.() ?? [];
  const network = relationships.getNetworkStats?.() ?? { total: contacts.length, strongTies: 0, weakTies: 0 };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Heart} title="Relationship Memory Center" subtitle="Who matters, what's pending, interpersonal context — the human context engine" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Total Contacts" value={network.total ?? contacts.length} /></SitaCard>
        <SitaCard><SitaMetric label="Strong Ties" value={network.strongTies ?? 0} /></SitaCard>
        <SitaCard><SitaMetric label="Neglected" value={neglected.length} trend={neglected.length > 3 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Overdue Follow-ups" value={overdue.length} trend={overdue.length > 0 ? "down" : "flat"} /></SitaCard>
      </div>

      {neglected.length > 0 && (
        <>
          <SitaSectionHeader title="Neglected Contacts" subtitle="Important relationships that need attention" />
          <div className="grid gap-2 sm:grid-cols-2">
            {neglected.slice(0, 8).map((c: any, i: number) => (
              <SitaCard key={i} lane="unresolved">
                <SitaCardHeader>
                  <SitaCardTitle sub={c.relationship ?? "contact"}>{c.name ?? c.id ?? `Contact ${i + 1}`}</SitaCardTitle>
                  <AlertCircle className="h-4 w-4 text-urgency-medium" />
                </SitaCardHeader>
                <p className="text-xs text-muted-foreground">Last contact: {c.lastContact ?? "unknown"}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {overdue.length > 0 && (
        <>
          <SitaSectionHeader title="Overdue Follow-ups" subtitle="Promised actions and commitments" />
          <div className="space-y-2">
            {overdue.slice(0, 8).map((f: any, i: number) => (
              <SitaCard key={i} lane="action">
                <SitaCardHeader>
                  <SitaCardTitle sub={f.contact ?? "someone"}>{f.subject ?? f.description ?? `Follow-up #${i + 1}`}</SitaCardTitle>
                  <Clock className="h-3.5 w-3.5 text-urgency-high" />
                </SitaCardHeader>
                {f.dueDate && <p className="text-xs text-muted-foreground">Due: {f.dueDate}</p>}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <SitaSectionHeader title="Contact Network" subtitle="All tracked relationships" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No contacts tracked yet. Relationships build over time.</p></SitaCard>}
        {contacts.slice(0, 12).map((c: any, i: number) => (
          <SitaCard key={i}>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{c.name ?? c.id ?? `Contact ${i + 1}`}</p>
                <p className="text-xs text-muted-foreground">{c.relationship ?? c.role ?? "contact"}</p>
              </div>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
