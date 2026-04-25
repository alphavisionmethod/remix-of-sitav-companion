import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { Crown, Users, CheckCircle } from "lucide-react";

const DEFAULT_PERSONAS = [
  { id: "cos", name: "Chief of Staff", scope: "orchestration" },
  { id: "ea", name: "Executive Assistant", scope: "scheduling & tasks" },
  { id: "op", name: "Operator", scope: "execution & workflows" },
  { id: "str", name: "Strategist", scope: "planning & analysis" },
  { id: "ms", name: "Money Sentinel", scope: "financial oversight" },
  { id: "rs", name: "Relationship Guardian", scope: "follow-ups & contacts" },
  { id: "ws", name: "Wellness Sentinel", scope: "readiness & balance" },
];

export default function CAI06ChiefOfStaffCenter() {
  const { chiefOfStaff } = useSitaOS();

  const interventions = chiefOfStaff.getActiveInterventions();
  const stats = chiefOfStaff.getStats();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Crown} title="Chief-of-Staff Control Center" subtitle="Your coordinated support team — personas, interventions, and role orchestration" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Active Personas" value={DEFAULT_PERSONAS.length} /></SitaCard>
        <SitaCard><SitaMetric label="Active Interventions" value={interventions.length} trend={interventions.length > 3 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Acknowledgement Rate" value={`${Math.round(stats.acknowledgementRate * 100)}%`} trend={stats.acknowledgementRate > 0.8 ? "up" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Support Team Personas" subtitle="Coordinated roles acting as one integrated staff" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEFAULT_PERSONAS.map((p) => (
          <SitaCard key={p.id}>
            <SitaCardHeader>
              <SitaCardTitle sub={p.scope}>{p.name}</SitaCardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </SitaCardHeader>
            <span className="text-xs font-medium text-trust-safe">Active</span>
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Active Interventions" subtitle="Proactive help from your support team" />
      <div className="space-y-2">
        {interventions.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No active interventions. Your team is standing by.</p></SitaCard>}
        {interventions.map((int) => (
          <SitaCard key={int.id} lane="action" glow={int.urgency === "critical"}>
            <SitaCardHeader>
              <SitaCardTitle sub={int.role}>{int.title}</SitaCardTitle>
              <SitaButton variant="ghost" size="sm" onClick={() => chiefOfStaff.acknowledgeIntervention(int.id)}>
                <CheckCircle className="h-3.5 w-3.5" /> Acknowledge
              </SitaButton>
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">{int.message}</p>
            {int.suggestedActions.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {int.suggestedActions.map((a, j) => (
                  <span key={j} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{a.label}</span>
                ))}
              </div>
            )}
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Interventions by Role" />
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(stats.byRole).map(([role, count]) => (
          <SitaCard key={role}>
            <SitaMetric label={role} value={count} />
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
