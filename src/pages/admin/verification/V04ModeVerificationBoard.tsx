// ═══════════════════════════════════════════════════════
// SITA OS — V04: Mode Verification Board
// Real/demo/internal/degraded coverage by capability
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";
import { useVerificationSurfaces } from "@/lib/verification/verification-hooks";
import { Layers } from "lucide-react";

const modes = ["real", "demo", "degraded", "unavailable"];

export default function ModeVerificationBoard() {
  const { data: dbSurfaces } = useVerificationSurfaces();

  // Group by domain → mode coverage
  const domains = [...new Set(SURFACE_REGISTRY.map((s) => s.domain))];
  const domainModes = domains.map((d) => {
    const domainSurfaces = SURFACE_REGISTRY.filter((s) => s.domain === d);
    const modeSupport = modes.map((m) => ({
      mode: m,
      count: domainSurfaces.filter((s) => s.supportedModes.includes(m)).length,
      total: domainSurfaces.length,
    }));
    return { domain: d, total: domainSurfaces.length, modeSupport };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 p-6" data-testid="verification-mode-board">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          V04 — Mode Verification Board
        </h1>
        <p className="text-muted-foreground mt-1">Coverage by mode: real, demo, degraded, unavailable</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Header */}
        <div className="grid grid-cols-6 gap-2 px-4 text-xs font-semibold text-muted-foreground">
          <div>Domain</div>
          <div className="text-center">Total</div>
          {modes.map((m) => <div key={m} className="text-center capitalize">{m}</div>)}
        </div>

        {domainModes.map((d) => (
          <Card key={d.domain}>
            <CardContent className="p-3 grid grid-cols-6 gap-2 items-center">
              <div className="font-mono text-sm">{d.domain}</div>
              <div className="text-center text-sm font-bold">{d.total}</div>
              {d.modeSupport.map((ms) => (
                <div key={ms.mode} className="text-center">
                  <Badge variant={ms.count > 0 ? "default" : "secondary"} className={ms.count === ms.total && ms.count > 0 ? "bg-green-500/20 text-green-400" : ""}>
                    {ms.count}/{ms.total}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
