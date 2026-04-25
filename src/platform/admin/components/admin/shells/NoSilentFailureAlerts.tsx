// ═══════════════════════════════════════════════════════════════
// SITA OS — No-Silent-Failure Alerts (Phase 20.D — LIVE)
// Subscribes to public.alerts for active high/critical issues with
// known root cause or active self-healing. Replaces static ALERTS.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, X, Wrench, Undo2, Search,
  Cloud, HardDrive, Brain, Lock,
  Server, Database, Zap, Loader2, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";

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

const SUBSYSTEM_ICONS: Record<string, React.ElementType> = {
  sync: Cloud,
  storage: HardDrive,
  ai: Brain,
  auth: Lock,
  db: Database,
  edge: Zap,
  connector: Activity,
};

function pickIcon(subsystem: string | null): React.ElementType {
  if (!subsystem) return Server;
  const key = Object.keys(SUBSYSTEM_ICONS).find((k) => subsystem.toLowerCase().includes(k));
  return key ? SUBSYSTEM_ICONS[key] : Server;
}

const SEVERITY_CFG = {
  critical: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", label: "Critical" },
  high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", label: "High" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "Medium" },
};

export function NoSilentFailureAlerts() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: rows = [] } = useQuery({
    queryKey: ["nsfa-live-alerts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("alerts")
        .select("id, subsystem, severity, title, description, metadata, runbook_id")
        .eq("status", "active")
        .in("severity", ["critical", "high", "medium"])
        .order("last_seen_at", { ascending: false })
        .limit(5);
      return (data ?? []) as Array<{
        id: string; subsystem: string; severity: string; title: string;
        description: string; metadata: Record<string, unknown>; runbook_id: string | null;
      }>;
    },
    refetchInterval: 30000,
  });

  const alerts: FailureAlert[] = rows.map((r) => ({
    id: r.id,
    subsystem: r.subsystem,
    icon: pickIcon(r.subsystem),
    severity: (r.severity === "critical" ? "critical" : r.severity === "high" ? "high" : "medium"),
    plainLanguage: r.description || r.title,
    suggestedAction: (r.metadata?.suggested_action as string) ?? "Open runbook",
    autoHealingActive: !!r.metadata?.self_healing_active,
    rollbackAvailable: !!r.metadata?.rollback_available,
    rootCauseKnown: !!r.metadata?.root_cause,
    rootCause: r.metadata?.root_cause as string | undefined,
  }));

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));
  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.map(alert => {
        const cfg = SEVERITY_CFG[alert.severity];
        return (
          <div key={alert.id} className={cn("p-3 rounded-lg border", cfg.bg, cfg.border)}>
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
                aria-label="Dismiss alert"
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
