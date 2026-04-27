import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { SitaCard, SitaCardHeader, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Sparkles, Palette, MessageSquare, Eye } from "lucide-react";
import type { SitaMode } from "@/lib/services/sita-modes/index";

const ALL_MODES: SitaMode[] = [
  "standard", "focus", "executive", "stealth", "family", "travel",
  "emergency", "recovery", "execution", "founder", "investor_demo", "boardroom"
];

export default function CAI15SignatureStudio() {
  const { experienceSignature, sitaModes } = useSitaOS();
  const currentSignature = useExperienceSignature();
  const currentMode = sitaModes.getMode();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Sparkles} title="Experience Signature Studio" subtitle="One unforgettable feel — tone, cadence, trust language, visual calmness, and premium interaction" accent="accent" />

      <SitaSectionHeader title="Current Signature" subtitle={`Mode: ${currentMode}`} />
      <SitaCard glow>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(currentSignature).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">{key}</span>
              <span className="text-sm font-bold text-primary">{String(val)}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      <SitaSectionHeader title="Signature Across All Modes" subtitle="How the experience adapts per operating mode" />
      <div className="space-y-3">
        {ALL_MODES.map(mode => {
          const sig = experienceSignature.getSignature({
            mode,
            surface: "desktop",
            urgentItemCount: 0,
            timeOfDay: new Date().getHours(),
            cognitiveLoad: 30,
          });
          return (
            <SitaCard key={mode} selected={mode === currentMode}>
              <SitaCardHeader>
                <SitaCardTitle sub={mode === currentMode ? "Active now" : "Preview"}>{mode.replace(/_/g, " ")}</SitaCardTitle>
                {mode === currentMode && <Eye className="h-4 w-4 text-primary" />}
              </SitaCardHeader>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(sig).map(([k, v]) => (
                  <div key={k} className="rounded bg-muted/50 px-2 py-1 text-xs">
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="font-medium text-foreground">{String(v)}</span>
                  </div>
                ))}
              </div>
            </SitaCard>
          );
        })}
      </div>

      <SitaSectionHeader title="Signature Dimensions" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: MessageSquare, label: "Assistant Voice & Tone", desc: "How the AI speaks — warm, concise, formal, or casual" },
          { icon: Palette, label: "Visual Calmness", desc: "UI density, animation level, color temperature" },
          { icon: Sparkles, label: "Summary Style", desc: "Digest depth, proof format, narrative voice" },
        ].map(({ icon: Icon, label, desc }) => (
          <SitaCard key={label}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          </SitaCard>
        ))}
      </div>
    </div>
  );
}
