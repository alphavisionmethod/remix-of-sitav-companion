import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { Crown, Users, Bell, CheckCircle } from "lucide-react";

export default function CAI06ChiefOfStaffCenter() {
  const { chiefOfStaff } = useSitaOS();

  const personas = chiefOfStaff.getPersonas?.() ?? [];
  const interventions = chiefOfStaff.getActiveInterventions();
  const triggers = chiefOfStaff.getProactiveTriggers?.() ?? [];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Crown} title="Chief-of-Staff Control Center" subtitle="Your coordinated support team — personas, interventions, proactive triggers, and role orchestration" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Active Personas" value={personas.length || 7} /></SitaCard>
        <SitaCard><SitaMetric label="Active Interventions" value={interventions.length} trend={interventions.length > 3 ? "down" : "flat"} /></SitaCard>
        <SitaCard><SitaMetric label="Proactive Triggers" value={triggers.length} /></SitaCard>
      </div>

      <SitaSectionHeader title="Support Team Personas" subtitle="Coordinated roles acting as one integrated staff" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(personas.length > 0 ? personas : [
          { id: "cos", name: "Chief of Staff", scope: "orchestration", active: true },
          { id: "ea", name: "Executive Assistant", scope: "scheduling & tasks", active: true },
          { id: "op", name: "Operator", scope: "execution & workflows", active: true },
          { id: "str", name: "Strategist", scope: "planning & analysis", active: true },
          { id: "ms", name: "Money Sentinel", scope: "financial oversight", active: true },
          { id: "rs", name: "Relationship Guardian", scope: "follow-ups & contacts", active: true },
          { id: "ws", name: "Wellness Sentinel", scope: "readiness & balance", active: true },
        ]).map((p: any) => (
          <SitaCard key={p.id}>
            <SitaCardHeader>
              <SitaCardTitle sub={p.scope ?? p.domain}>{p.name ?? p.id}</SitaCardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </SitaCardHeader>
            <span className={`text-xs font-medium ${p.active !== false ? "text-trust-safe" : "text-muted-foreground"}`}>
              {p.active !== false ? "Active" : "Inactive"}
            </span>
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Active Interventions" subtitle="Proactive help from your support team" />
      <div className="space-y-2">
        {interventions.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No active interventions. Your team is standing by.</p></SitaCard>}
        {interventions.map((int: any, i: number) => (
          <SitaCard key={i} lane="action" glow={int.priority === "high"}>
            <SitaCardHeader>
              <SitaCardTitle sub={int.persona ?? "chief-of-staff"}>{int.title ?? int.message ?? `Intervention #${i + 1}`}</SitaCardTitle>
              <SitaButton variant="ghost" size="sm" onClick={() => chiefOfStaff.acknowledgeIntervention(int.id)}>
                <CheckCircle className="h-3.5 w-3.5" /> Acknowledge
              </SitaButton>
            </SitaCardHeader>
            {int.recommendation && <p className="text-xs text-muted-foreground">{int.recommendation}</p>}
          </SitaCard>
        ))}
      </div>

      {triggers.length > 0 && (
        <>
          <SitaSectionHeader title="Proactive Triggers" subtitle="Conditions that activate support team responses" />
          <div className="grid gap-2 sm:grid-cols-2">
            {triggers.map((t: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t.label ?? t.condition ?? `Trigger ${i + 1}`}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.action ?? "Notify user"}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
