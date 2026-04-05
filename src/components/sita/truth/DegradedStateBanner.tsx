import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DegradedStateBannerProps {
  severity: "info" | "warning" | "critical";
  reason: string;
  impact?: string;
  affectedCapabilities?: string[];
  dismissible?: boolean;
  className?: string;
}

const severityConfig = {
  info: { icon: Info, bg: "bg-blue-500/5 border-blue-500/20", text: "text-blue-400", label: "Notice" },
  warning: { icon: AlertTriangle, bg: "bg-amber-500/5 border-amber-500/20", text: "text-amber-400", label: "Degraded" },
  critical: { icon: AlertCircle, bg: "bg-red-500/5 border-red-500/20", text: "text-red-400", label: "Critical" },
};

export function DegradedStateBanner({ severity, reason, impact, affectedCapabilities, dismissible = true, className }: DegradedStateBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", config.bg, className)}>
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.text)} />
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold uppercase", config.text)}>{config.label}</span>
        </div>
        <p className="text-xs text-foreground">{reason}</p>
        {impact && <p className="text-[10px] text-muted-foreground">Impact: {impact}</p>}
        {affectedCapabilities && affectedCapabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {affectedCapabilities.map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-muted/30 rounded text-muted-foreground">{c}</span>
            ))}
          </div>
        )}
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
