// ═══════════════════════════════════════════════════════════════
// Admin OS — Launch Truth Indicator
// Shows current launch honesty class for this surface
// ═══════════════════════════════════════════════════════════════

import { Eye } from "lucide-react";

export function LaunchTruthIndicator() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/80">
      <Eye className="h-3 w-3" />
      Launch: Pre-Revenue
    </span>
  );
}
