import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Clock, TrendingUp } from "lucide-react";

export default function CAI07TimingStudio() {
  const { timingIntelligence, sitaModes } = useSitaOS();

  const preferences = timingIntelligence.getPreferences();
  const patterns = timingIntelligence.getPatterns();
  const mode = sitaModes.getMode();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Clock} title="Proactive Timing Intelligence" subtitle="When to help, when to stay silent — timing as a first-class subsystem" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard><SitaMetric label="Current Mode" value={mode} /></SitaCard>
        <SitaCard><SitaMetric label="Learned Patterns" value={patterns.length} /></SitaCard>
        <SitaCard><SitaMetric label="Quiet Hours" value={`${preferences.quietHoursStart}–${preferences.quietHoursEnd}`} /></SitaCard>
      </div>

      <SitaSectionHeader title="Timing Preferences" subtitle="User-configured timing rules" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Summary Time:</span> <span className="font-medium text-foreground">{preferences.preferredSummaryTime}:00</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Approval Time:</span> <span className="font-medium text-foreground">{preferences.preferredApprovalTime}:00</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Reminder Lead:</span> <span className="font-medium text-foreground">{preferences.preferredReminderLeadMinutes} min</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Urgency Override:</span> <span className="font-medium text-foreground">≥ {preferences.urgencyOverrideThreshold}/10</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Defer During Focus:</span> <span className="font-medium text-foreground">{preferences.deferDuringFocus ? "Yes" : "No"}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Defer During Exercise:</span> <span className="font-medium text-foreground">{preferences.deferDuringExercise ? "Yes" : "No"}</span></div>
        </div>
      </SitaCard>

      <SitaSectionHeader title="Learned Patterns" subtitle="The OS adapts to your timing habits" />
      <div className="space-y-2">
        {patterns.length === 0 && <SitaCard><p className="text-sm text-muted-foreground">No patterns learned yet. The system adapts over time.</p></SitaCard>}
        {patterns.slice(0, 8).map((p, i) => (
          <SitaCard key={i}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-trust-safe" />
              <span className="text-sm text-foreground">{p.action}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Best hours: {p.bestHours.join(", ")} · Completion: {Math.round(p.completionRate * 100)}% · Samples: {p.sampleSize}
            </p>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
