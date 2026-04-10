import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function CAI05TrustActionsBoard() {
  const { trustActions, sitaModes } = useSitaOS();

  const actions = trustActions.getRegisteredActions?.() ?? [];
  const log = trustActions.getExecutionLog?.() ?? [];
  const overrides = trustActions.getOverrides?.() ?? [];
  const mode = sitaModes.getMode();

  const autoCount = actions.filter((a: any) => a.defaultPosture === "automatic").length;
  const confirmCount = actions.filter((a: any) => a.defaultPosture === "confirm").length;
  const blockedCount = actions.filter((a: any) => a.defaultPosture === "blocked").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Shield} title="Trust-Weighted Actions" subtitle="Every action classified by trust, risk, and execution posture — the safety layer of the OS" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Registered Actions" value={actions.length} /></SitaCard>
        <SitaCard><SitaMetric label="Auto-Execute" value={autoCount} /></SitaCard>
        <SitaCard><SitaMetric label="Require Confirm" value={confirmCount} /></SitaCard>
        <SitaCard><SitaMetric label="Blocked" value={blockedCount} trend={blockedCount > 0 ? "down" : "flat"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Action Registry" subtitle={`Current mode: ${mode}`} />
      <div className="grid gap-2 sm:grid-cols-2">
        {actions.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No actions registered yet.</p></SitaCard>}
        {actions.slice(0, 16).map((action: any, i: number) => {
          const posture = action.defaultPosture ?? "confirm";
          const Icon = posture === "automatic" ? Unlock : posture === "blocked" ? Lock : AlertTriangle;
          const color = posture === "automatic" ? "text-trust-safe" : posture === "blocked" ? "text-destructive" : "text-urgency-medium";
          return (
            <SitaCard key={i}>
              <SitaCardHeader>
                <SitaCardTitle sub={action.category ?? action.domain ?? "general"}>{action.label ?? action.id ?? `Action ${i + 1}`}</SitaCardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </SitaCardHeader>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${color} bg-secondary`}>{posture}</span>
                {action.riskTier && <span className="text-xs text-muted-foreground">risk: {action.riskTier}</span>}
              </div>
            </SitaCard>
          );
        })}
      </div>

      {log.length > 0 && (
        <>
          <SitaSectionHeader title="Execution Log" subtitle="Recent trust-weighted action decisions" />
          <div className="space-y-2">
            {log.slice(0, 10).map((entry: any, i: number) => (
              <SitaCard key={i} lane={entry.decision === "blocked" ? "unresolved" : entry.decision === "auto" ? "action" : "changed"}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{entry.actionId ?? `Action ${i + 1}`}</span>
                  <span className="text-xs font-medium">{entry.decision ?? "pending"}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {overrides.length > 0 && (
        <>
          <SitaSectionHeader title="Manual Overrides" subtitle="User overrides to trust posture" />
          <div className="space-y-2">
            {overrides.slice(0, 5).map((o: any, i: number) => (
              <SitaCard key={i}>
                <p className="text-sm text-foreground">{o.actionId}: {o.from} → {o.to}</p>
                <p className="text-xs text-muted-foreground">{o.reason ?? "No reason provided"}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
