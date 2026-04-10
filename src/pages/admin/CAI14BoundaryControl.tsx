import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Lock, Unlock, Shield, Layers } from "lucide-react";

export default function CAI14BoundaryControl() {
  const { boundaryEngine } = useSitaOS();

  const rules = boundaryEngine.getRules?.() ?? [];
  const domains = ["personal", "business", "household", "financial", "workspace", "assistant", "boardroom", "wearable", "demo"];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Shield} title="Boundary Engine Control Center" subtitle="Life, work, wealth, and device boundaries — elegant control for trust and sophistication" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Boundary Rules" value={rules.length || domains.length} /></SitaCard>
        <SitaCard><SitaMetric label="Domains" value={domains.length} /></SitaCard>
        <SitaCard><SitaMetric label="Cross-Domain Synthesis" value={rules.filter((r: any) => r.allowSynthesis).length || "Controlled"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Domain Boundaries" subtitle="Each domain has visibility, synthesis, and privacy controls" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map(domain => {
          const rule = rules.find((r: any) => r.domain === domain);
          const isOpen = rule?.allowSynthesis ?? true;
          return (
            <SitaCard key={domain}>
              <SitaCardHeader>
                <SitaCardTitle sub={rule?.visibility ?? "standard"}>{domain}</SitaCardTitle>
                {isOpen ? <Unlock className="h-4 w-4 text-trust-safe" /> : <Lock className="h-4 w-4 text-urgency-medium" />}
              </SitaCardHeader>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${isOpen ? "bg-trust-safe/10 text-trust-safe" : "bg-urgency-medium/10 text-urgency-medium"}`}>
                  {isOpen ? "Synthesis allowed" : "Isolated"}
                </span>
              </div>
            </SitaCard>
          );
        })}
      </div>

      <SitaSectionHeader title="Cross-Domain Check" subtitle="Test whether two domains can share context" />
      <SitaCard>
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            The boundary engine checks every cross-domain intent through the orchestrator middleware.
            Rules are enforced before any data crosses domain boundaries.
          </p>
        </div>
      </SitaCard>

      {rules.length > 0 && (
        <>
          <SitaSectionHeader title="All Rules" subtitle="Complete boundary policy set" />
          <div className="space-y-2">
            {rules.map((r: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{r.domain ?? r.label ?? `Rule ${i + 1}`}: {r.description ?? r.policy ?? "standard"}</span>
                  <span className={`text-xs font-medium ${r.strict ? "text-urgency-high" : "text-trust-safe"}`}>{r.strict ? "Strict" : "Flexible"}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
