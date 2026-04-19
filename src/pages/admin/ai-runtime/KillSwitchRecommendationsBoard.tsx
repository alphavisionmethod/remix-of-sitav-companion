// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/kill-switch-recommendations  (AI Workforce Phase 4)
// AI-generated kill-switch recommendations board.
// READ-ONLY surface — actual arming requires the existing kill_switch_approvals
// dual-admin workflow at /admin/health/kill-switches.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Power, RefreshCw, ExternalLink, AlertOctagon, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  switch_id: string;
  source_finding_id: string | null;
  source_agent_id: string;
  severity: string;
  recommended_action: string;
  reason: string;
  evidence: any;
  blast_radius: string;
  urgency: string;
  status: string;
  approval_id: string | null;
  created_at: string;
  decided_at: string | null;
}

const SEV_TONE: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  acknowledged: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  approved_for_arming: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  superseded: "bg-muted text-muted-foreground border-border",
};

export default function KillSwitchRecommendationsBoard() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Recommendation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kill_switch_recommendations" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(`Load failed: ${error.message}`);
    setRecs((data as any[] as Recommendation[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="py-4 flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-orange-400">Recommendation only.</span> AI agents in this phase
            never arm kill switches directly. Recommendations here are evidence packets — actual arming requires
            the existing dual-admin workflow at{" "}
            <a href="/admin/health/kill-switches" className="text-orange-400 underline">
              /admin/health/kill-switches
            </a>
            . L3 hard autonomy ceiling preserved.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Power className="h-5 w-5 text-red-400" />
            Kill-Switch Recommendations ({recs.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {recs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No recommendations. Generated only on real threshold breaches.
            </div>
          ) : (
            <div className="space-y-2">
              {recs.map((r) => (
                <Card
                  key={r.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelected(r)}
                >
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <Power className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{r.switch_id}</span>
                        <Badge variant="outline" className={cn("text-[10px]", SEV_TONE[r.severity])}>
                          {r.severity}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[r.status] ?? "")}>
                          {r.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          action: {r.recommended_action}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          blast: {r.blast_radius}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.reason}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        proposer: {r.source_agent_id} · {new Date(r.created_at).toLocaleString()}
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
                <SheetTitle>Kill-switch recommendation: {selected.switch_id}</SheetTitle>
                <SheetDescription>
                  Proposer: {selected.source_agent_id} · Action: {selected.recommended_action}
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
                  <Badge variant="outline">urgency: {selected.urgency}</Badge>
                  <Badge variant="outline">blast: {selected.blast_radius}</Badge>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Reason</div>
                  <p>{selected.reason}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Evidence</div>
                  <pre className="text-[11px] bg-muted/40 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selected.evidence, null, 2)}
                  </pre>
                </div>
                {selected.source_finding_id && (
                  <div className="text-xs">
                    Source finding: <code>{selected.source_finding_id}</code>
                  </div>
                )}
                <div className="border border-orange-500/30 bg-orange-500/5 rounded p-3 text-xs">
                  <div className="font-medium text-orange-400 mb-1">Next step</div>
                  <p className="text-muted-foreground mb-2">
                    To actually arm this switch, an admin must initiate the dual-approval flow.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/admin/health/kill-switches" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      Open kill-switch console
                    </a>
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Created: {new Date(selected.created_at).toLocaleString()}
                  {selected.decided_at && <> · Decided: {new Date(selected.decided_at).toLocaleString()}</>}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
