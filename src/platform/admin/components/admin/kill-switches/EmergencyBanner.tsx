// ═══════════════════════════════════════════════════════════════
// SITA OS — Emergency Banner
// Shows when any kill switch is active. Lives at the top of the
// admin shell so operators always see active emergency state.
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { loadKillSwitchRows } from "@/lib/control-plane/kill-switch-db-client";

export function EmergencyBanner() {
  const { data: rows = [] } = useQuery({
    queryKey: ["kill-switches-emergency"],
    queryFn: () => loadKillSwitchRows(),
    refetchInterval: 15_000,
  });

  const active = rows.filter((r) => r.enabled);
  if (active.length === 0) return null;
  const severeCount = active.filter((r) => r.severity === "severe" || r.severity === "significant").length;

  return (
    <Link
      to="/admin/automation/kill-switches"
      className="block bg-destructive/10 border-b-2 border-destructive px-4 py-2 hover:bg-destructive/15 transition-colors"
    >
      <div className="flex items-center gap-2 text-xs">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 animate-pulse" />
        <span className="font-semibold text-destructive">
          {active.length} kill switch{active.length !== 1 ? "es" : ""} active
        </span>
        {severeCount > 0 && (
          <span className="text-destructive">
            ({severeCount} severe)
          </span>
        )}
        <span className="text-muted-foreground">
          — {active.slice(0, 3).map((r) => r.switch_id ?? r.scope_id ?? r.scope).join(", ")}
          {active.length > 3 ? "…" : ""}
        </span>
        <span className="ml-auto text-destructive underline-offset-2 underline">
          Open Safety Center →
        </span>
      </div>
    </Link>
  );
}
