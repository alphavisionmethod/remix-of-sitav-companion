import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function CAI05TrustActionsBoard() {
  const { trustActions, sitaModes } = useSitaOS();

  const stats = trustActions.getStats();
  const mode = sitaModes.getMode();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Shield} title="Trust-Weighted Actions" subtitle="Every action classified by trust, risk, and execution posture — the safety layer of the OS" accent="trust" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Registered Actions" value={stats.totalActions} /></SitaCard>
        <SitaCard><SitaMetric label="Total Executions" value={stats.totalExecutions} /></SitaCard>
        <SitaCard><SitaMetric label="Current Mode" value={mode} /></SitaCard>
      </div>

      <SitaSectionHeader title="Executions by Mode" subtitle="How actions are distributed across operating modes" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats.byMode).map(([m, count]) => (
          <SitaCard key={m}>
            <SitaMetric label={m} value={count} />
          </SitaCard>
        ))}
        {Object.keys(stats.byMode).length === 0 && (
          <SitaCard><p className="text-sm text-muted-foreground">No executions recorded yet.</p></SitaCard>
        )}
      </div>

      <SitaSectionHeader title="Trust Action System" subtitle="Actions are evaluated in real-time based on device trust, user context, risk tier, and operating mode" />
      <SitaCard>
        <div className="space-y-3">
          {[
            { icon: Unlock, label: "Automatic", desc: "Low-risk actions executed without confirmation", color: "text-trust-safe" },
            { icon: AlertTriangle, label: "Confirm", desc: "Medium-risk actions requiring user confirmation", color: "text-urgency-medium" },
            { icon: Lock, label: "Blocked", desc: "High-risk actions blocked in current context", color: "text-destructive" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
