// ═══════════════════════════════════════════════════════════════
// SITA OS — ConfidenceRiskMeter
// Unified visual: confidence % + risk level with color bands
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfidenceRiskMeterProps {
  confidence: number; // 0–1
  riskLevel?: "low" | "medium" | "high" | "critical";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getConfidenceBand(c: number) {
  if (c >= 0.8) return { color: "text-emerald-400", bg: "bg-emerald-400/20", label: "High confidence" };
  if (c >= 0.6) return { color: "text-amber-400", bg: "bg-amber-400/20", label: "Moderate confidence" };
  return { color: "text-red-400", bg: "bg-red-400/20", label: "Low confidence" };
}

function getRiskStyle(level: string) {
  switch (level) {
    case "low": return { color: "text-emerald-400", icon: CheckCircle2, label: "Low risk" };
    case "medium": return { color: "text-amber-400", icon: AlertTriangle, label: "Medium risk" };
    case "high": return { color: "text-red-400", icon: AlertTriangle, label: "High risk" };
    case "critical": return { color: "text-red-500", icon: Shield, label: "Critical risk" };
    default: return { color: "text-muted-foreground", icon: Shield, label: "Unknown" };
  }
}

export function ConfidenceRiskMeter({
  confidence,
  riskLevel = "low",
  size = "md",
  showLabel = true,
  className,
}: ConfidenceRiskMeterProps) {
  const band = getConfidenceBand(confidence);
  const risk = getRiskStyle(riskLevel);
  const RiskIcon = risk.icon;
  const pct = Math.round(confidence * 100);

  const sizeClasses = {
    sm: "h-1.5 text-[10px]",
    md: "h-2 text-xs",
    lg: "h-3 text-sm",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn("font-medium", band.color, sizeClasses[size].split(" ")[1])}>
            {pct}% — {band.label}
          </span>
          <span className={cn("flex items-center gap-1", risk.color, sizeClasses[size].split(" ")[1])}>
            <RiskIcon className="h-3 w-3" />
            {risk.label}
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted/30 overflow-hidden", sizeClasses[size].split(" ")[0])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700", band.bg, band.color.replace("text-", "bg-"))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}