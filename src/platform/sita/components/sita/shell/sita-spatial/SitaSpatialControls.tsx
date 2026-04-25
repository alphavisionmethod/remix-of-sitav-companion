// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Control Center row for spatial features
// 4 toggles: Handoff, Boardroom, Gesture, Gaze, Spatial.
// ═══════════════════════════════════════════════════════════════

import { Hand, Eye, Layers3, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpatialFeatures } from "@/lib/sita-spatial/feature-flags";

interface Toggle {
  key: keyof ReturnType<typeof useSpatialFeatures>[0];
  label: string;
  sub: string;
  icon: JSX.Element;
}

const TOGGLES: Toggle[] = [
  { key: "handoff", label: "Handoff", sub: "Multi-device", icon: <Smartphone className="h-3.5 w-3.5" /> },
  { key: "boardroom", label: "Boardroom", sub: "Holographic", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: "gesture", label: "Gesture", sub: "Camera", icon: <Hand className="h-3.5 w-3.5" /> },
  { key: "gaze", label: "Gaze", sub: "Cursor proxy", icon: <Eye className="h-3.5 w-3.5" /> },
  { key: "spatial", label: "Spatial", sub: "⌘⇧Space", icon: <Layers3 className="h-3.5 w-3.5" /> },
];

export function SitaSpatialControls() {
  const [features, update] = useSpatialFeatures();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_100%/0.4)]">Sita · Spatial</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {TOGGLES.map((t) => {
          const active = features[t.key];
          return (
            <button
              key={t.key}
              onClick={() => update({ [t.key]: !active })}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150",
                active
                  ? "bg-[hsl(265_55%_55%/0.22)] text-[hsl(265_55%_72%)]"
                  : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_100%/0.4)] hover:bg-[hsl(0_0%_100%/0.07)]"
              )}
              aria-pressed={active}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center",
                  active ? "bg-[hsl(265_55%_55%)]" : "bg-[hsl(0_0%_100%/0.08)]"
                )}
              >
                <span className={active ? "text-white" : ""}>{t.icon}</span>
              </div>
              <span className="text-[8px] font-medium leading-tight text-center">{t.label}</span>
              <span className="text-[7px] opacity-50 leading-tight text-center">{t.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
