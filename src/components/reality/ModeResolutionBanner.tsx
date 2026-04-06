// ═══════════════════════════════════════════════════════════════
// Shared — Mode Resolution Banner
// Shows resolved mode + launch honesty for diagnostics or info
// ═══════════════════════════════════════════════════════════════

import { useRealityModeSafe } from "@/lib/dual-reality";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useState } from "react";

interface ModeResolutionBannerProps {
  adminDetailToggle?: boolean;
  message?: string;
}

export function ModeResolutionBanner({ adminDetailToggle = false, message }: ModeResolutionBannerProps) {
  const { mode, resolution, definition } = useRealityModeSafe();
  const [showDetail, setShowDetail] = useState(false);

  if (mode === "real" && !message) return null;

  return (
    <div className="bg-muted/40 border border-border/50 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {message || `Currently in ${definition.name} — ${definition.description}`}
          </span>
        </div>
        {adminDetailToggle && (
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-xs text-primary/60 hover:text-primary underline"
          >
            {showDetail ? "Hide" : "Details"}
          </button>
        )}
      </div>
      {showDetail && (
        <div className="mt-2 pl-6 space-y-1 text-xs text-muted-foreground font-mono">
          <div>Mode: {resolution.mode}</div>
          <div>Source: {resolution.source}</div>
          <div>AI Policy: {definition.aiPolicy}</div>
          <div>Analytics: {definition.analyticsMode}</div>
          <div>Side Effects: {definition.sideEffects.externalWritesAllowed ? "allowed" : "blocked"}</div>
          {resolution.scenarioKey && <div>Scenario: {resolution.scenarioKey}</div>}
          <div>Resolved: {new Date(resolution.resolvedAt).toISOString()}</div>
        </div>
      )}
    </div>
  );
}
