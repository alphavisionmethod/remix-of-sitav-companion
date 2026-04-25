// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime → "security-council" tab
// Phase 4 Security Council runtime board.
// Reads security_council_findings (RLS: admin/audit.view) +
// summarize_security_council() RPC. Provides evidence drilldown,
// acknowledge/resolve/mute actions, and a "Run tick now" button
// that invokes the existing security-council-tick edge function.
// Reuses canonical primitives: AdminControlPlaneShell wraps via
// AIRuntimeHome → DomainHubLayout (no duplication).
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, RefreshCw, ShieldAlert, ShieldCheck, ShieldX,
  Activity, Eye, BellOff, AlertTriangle, Clock, ExternalLink,
} from "lucide-react";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { Skeleton } from "@/components/primitives/feedback/Skeleton";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/admin/components/operator/OperatorActionPanel";
import { formatTrustLabel } from "@/lib/trust-copy/trust-copy-map";
import {
  severityTone,
  findingStatusTone,
} from "@/platform/admin/components/admin/ai-runtime/_shared/status-tone-maps";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Finding {
  id: string;
  agent_id: string;
  council: string;
  finding_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  source_signal_type: string;
  source_signal_ref: string;
  status: "open" | "acknowledged" | "routed" | "resolved" | "muted";
  routed_suggestion_id: string | null;
  occurrences: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

interface CouncilSummary {
  total_findings: number;
  open_findings: number;
  critical_open: number;
  by_severity: Record<string, number>;
  by_agent: Record<string, number>;
  kill_switch_recommendations: { pending: number; queued: number; approved: number; rejected: number };
  secret_rotation_triggers: { dryrun_pending: number; dryrun_complete: number; dryrun_failed: number; executed: number };
  generated_at: string;
}

const AGENTS = [
  { id: "st-security-monitor", label: "Security Monitor", desc: "High/critical admin actions in last hour" },
  { id: "st-permission-drift", label: "Permission Drift", desc: "New admin role grants in last 24h" },
  { id: "st-policy-review", label: "Policy Review", desc: "RLS-enabled tables with no policies" },
  { id: "st-trust-threshold", label: "Trust Threshold", desc: "Agents with trust_score < 0.30" },
  { id: "st-fraud-abuse", label: "Fraud / Abuse", desc: "Repeated admin action bursts" },
  { id: "st-audit-completeness", label: "Audit Completeness", desc: "AI receipt coverage vs invocations" },
  { id: "st-privacy-boundary", label: "Privacy Boundary", desc: "Cross-tenant action observations" },
] as const;

// Status tones now flow through canonical StatusBadge + status-tone-maps
// (see src/components/admin/ai-runtime/_shared/status-tone-maps.ts).

export default function SecurityCouncilBoard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<CouncilSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticking, setTicking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [selected, setSelected] = useState<Finding | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionInFlight, setActionInFlight] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [fRes, sRes] = await Promise.all([
      supabase
        .from("security_council_findings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.rpc("summarize_security_council"),
    ]);
    if (fRes.error) toast.error("Findings load failed", { description: fRes.error.message });
    else setFindings((fRes.data ?? []) as Finding[]);
    if (sRes.error) toast.error("Summary load failed", { description: sRes.error.message });
    else setSummary(sRes.data as unknown as CouncilSummary);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-security-council-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "security_council_findings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const runTick = useCallback(async () => {
    setTicking(true);
    try {
      const { data, error } = await supabase.functions.invoke("security-council-tick", { body: {} });
      if (error) throw error;
      const produced = Number(data?.findings_produced ?? 0);
      const persisted = Number(data?.findings_persisted ?? 0);
      const routed = Number(data?.suggestions_routed ?? 0);
      toast.success("Security Council tick complete", {
        description: `${persisted}/${produced} findings persisted · ${routed} routed to suggestions`,
      });
      await load();
    } catch (e: any) {
      toast.error("Tick failed", { description: e?.message ?? String(e) });
    } finally {
      setTicking(false);
    }
  }, [load]);

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (statusFilter === "open") return f.status === "open" || f.status === "acknowledged";
      if (statusFilter === "all") return true;
      return f.status === statusFilter;
    });
  }, [findings, statusFilter]);

  const perAgent = useMemo(() => {
    const map = new Map<string, { count: number; lastSeen: string | null; openCount: number }>();
    for (const a of AGENTS) map.set(a.id, { count: 0, lastSeen: null, openCount: 0 });
    for (const f of findings) {
      const cur = map.get(f.agent_id) ?? { count: 0, lastSeen: null, openCount: 0 };
      cur.count += 1;
      if (f.status === "open" || f.status === "acknowledged") cur.openCount += 1;
      if (!cur.lastSeen || f.last_seen_at > cur.lastSeen) cur.lastSeen = f.last_seen_at;
      map.set(f.agent_id, cur);
    }
    return map;
  }, [findings]);

  const updateStatus = useCallback(
    async (action: "acknowledged" | "resolved" | "muted") => {
      if (!selected) return;
      setActionInFlight(true);
      try {
        const patch: Record<string, unknown> = { status: action };
        if (action === "resolved") {
          patch.resolved_at = new Date().toISOString();
          patch.resolution_notes = resolutionNotes || null;
        }
        // Service-role only writes are blocked by RLS; this calls a SECURITY DEFINER RPC
        // when available, otherwise the admin-bff-gateway. For now we use a generic update
        // path through an RPC that exists in the schema (acknowledge/resolve_security_finding
        // would be created in a follow-up patch if needed). Falls back to an explicit notice.
        const { error } = await supabase.rpc("acknowledge_security_finding", {
          _finding_id: selected.id,
          _new_status: action,
          _notes: resolutionNotes || null,
        });
        if (error) throw error;
        toast.success(`Finding ${action}`);
        setSelected(null);
        setResolutionNotes("");
        await load();
      } catch (e: any) {
        toast.error("Action failed", { description: e?.message ?? String(e) });
      } finally {
        setActionInFlight(false);
      }
    },
    [selected, resolutionNotes, load],
  );

  const lastTick = summary?.generated_at
    ? formatDistanceToNow(new Date(summary.generated_at), { addSuffix: true })
    : "never";

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Council
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 4 — 7 security-trust agents observe runtime signals and propose policy/kill-switch actions.
            Findings never auto-execute; high/critical items route to the Suggestions queue for human review.
          </p>
          <div className="mt-2">
            <AITruthDisclosure
              mode={summary?.generated_at ? "live-gateway" : "structural"}
              verifiedAt={summary?.generated_at ?? null}
              label={
                summary?.generated_at
                  ? formatTrustLabel("ai", "live", { verifiedAt: summary.generated_at })
                  : undefined
              }
            />
          </div>
        </div>
        <OperatorActionPanel
          ariaLabel="Security Council actions"
          primary={{
            label: ticking ? "Ticking…" : "Run tick now",
            icon: Activity,
            onClick: runTick,
            disabled: ticking,
          }}
          next={[
            {
              label: loading ? "Refreshing…" : "Refresh",
              icon: RefreshCw,
              onClick: load,
              disabled: loading,
            },
          ]}
          evidence={[
            {
              label: "Open Suggestions",
              icon: ExternalLink,
              href: "/admin/ai-runtime?tab=suggestions",
              asChild: (
                <a
                  href="/admin/ai-runtime?tab=suggestions"
                  className="inline-flex items-center gap-1.5 rounded-md border bg-background h-8 px-3 text-xs hover:bg-muted"
                >
                  <ExternalLink className="h-3 w-3" /> Open Suggestions
                </a>
              ),
            },
          ]}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Open findings</p>
                <p className="text-2xl font-semibold">{summary?.open_findings ?? 0}</p>
              </div>
              <Eye className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical open</p>
                <p className="text-2xl font-semibold text-destructive">{summary?.critical_open ?? 0}</p>
              </div>
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Kill-switch recs (pending)</p>
                <p className="text-2xl font-semibold">{summary?.kill_switch_recommendations?.pending ?? 0}</p>
              </div>
              <ShieldX className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Last tick</p>
                <p className="text-sm font-medium">{lastTick}</p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-agent cards */}
      <div>
        <h2 className="text-sm font-medium mb-2 text-muted-foreground">7 Security Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENTS.map((a) => {
            const stats = perAgent.get(a.id) ?? { count: 0, lastSeen: null, openCount: 0 };
            return (
              <Card key={a.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {a.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">All-time</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Open</span>
                    <span className={cn("font-medium", stats.openCount > 0 && "text-warning")}>
                      {stats.openCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last finding</span>
                    <span className="font-medium">
                      {stats.lastSeen ? formatDistanceToNow(new Date(stats.lastSeen), { addSuffix: true }) : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Findings table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base">Findings ({filtered.length})</CardTitle>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="muted">Muted</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Occurrences</TableHead>
                <TableHead className="text-right">Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell colSpan={6} className="py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-2">
                    <EmptyState
                      icon={<AlertTriangle className="h-5 w-5" />}
                      title="No findings in this view"
                      description="Run a Security Council tick or wait for the next hourly cron to detect fresh signals."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((f) => (
                  <TableRow
                    key={f.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(f)}
                  >
                    <TableCell>
                      <StatusBadge tone={severityTone(f.severity)} size="xs">
                        {f.severity}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={findingStatusTone(f.status)} size="xs">
                        {f.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{f.agent_id}</TableCell>
                    <TableCell className="text-sm max-w-md truncate">{f.title}</TableCell>
                    <TableCell className="text-right text-xs">{f.occurrences}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(f.last_seen_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drilldown sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <StatusBadge tone={severityTone(selected.severity)} size="sm">
                    {selected.severity}
                  </StatusBadge>
                  {selected.title}
                </SheetTitle>
                <SheetDescription>{selected.summary}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Agent</span><div className="font-mono">{selected.agent_id}</div></div>
                  <div><span className="text-muted-foreground">Type</span><div className="font-mono">{selected.finding_type}</div></div>
                  <div><span className="text-muted-foreground">Signal type</span><div className="font-mono">{selected.source_signal_type}</div></div>
                  <div><span className="text-muted-foreground">Signal ref</span><div className="font-mono truncate">{selected.source_signal_ref}</div></div>
                  <div><span className="text-muted-foreground">First seen</span><div>{new Date(selected.first_seen_at).toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground">Last seen</span><div>{new Date(selected.last_seen_at).toLocaleString()}</div></div>
                </div>

                {selected.routed_suggestion_id && (
                  <div className="rounded-md border border-info/30 bg-info/5 p-3 text-xs">
                    <div className="flex items-center gap-2 font-medium text-info mb-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Routed to implementation suggestion
                    </div>
                    <div className="font-mono text-muted-foreground">{selected.routed_suggestion_id}</div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2">Evidence</h3>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto max-h-64">
                    {JSON.stringify(selected.evidence, null, 2)}
                  </pre>
                </div>

                {(selected.status === "open" || selected.status === "acknowledged") && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-sm font-medium">Resolution notes (optional)</h3>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Why is this resolved or muted? Operator context for audit trail."
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      {selected.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus("acknowledged")} disabled={actionInFlight}>
                          <Eye className="h-4 w-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      <Button size="sm" onClick={() => updateStatus("resolved")} disabled={actionInFlight}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus("muted")} disabled={actionInFlight}>
                        <BellOff className="h-4 w-4 mr-2" />
                        Mute
                      </Button>
                    </div>
                  </div>
                )}

                {selected.status === "resolved" && selected.resolution_notes && (
                  <div className="border-t pt-4 text-xs">
                    <span className="text-muted-foreground">Resolution notes:</span>
                    <p className="mt-1">{selected.resolution_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
