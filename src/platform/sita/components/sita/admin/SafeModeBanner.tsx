// ═══════════════════════════════════════════════════════════════
// SITA OS — Safe Mode Banner
// Shown when global safe mode is active
// ═══════════════════════════════════════════════════════════════

import { Shield } from "lucide-react";
import { useMissionControlSummary } from "@/platform/mission-control/hooks/use-mission-control-views";

export function SafeModeBanner() {
  const summary = useMissionControlSummary();
  if (!summary.safeModeActive) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/8 px-4 py-3">
      <Shield className="h-5 w-5 text-accent shrink-0" />
      <div>
        <p className="text-xs font-semibold text-accent">Safe Mode Active</p>
        <p className="text-[10px] text-muted-foreground">
          High-risk automations are paused. Only verified, low-risk workflows are executing.
        </p>
      </div>
    </div>
  );
}
