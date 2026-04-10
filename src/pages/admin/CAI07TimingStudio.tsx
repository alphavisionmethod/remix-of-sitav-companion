import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Clock, Pause, Play, TrendingUp } from "lucide-react";

export default function CAI07TimingStudio() {
  const { timingIntelligence, sitaModes } = useSitaOS();

  const preferences = timingIntelligence.getPreferences?.() ?? {};
  const patterns = timingIntelligence.getLearnedPatterns?.() ?? [];
  const log = timingIntelligence.getDecisionLog?.() ?? [];
  const mode = sitaModes.getMode();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Clock} title="Proactive Timing Intelligence" subtitle="When to help, when to stay silent — timing as a first-class subsystem" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Current Mode" value={mode} /></SitaCard>
        <SitaCard><SitaMetric label="Learned Patterns" value={patterns.length} /></SitaCard>
        <SitaCard><SitaMetric label="Decisions Made" value={log.length} /></SitaCard>
        <SitaCard><SitaMetric label="Quiet Hours" value={preferences.quietHours ?? "None"} /></SitaCard>
      </div>

      <SitaSectionHeader title="Timing Preferences" subtitle="User-configured timing rules" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(preferences).length === 0 && <p className="text-sm text-muted-foreground col-span-2">No custom timing preferences set. Using intelligent defaults.</p>}
          {Object.entries(preferences).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">{key}</span>
              <span className="text-sm font-medium text-muted-foreground">{String(val)}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      <SitaSectionHeader title="Learned Patterns" subtitle="The OS adapts to your timing habits" />
      <div className="space-y-2">
        {patterns.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No patterns learned yet. The system adapts over time.</p></SitaCard>}
        {patterns.slice(0, 8).map((p: any, i: number) => (
          <SitaCard key={i}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-trust-safe" />
              <span className="text-sm text-foreground">{p.description ?? p.label ?? `Pattern ${i + 1}`}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Confidence: {Math.round((p.confidence ?? 0.5) * 100)}%</p>
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="Recent Decisions" subtitle="When the timing system chose to act or defer" />
      <div className="space-y-2">
        {log.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No timing decisions recorded yet.</p></SitaCard>}
        {log.slice(0, 10).map((d: any, i: number) => (
          <SitaCard key={i} lane={d.action === "defer" ? "changed" : "action"}>
            <SitaCardHeader>
              <SitaCardTitle sub={d.reason ?? "timing rule"}>{d.intent ?? `Decision #${i + 1}`}</SitaCardTitle>
              <div className="flex items-center gap-1">
                {d.action === "defer" ? <Pause className="h-3.5 w-3.5 text-muted-foreground" /> : <Play className="h-3.5 w-3.5 text-trust-safe" />}
                <span className="text-xs font-medium">{d.action ?? "act"}</span>
              </div>
            </SitaCardHeader>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
