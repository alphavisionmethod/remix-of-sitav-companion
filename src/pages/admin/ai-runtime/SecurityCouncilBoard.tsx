// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/security-council  (AI Workforce Phase 4)
// Security Council findings board — admin AI engineering team only.
// Reads security_council_findings via summarize_security_council RPC + table.
// No direct mutations — all state changes happen through edge functions.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ShieldAlert, RefreshCw, Eye, AlertTriangle, ScanSearch, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Finding {
  id: string;
  agent_id: string;
  finding_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
  evidence: any;
  source_signal_type: string;
  source_signal_ref: string;
  status: string;
  routed_suggestion_id: string | null;
  created_at: string;
}

interface SummaryRow {
  agent_id: string;
  severity: string;
  status: string;
  count: number;
}

const SEVERITY_TONE: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_TONE: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  routed: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  acknowledged: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  superseded: "bg-muted text-muted-foreground border-border",
};

const AGENT_LABELS: Record<string, string> = {
  "st-security-monitor": "Security Monitor",
  "st-permission-drift": "Permission Drift",
  "st-policy-review": "Policy Review",
  "st-trust-threshold": "Trust Threshold",
  "st-fraud-abuse": "Fraud / Abuse",
  "st-audit-completeness": "Audit Completeness",
  "st-privacy-boundary": "Privacy Boundary",
};

export default function SecurityCouncilBoard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Finding | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [tickRunning, setTickRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: rows, error: e1 }, { data: sum, error: e2 }] = await Promise.all([
      supabase
        .from("security_council_findings" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.rpc("summarize_security_council" as any, { _hours: 168 }),
    ]);
    if (e1) toast.error(`Findings load failed: ${e1.message}`);
    if (e2) toast.error(`Summary load failed: ${e2.message}`);
    setFindings((rows as any[] as Finding[]) ?? []);
    setSummary(((sum as any[]) ?? []) as SummaryRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runTick = useCallback(async () => {
    setTickRunning(true);
    const { data, error } = await supabase.functions.invoke("security-council-tick", { body: {} });
    setTickRunning(false);
    if (error) {
      toast.error(`Tick failed: ${error.message}`);
      return;
    }
    toast.success(
      `Tick: ${(data as any)?.findings_persisted ?? 0} findings · ${(data as any)?.suggestions_routed ?? 0} routed`,
    );
    load();
  }, [load]);

  const filtered = useMemo(
    () => findings.filter((f) => filterAgent === "all" || f.agent_id === filterAgent),
    [findings, filterAgent],
  );

  const totals = useMemo(() => {
    const byAgent = new Map<string, number>();
    const bySeverity = new Map<string, number>();
    for (const r of summary) {
      byAgent.set(r.agent_id, (byAgent.get(r.agent_id) ?? 0) + r.count);
      bySeverity.set(r.severity, (bySeverity.get(r.severity) ?? 0) + r.count);
    }
    return { byAgent, bySeverity };
  }, [summary]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-orange-400" />
              Security Council Findings
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Real scheduled output from 7 security agents. Agents observe only — they propose, never auto-apply.
              Policy gaps route to <code className="text-xs">/admin/ai-runtime/suggestions</code>. Threshold breaches
              route to <code className="text-xs">/admin/ai-runtime/kill-switch-recommendations</code>. Anomalies route
              to <code className="text-xs">/admin/ai-runtime/anomaly-rotations</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={runTick} disabled={tickRunning}>
              <ScanSearch className={cn("h-4 w-4 mr-1.5", tickRunning && "animate-pulse")} />
              {tickRunning ? "Running tick…" : "Run tick now"}
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["critical", "high", "medium", "low"] as const).map((sev) => (
              <div key={sev} className={cn("p-3 rounded-md border", SEVERITY_TONE[sev])}>
                <div className="text-[10px] uppercase tracking-wide opacity-70">{sev} (7d)</div>
                <div className="text-2xl font-semibold">{totals.bySeverity.get(sev) ?? 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={filterAgent} onValueChange={setFilterAgent}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({findings.length})</TabsTrigger>
          {Object.keys(AGENT_LABELS).map((id) => (
            <TabsTrigger key={id} value={id}>
              {AGENT_LABELS[id]} ({totals.byAgent.get(id) ?? 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filterAgent} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No findings in scope. Tick runs hourly via <code>sita-security-council-tick</code>.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((f) => (
                <Card
                  key={f.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelected(f)}
                >
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        f.severity === "critical" && "text-red-400",
                        f.severity === "high" && "text-orange-400",
                        f.severity === "medium" && "text-amber-400",
                        f.severity === "low" && "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{f.title}</span>
                        <Badge variant="outline" className={cn("text-[10px]", SEVERITY_TONE[f.severity])}>
                          {f.severity}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[f.status] ?? "")}>
                          {f.status}
                        </Badge>
                        {f.routed_suggestion_id && (
                          <Badge variant="outline" className="text-[10px] bg-violet-500/15 text-violet-400 border-violet-500/30">
                            routed → suggestion
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{f.summary}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {AGENT_LABELS[f.agent_id] ?? f.agent_id} · {f.finding_type} ·{" "}
                        {new Date(f.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{selected.title}</SheetTitle>
                <SheetDescription>
                  {AGENT_LABELS[selected.agent_id] ?? selected.agent_id} · {selected.finding_type}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={SEVERITY_TONE[selected.severity]}>
                    severity: {selected.severity}
                  </Badge>
                  <Badge variant="outline" className={STATUS_TONE[selected.status] ?? ""}>
                    status: {selected.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Summary</div>
                  <p className="text-sm">{selected.summary}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Source signal</div>
                  <code className="text-xs block bg-muted/40 p-2 rounded">
                    {selected.source_signal_type}: {selected.source_signal_ref}
                  </code>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Evidence</div>
                  <pre className="text-[11px] bg-muted/40 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selected.evidence, null, 2)}
                  </pre>
                </div>
                {selected.routed_suggestion_id && (
                  <div className="text-xs">
                    Routed to suggestion:{" "}
                    <a
                      href="/admin/ai-runtime/suggestions"
                      className="text-violet-400 underline"
                    >
                      {selected.routed_suggestion_id}
                    </a>
                  </div>
                )}
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
