import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Sliders, Play, CheckCircle } from "lucide-react";
import type { SitaMode } from "@/lib/services/sita-modes/index";

const ALL_MODES: SitaMode[] = [
  "standard", "focus", "executive", "stealth", "family", "travel",
  "emergency", "recovery", "execution", "founder", "investor_demo", "boardroom"
];

export default function CAI10ModesCenter() {
  const { sitaModes } = useSitaOS();

  const currentMode = sitaModes.getMode();
  const transitions = sitaModes.getTransitionHistory();
  const config = sitaModes.getModeConfig();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Sliders} title="Personal Operating Modes" subtitle="Focus, Travel, Boardroom, Recovery — modes shape the entire OS experience" accent="accent" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SitaCard glow><SitaMetric label="Current Mode" value={currentMode} /></SitaCard>
        <SitaCard><SitaMetric label="Available Modes" value={ALL_MODES.length} /></SitaCard>
        <SitaCard><SitaMetric label="Transitions" value={transitions.length} /></SitaCard>
      </div>

      <SitaSectionHeader title="Current Mode Config" subtitle={`${currentMode} — active configuration`} />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Notifications:</span> <span className="font-medium text-foreground">{config.notifications}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Assistant Tone:</span> <span className="font-medium text-foreground">{config.assistantTone}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Summary Depth:</span> <span className="font-medium text-foreground">{config.summaryDepth}</span></div>
          <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Automations:</span> <span className="font-medium text-foreground">{config.automationsEnabled ? "Enabled" : "Disabled"}</span></div>
        </div>
      </SitaCard>

      <SitaSectionHeader title="All Modes" subtitle="Click to switch — modes influence everything" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_MODES.map(mode => (
          <SitaCard key={mode} selected={mode === currentMode} hover onClick={() => sitaModes.setMode(mode)}>
            <SitaCardHeader>
              <SitaCardTitle>{mode.replace(/_/g, " ")}</SitaCardTitle>
              {mode === currentMode ? <CheckCircle className="h-4 w-4 text-trust-safe" /> : <Play className="h-3.5 w-3.5 text-muted-foreground" />}
            </SitaCardHeader>
            <p className="text-xs text-muted-foreground">{mode === currentMode ? "Active now" : "Click to activate"}</p>
          </SitaCard>
        ))}
      </div>

      {transitions.length > 0 && (
        <>
          <SitaSectionHeader title="Transition History" subtitle="Recent mode changes" />
          <div className="space-y-2">
            {transitions.slice(0, 10).map((t, i) => (
              <SitaCard key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t.from} → {t.to}</span>
                  <span className="text-xs text-muted-foreground">{t.trigger}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
