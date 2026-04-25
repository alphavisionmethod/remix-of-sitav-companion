// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Governance Banner
// Persistent, honest banner when operating in demo mode
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DemoGovernanceBanner() {
  const { isDemoMode } = useDataMode();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-amber-500/8 border-b border-amber-500/15 px-4 py-1.5">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Demo Mode — All data is simulated. No real connections, analytics, or side-effects are active.</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 text-amber-500/60 hover:text-amber-500 transition-colors shrink-0"
          aria-label="Dismiss demo banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
