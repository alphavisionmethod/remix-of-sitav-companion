// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Degraded Mode Banner
// User-facing incident banner with graceful messaging
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X, RefreshCw, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentInfo {
  active: boolean;
  severity: "degraded" | "partial" | "major";
  message: string;
  affectedServices: string[];
  startedAt: string;
  estimatedResolution?: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  degraded: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    icon: "text-amber-400",
  },
  partial: {
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    icon: "text-orange-400",
  },
  major: {
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    icon: "text-destructive",
  },
};

export function PlatformDegradedBanner() {
  const [incident, setIncident] = useState<IncidentInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check for active maintenance/incident flags
    supabase
      .from("cloud_compliance_hooks" as never)
      .select("*" as never)
      .eq("hook_type" as never, "maintenance_mode" as never)
      .eq("status" as never, "active" as never)
      .limit(1)
      .then(({ data }) => {
        const hooks = (data ?? []) as Array<Record<string, unknown>>;
        if (hooks.length > 0) {
          const h = hooks[0];
          const meta = (h.metadata ?? {}) as Record<string, unknown>;
          setIncident({
            active: true,
            severity: (meta.severity as "degraded" | "partial" | "major") ?? "degraded",
            message: (meta.message as string) ?? "Some services are temporarily delayed",
            affectedServices: (meta.affected_services as string[]) ?? [],
            startedAt: h.activated_at as string ?? new Date().toISOString(),
            estimatedResolution: meta.eta as string,
          });
        }
      });
  }, []);

  if (!incident?.active || dismissed) return null;

  const style = SEVERITY_STYLES[incident.severity] ?? SEVERITY_STYLES.degraded;

  return (
    <div className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border", style.bg, style.border)}>
      <AlertTriangle className={cn("h-4 w-4 shrink-0", style.icon)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{incident.message}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {incident.affectedServices.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              Affected: {incident.affectedServices.join(", ")}
            </span>
          )}
          {incident.estimatedResolution && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              ETA: {incident.estimatedResolution}
            </span>
          )}
        </div>
      </div>
      <Badge className={cn("text-[9px] shrink-0", style.icon)} variant="outline">
        {incident.severity}
      </Badge>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setDismissed(true)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
