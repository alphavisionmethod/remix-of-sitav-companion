import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Lock, Unlock, Shield, Layers } from "lucide-react";

export default function CAI14BoundaryControl() {
  const { boundaryEngine } = useSitaOS();

  const rules = boundaryEngine.listRules();
  const domains = ["personal", "business", "household", "financial", "workspace", "assistant", "boardroom", "wearable", "demo"];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Shield} title="Boundary Engine Control Center" subtitle="Life, work, wealth, and device boundaries — elegant control for trust and sophistication" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Boundary Rules" value={rules.length} /></SitaCard>
        <SitaCard><SitaMetric label="Domains" value={domains.length} /></SitaCard>
        <SitaCard><SitaMetric label="Allow Synthesis" value={rules.filter(r => r.permission === "allow").length} /></SitaCard>
      </div>

      <SitaSectionHeader title="Boundary Rules" subtitle="Cross-domain synthesis and privacy controls" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map(rule => {
          const isOpen = rule.permission === "allow";
          return (
            <SitaCard key={rule.id}>
              <SitaCardHeader>
                <SitaCardTitle sub={`${rule.fromScope} → ${rule.toScope}`}>{rule.id}</SitaCardTitle>
                {isOpen ? <Unlock className="h-4 w-4 text-trust-safe" /> : <Lock className="h-4 w-4 text-urgency-medium" />}
              </SitaCardHeader>
              <span className={`text-xs font-medium ${isOpen ? "text-trust-safe" : "text-urgency-medium"}`}>
                {rule.permission}
              </span>
            </SitaCard>
          );
        })}
      </div>

      <SitaSectionHeader title="How Boundaries Work" />
      <SitaCard>
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            The boundary engine checks every cross-domain intent through the orchestrator middleware.
            Rules are enforced before any data crosses domain boundaries.
          </p>
        </div>
      </SitaCard>
    </div>
  );
}
