import { useSitaOS } from "@/contexts/SitaOSContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { Sliders, Play, CheckCircle } from "lucide-react";
import type { SitaMode } from "@/lib/services/sita-modes/index";

const ALL_MODES: SitaMode[] = [
  "focus", "travel", "boardroom", "recovery", "execution",
  "family", "founder", "investor_demo", "quiet", "strategic_planning",
  "deep_work", "default"
];

export default function CAI10ModesCenter() {
  const { sitaModes } = useSitaOS();

  const currentMode = sitaModes.getMode();
  const transitions = sitaModes.getTransitionHistory?.() ?? [];
  const rules = sitaModes.getTransitionRules?.() ?? [];

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Sliders} title="Personal Operating Modes" subtitle="Focus, Travel, Boardroom, Recovery — modes shape the entire OS experience" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard glow><SitaMetric label="Current Mode" value={currentMode} /></SitaCard>
        <SitaCard><SitaMetric label="Available Modes" value={ALL_MODES.length} /></SitaCard>
        <SitaCard><SitaMetric label="Transitions" value={transitions.length} /></SitaCard>
      </div>

      <SitaSectionHeader title="All Modes" subtitle="Click to switch — modes influence notifications, summaries, assistant tone, action routing" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_MODES.map(mode => (
          <SitaCard key={mode} selected={mode === currentMode} hover onClick={() => sitaModes.setMode(mode)}>
            <SitaCardHeader>
              <SitaCardTitle>{mode.replace(/_/g, " ")}</SitaCardTitle>
              {mode === currentMode ? <CheckCircle className="h-4 w-4 text-trust-safe" /> : <Play className="h-3.5 w-3.5 text-muted-foreground" />}
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">
              {mode === currentMode ? "Active now" : "Click to activate"}
            </p>
          </SitaCard>
        ))}
      </div>

      {transitions.length > 0 && (
        <>
          <SitaSectionHeader title="Transition History" subtitle="Recent mode changes" />
          <div className="space-y-2">
            {transitions.slice(0, 10).map((t: any, i: number) => (
              <SitaCard key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t.from ?? "?"} → {t.to ?? "?"}</span>
                  <span className="text-xs text-muted-foreground">{t.trigger ?? "manual"}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {rules.length > 0 && (
        <>
          <SitaSectionHeader title="Auto-Transition Rules" subtitle="Conditions that automatically switch modes" />
          <div className="grid gap-2 sm:grid-cols-2">
            {rules.map((r: any, i: number) => (
              <SitaCard key={i}>
                <p className="text-sm text-foreground">{r.condition ?? r.label ?? `Rule ${i + 1}`}</p>
                <p className="text-xs text-muted-foreground">→ {r.targetMode ?? r.to ?? "unknown"}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
