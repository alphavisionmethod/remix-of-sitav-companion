// ═══════════════════════════════════════════════════════════════
// Admin OS — Diagnostics Context Bar
// Shows route classification, surface class, and mode metadata
// ═══════════════════════════════════════════════════════════════

import { useLocation } from "react-router-dom";
import { classifyRoute } from "@/lib/dual-reality/surface-class-registry";
import { useRealityModeSafe } from "@/lib/dual-reality";
import { Badge } from "@/components/ui/badge";

export function DiagnosticsContextBar() {
  const location = useLocation();
  const { mode, resolution } = useRealityModeSafe();
  const classification = classifyRoute(location.pathname);

  return (
    <div className="border-b border-border/30 bg-muted/20 px-4 py-1 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
      <span>Route: <code className="text-foreground/70">{location.pathname}</code></span>
      <Badge variant="outline" className="text-[9px] py-0 px-1.5">
        {classification.surfaceClass}
      </Badge>
      <span>Posture: {classification.posture}</span>
      <span>Mode: {mode}</span>
      <span>Source: {resolution.source}</span>
      {resolution.scenarioKey && <span>Scenario: {resolution.scenarioKey}</span>}
    </div>
  );
}
