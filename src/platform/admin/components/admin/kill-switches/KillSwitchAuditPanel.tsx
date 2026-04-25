// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Audit Panel
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { loadAuditLog } from "@/lib/control-plane/kill-switch-db-client";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Activity } from "lucide-react";

const ACTION_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  activated: "destructive",
  deactivated: "secondary",
  expired: "outline",
  approved: "default",
  rejected: "secondary",
  updated: "outline",
};

export function KillSwitchAuditPanel({ switchId }: { switchId: string }) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["kill-switch-audit", switchId],
    queryFn: () => loadAuditLog(switchId, 50),
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading audit history…</div>;
  if (rows.length === 0) {
    return <div className="text-xs text-muted-foreground italic">No audit events yet.</div>;
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-md border border-border/50 p-2 text-[11px] space-y-1 bg-card/40">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={ACTION_VARIANT[row.action] ?? "outline"} className="text-[9px]">
              {row.action.toUpperCase()}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {new Date(row.created_at).toLocaleString()}
            </span>
            {row.actor_user_id && (
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> {row.actor_user_id.slice(0, 8)}
              </span>
            )}
          </div>
          {row.reason && <div className="text-foreground">{row.reason}</div>}
          {row.runbook_id && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Runbook: {row.runbook_id}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
