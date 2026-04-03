// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Ribbon
// Persistent trust-state ribbon for admin surfaces
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useTrustSummary, useMissionControlSummary } from "@/hooks/use-mission-control-views";

export function TrustRibbon() {
  const trust = useTrustSummary();
  const summary = useMissionControlSummary();

  const postureConfig: Record<string, { icon: React.ElementType; text: string; bg: string; fg: string }> = {
    verified: { icon: CheckCircle, text: "Trust Verified", bg: "bg-trust-verified/5 border-trust-verified/20", fg: "text-trust-safe" },
    review: { icon: AlertTriangle, text: "Trust Under Review", bg: "bg-accent/5 border-accent/20", fg: "text-accent" },
    degraded: { icon: AlertTriangle, text: "Trust Degraded", bg: "bg-accent/5 border-accent/20", fg: "text-accent" },
    compromised: { icon: XCircle, text: "Trust Compromised", bg: "bg-destructive/5 border-destructive/20", fg: "text-destructive" },
  };

  const config = postureConfig[trust.posture] || postureConfig.verified;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-2.5", config.bg)}>
      <Icon className={cn("h-4 w-4 shrink-0", config.fg)} />
      <div className="flex items-center gap-4 text-[11px]">
        <span className={cn("font-semibold", config.fg)}>{config.text}</span>
        <span className="text-muted-foreground">Score: {summary.systemScore}</span>
        <span className="text-muted-foreground">Policy: {trust.policyConfidence}%</span>
        <span className="text-muted-foreground">Proof: {trust.proofCompleteness}%</span>
        {summary.safeModeActive && (
          <span className="font-semibold text-accent">⚠ Safe Mode Active</span>
        )}
      </div>
    </div>
  );
}
