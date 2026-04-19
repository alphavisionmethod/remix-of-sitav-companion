// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/anomaly-rotations  (AI Workforce Phase 4)
// Anomaly-driven secret rotation triggers (DRY-RUN ONLY).
// Actual rotation requires the existing dual-admin runbook RB-SECRET-ROTATION.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { KeyRound, RefreshCw, ExternalLink, ShieldOff, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Trigger {
  id: string;
  source_finding_id: string | null;
  source_agent_id: string;
  secret_scope: string;
  provider_key: string | null;
  anomaly_type: string;
  severity: string;
  anomaly_evidence: any;
  orchestrator_dryrun_result: any;
  status: string;
  receipt_id: string | null;
  created_at: string;
}

const SEV_TONE: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_TONE: Record<string, string> = {
  proposed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  dryrun_succeeded: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  dryrun_failed: "bg-red-500/15 text-red-400 border-red-500/30",
  superseded: "bg-muted text-muted-foreground border-border",
};

export default function AnomalyRotationsBoard() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Trigger | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("secret_rotation_triggers" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(`Load failed: ${error.message}`);
    setTriggers((data as any[] as Trigger[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="py-4 flex items-start gap-3">
          <ShieldOff className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-emerald-400">Dry-run only.</span> Anomaly-driven rotation triggers
            invoke <code>secret-rotation-orchestrator</code> with{" "}
            <code className="bg-muted/40 px-1 rounded">dryRun: true</code>. To actually rotate, follow the
            operator runbook{" "}
            <a href="/admin/runbooks" className="text-emerald-400 underline">
              RB-SECRET-ROTATION
            </a>
            .
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-emerald-400" />
            Anomaly-Driven Rotation Triggers ({triggers.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {triggers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No anomaly triggers. Generated only on validated medium+ severity anomalies.
            </div>
          ) : (
            <div className="space-y-2">
              {triggers.map((t) => (
                <Card
                  key={t.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelected(t)}
                >
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <KeyRound className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{t.secret_scope}</span>
                        {t.provider_key && (
                          <Badge variant="outline" className="text-[10px]">
                            {t.provider_key}
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn("text-[10px]", SEV_TONE[t.severity])}>
                          {t.severity}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[t.status] ?? "")}>
                          {t.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {t.anomaly_type} — proposer {t.source_agent_id}
                      </p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(t.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Rotation trigger: {selected.secret_scope}</SheetTitle>
                <SheetDescription>
                  {selected.anomaly_type} · proposer {selected.source_agent_id}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={SEV_TONE[selected.severity]}>
                    severity: {selected.severity}
                  </Badge>
                  <Badge variant="outline" className={STATUS_TONE[selected.status] ?? ""}>
                    {selected.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Anomaly evidence</div>
                  <pre className="text-[11px] bg-muted/40 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selected.anomaly_evidence, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Orchestrator dry-run result
                  </div>
                  <pre className="text-[11px] bg-muted/40 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selected.orchestrator_dryrun_result, null, 2)}
                  </pre>
                </div>
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded p-3 text-xs">
                  <div className="font-medium text-emerald-400 mb-1">Operator next step</div>
                  <p className="text-muted-foreground mb-2">
                    Review the dry-run result, then follow RB-SECRET-ROTATION to perform the live rotation
                    with dual-admin approval.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/admin/runbooks" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      Open runbooks
                    </a>
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Created: {new Date(selected.created_at).toLocaleString()}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
