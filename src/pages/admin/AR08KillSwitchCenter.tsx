import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertTriangle, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import ARSubNav from "@/platform/admin/components/admin/ARSubNav";
import { KILL_SWITCH_REGISTRY } from "@/lib/control-plane/kill-switch-registry";
import { loadKillSwitchRows, type KillSwitchRow } from "@/lib/control-plane/kill-switch-db-client";
import { KillSwitchToggleDialog } from "@/platform/admin/components/admin/kill-switches/KillSwitchToggleDialog";
import { KillSwitchAuditPanel } from "@/platform/admin/components/admin/kill-switches/KillSwitchAuditPanel";

const SEVERITY_COLOR: Record<string, string> = {
  severe: "border-destructive/40 bg-destructive/5 text-destructive",
  significant: "border-amber-500/40 bg-amber-500/5 text-amber-500",
  moderate: "border-border bg-secondary/20 text-foreground",
  minimal: "border-border bg-secondary/10 text-muted-foreground",
};

export default function AR08KillSwitchCenter() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const focusSwitch = searchParams.get("focus");
  const [dialogState, setDialogState] = useState<{ switchId: string; intent: "activate" | "deactivate" } | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(focusSwitch);

  const { data: rows = [] } = useQuery<KillSwitchRow[]>({
    queryKey: ["kill-switches-state"],
    queryFn: () => loadKillSwitchRows(true),
    refetchInterval: 15_000,
  });

  const stateBySwitch = useMemo(() => {
    const map: Record<string, KillSwitchRow> = {};
    for (const r of rows) {
      const id = r.switch_id ?? r.scope_id;
      if (id && (r.enabled || !map[id])) map[id] = r;
    }
    return map;
  }, [rows]);

  const activeCount = rows.filter((r) => r.enabled).length;
  const dialogEntry = dialogState ? KILL_SWITCH_REGISTRY.find((e) => e.switchId === dialogState.switchId) : null;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <ARSubNav />
      <SitaPageHeader
        title="Kill Switch & Safety Center"
        subtitle="Operate emergency stops with mandatory reason, optional TTL, full audit, and runbook links"
      />

      {activeCount > 0 && (
        <SitaCard className="border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-destructive">
                {activeCount} kill switch{activeCount !== 1 ? "es" : ""} currently active
              </div>
              <div className="text-[11px] text-muted-foreground">
                Runtime enforcement applies within 30 seconds across all subsystems.
              </div>
            </div>
          </div>
        </SitaCard>
      )}

      <div className="grid gap-3">
        {KILL_SWITCH_REGISTRY.map((entry) => {
          const row = stateBySwitch[entry.switchId];
          const active = !!row?.enabled;
          const focused = focusSwitch === entry.switchId;
          return (
            <SitaCard
              key={entry.switchId}
              className={`${active ? SEVERITY_COLOR[entry.impactLevel] ?? SEVERITY_COLOR.moderate : ""} ${focused ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-destructive/10" : "bg-secondary/30"}`}>
                  <Shield className={`h-5 w-5 ${active ? "text-destructive" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{entry.displayName}</p>
                    <Badge variant="outline" className="text-[9px]">{entry.switchId}</Badge>
                    <Badge variant="outline" className="text-[9px]">{entry.impactLevel}</Badge>
                    {entry.requiresDualApproval && (
                      <Badge variant="outline" className="text-[9px] border-destructive/40 text-destructive">dual-approval</Badge>
                    )}
                    {active && <Badge variant="destructive" className="text-[9px] animate-pulse">ACTIVE</Badge>}
                    {row?.expires_at && active && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> expires {new Date(row.expires_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{entry.description}</p>
                  {active && row?.reason && (
                    <p className="text-[11px] text-destructive mt-1">Reason: {row.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.runbookRef && (
                    <Button asChild variant="ghost" size="sm" className="h-7 text-[10px]">
                      <Link to={`/admin/support/runbooks/${entry.runbookRef}`}>
                        <BookOpen className="h-3 w-3 mr-1" /> {entry.runbookRef}
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => setExpandedAudit((cur) => (cur === entry.switchId ? null : entry.switchId))}
                  >
                    Audit <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${expandedAudit === entry.switchId ? "rotate-90" : ""}`} />
                  </Button>
                  <Switch
                    checked={active}
                    onCheckedChange={(checked) =>
                      setDialogState({ switchId: entry.switchId, intent: checked ? "activate" : "deactivate" })
                    }
                  />
                </div>
              </div>
              {expandedAudit === entry.switchId && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <KillSwitchAuditPanel switchId={entry.switchId} />
                </div>
              )}
            </SitaCard>
          );
        })}
      </div>

      {dialogEntry && dialogState && (
        <KillSwitchToggleDialog
          entry={dialogEntry}
          currentRow={stateBySwitch[dialogState.switchId] ?? null}
          open={!!dialogState}
          intent={dialogState.intent}
          onClose={() => setDialogState(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["kill-switches-state"] })}
        />
      )}
    </div>
  );
}
