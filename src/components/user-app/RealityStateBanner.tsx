// ═══════════════════════════════════════════════════════════════
// User App — Reality State Banner
// Subtle, friendly indicator for non-real modes
// ═══════════════════════════════════════════════════════════════

import { useRealityModeSafe } from "@/lib/dual-reality";
import { Play, FlaskConical } from "lucide-react";

export function RealityStateBanner() {
  const { mode, scenarioKey, exitDemoMode } = useRealityModeSafe();

  if (mode === "real") return null;

  const isDemo = mode === "demo" || mode === "dev_demo";
  const Icon = isDemo ? Play : FlaskConical;
  const label = isDemo ? "Demo Preview" : "Sandbox";
  const description = isDemo
    ? "You're viewing a curated demo experience. Actions are simulated."
    : "Sandbox mode — changes won't affect your real data.";

  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary/60" />
        <div>
          <span className="text-sm font-medium text-primary/80">{label}</span>
          {scenarioKey && (
            <span className="text-xs text-muted-foreground ml-2">({scenarioKey})</span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={exitDemoMode}
        className="text-xs text-primary/60 hover:text-primary underline"
      >
        Exit
      </button>
    </div>
  );
}
