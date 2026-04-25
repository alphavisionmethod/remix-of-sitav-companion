import { useSitaOS } from "@/contexts/SitaOSContext";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaMetric, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Monitor, Palette, Type, Zap } from "lucide-react";

export default function CAI11InterfaceProfiler() {
  const { sitaModes, attentionOS } = useSitaOS();
  const interfaceState = useAdaptiveInterface();
  const signature = useExperienceSignature();

  const mode = sitaModes.getMode();
  const cogLoad = attentionOS.getCognitiveLoad();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Monitor} title="Adaptive Interface Profiler" subtitle="How the UI adapts to context — density, animation, font size, color temperature, and information depth" accent="primary" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SitaCard><SitaMetric label="Density" value={interfaceState.density} /></SitaCard>
        <SitaCard><SitaMetric label="Animation" value={interfaceState.animationLevel} /></SitaCard>
        <SitaCard><SitaMetric label="Font Size" value={interfaceState.fontSize} /></SitaCard>
        <SitaCard><SitaMetric label="Color Temp" value={interfaceState.colorTemperature} /></SitaCard>
      </div>

      <SitaSectionHeader title="Current Interface State" subtitle={`Mode: ${mode} · Cognitive Load: ${Math.round(cogLoad.score * 100)}%`} />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(interfaceState).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">{key}</span>
              <span className="text-sm font-medium text-primary">{Array.isArray(val) ? val.join(", ") || "none" : String(val)}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      <SitaSectionHeader title="Experience Signature" subtitle="Tone, verbosity, and visual density for the current context" />
      <SitaCard>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(signature).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">{key}</span>
              <span className="text-sm font-medium text-accent">{String(val)}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      <SitaSectionHeader title="CSS Custom Properties" subtitle="Live values driving the adaptive interface" />
      <SitaCard>
        <div className="space-y-2 font-mono text-xs">
          {["--os-density-scale", "--os-animation-duration", "--os-font-scale", "--os-color-temperature"].map(prop => (
            <div key={prop} className="flex items-center justify-between rounded bg-muted/50 px-3 py-1.5">
              <span className="text-muted-foreground">{prop}</span>
              <span className="text-foreground">{typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(prop) || "unset" : "—"}</span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
