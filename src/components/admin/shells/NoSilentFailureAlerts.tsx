import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, X, ChevronRight, Wrench, Undo2, Search,
  Activity, Shield, Cloud, HardDrive, Brain, Rocket, Lock,
  Smartphone, Bell, Loader2
} from "lucide-react";

interface FailureAlert {
  id: string;
  subsystem: string;
  icon: React.ElementType;
  severity: "critical" | "high" | "medium";
  plainLanguage: string;
  suggestedAction: string;
  autoHealingActive: boolean;
  rollbackAvailable: boolean;
  rootCauseKnown: boolean;
  rootCause?: string;
}

const DEMO_ALERTS: FailureAlert[] = [
  {
    id: "nsf1",
    subsystem: "Sync Service",
    icon: Cloud,
    severity: "medium",
    plainLanguage: "Upload completion times are 38% slower than normal. Users may notice file sync delays.",
    suggestedAction: "Apply retry optimization patch (Safe — rollback available)",
    autoHealingActive: true,
    rollbackAvailable: true,
    rootCauseKnown: true,
    rootCause: "Metadata query regression in upload finalization after v2.14.0-rc3",
  },
];

const SEVERITY_CFG = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "Critical" },
  high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", label: "High" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "Medium" },
};

export function NoSilentFailureAlerts() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = DEMO_ALERTS.filter(a => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.map(alert => {
        const cfg = SEVERITY_CFG[alert.severity];
        return (
          <div
            key={alert.id}
            className={cn("p-3 rounded-lg border", cfg.bg, cfg.border)}
          >
            <div className="flex items-start gap-3">
              <alert.icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.text)} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{alert.subsystem}</span>
                  <Badge variant="outline" className={cn("text-[9px] h-4", cfg.text, cfg.border)}>
                    {cfg.label}
                  </Badge>
                  {alert.autoHealingActive && (
                    <Badge variant="outline" className="text-[9px] h-4 text-blue-400 border-blue-500/20 gap-0.5">
                      <Loader2 className="h-2 w-2 animate-spin" /> Self-healing
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-foreground leading-relaxed">{alert.plainLanguage}</p>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">Suggested:</span>
                  <span className="text-foreground">{alert.suggestedAction}</span>
                </div>

                {alert.rootCauseKnown && alert.rootCause && (
                  <div className="flex items-center gap-2 text-[10px]">
                    <Search className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Root cause:</span>
                    <span className="text-foreground/80">{alert.rootCause}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-6 text-[10px] px-2 gap-1">
                    <Wrench className="h-2.5 w-2.5" /> Apply Fix
                  </Button>
                  {alert.rollbackAvailable && (
                    <Badge variant="outline" className="text-[9px] h-4 text-emerald-400 border-emerald-500/20 gap-0.5">
                      <Undo2 className="h-2 w-2" /> Rollback ready
                    </Badge>
                  )}
                </div>
              </div>

              <button
                onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                className="p-1 hover:bg-muted/40 rounded shrink-0"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
