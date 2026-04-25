// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Nightly Truth Panel (Admin AI Engineer team)
//
// Mounted as a tab in AIRuntimeHome (id: "nightly-truth").
// Reads real data from ai_runtime_nightly_runs / streak / alerts.
// Operator drilldown: 30-day history, per-sub-check status, evidence
// JSON viewer, failure acknowledgment, manual trigger.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { EvidenceLink } from "@/platform/trust/components/EvidenceLink";
import { ProvenanceChip } from "@/components/primitives/status/ProvenanceChip";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { NeedsHistoricalReleasesExplainer } from "@/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer";
import { formatTrustLabel } from "@/lib/trust-copy/trust-copy-map";
import {
  loadNightlyTruthData,
  acknowledgeAlert,
  triggerManualVerification,
  type NightlyTruthData,
  type NightlyRun,
} from "@/lib/internal-agents/runtime/nightly-truth-data";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, PlayCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function classificationTone(c: string): "success" | "warning" | "danger" | "muted" {
  if (c === "green") return "success";
  if (c === "yellow") return "warning";
  if (c === "red") return "danger";
  return "muted";
}

function StreakDots({ runs }: { runs: NightlyRun[] }) {
  const last7 = runs.slice(0, 7).reverse();
  const padded: (NightlyRun | null)[] = [
    ...Array(Math.max(0, 7 - last7.length)).fill(null),
    ...last7,
  ];
  return (
    <div className="flex gap-1.5 items-center">
      {padded.map((r, i) => {
        if (!r) {
          return <div key={i} className="h-3 w-3 rounded-full bg-muted/40" title="no data" />;
        }
        const tone =
          r.status === "pass" ? "bg-success"
          : r.status === "degraded" ? "bg-warning"
          : "bg-destructive";
        return (
          <div
            key={r.run_id}
            className={`h-3 w-3 rounded-full ${tone}`}
            title={`${r.status} — ${new Date(r.started_at).toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

function SubCheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-border/50 last:border-0">
      <span>{label}</span>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
    </div>
  );
}

export default function AIRuntimeNightlyTruthPanel() {
  const [data, setData] = useState<NightlyTruthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedRun, setSelectedRun] = useState<NightlyRun | null>(null);
  const [ackNotes, setAckNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await loadNightlyTruthData();
      setData(d);
      if (!selectedRun && d.recentRuns.length > 0) setSelectedRun(d.recentRuns[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedRun]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleManualTrigger = async () => {
    setTriggering(true);
    try {
      const res = await triggerManualVerification();
      if (res.ok) {
        toast({ title: "Verification triggered", description: `Run ${res.run_id} status: ${res.status}` });
        await reload();
      } else {
        toast({ title: "Trigger failed", description: res.error, variant: "destructive" });
      }
    } finally {
      setTriggering(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    const res = await acknowledgeAlert(alertId, ackNotes[alertId]);
    if (res.ok) {
      toast({ title: "Alert acknowledged" });
      await reload();
    } else {
      toast({ title: "Acknowledge failed", description: res.reason, variant: "destructive" });
    }
  };

  if (loading && !data) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading nightly truth…</p>;
  }
  if (!data) {
    return (
      <NeedsHistoricalReleasesExplainer
        title="No nightly runs recorded yet"
        description="The nightly AI runtime verifier (ai-runtime-nightly-verify) runs at 02:00 UTC. Truth data appears after the first scheduled tick completes."
      />
    );
  }

  const streak = data.streak;

  return (
    <div className="space-y-4">
      {/* ── Header strip ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Nightly AI Runtime Truth</h2>
          <p className="text-xs text-muted-foreground">
            Live-provider verification, receipt persistence, ledger writes, fallback path, and budget enforcement —
            run nightly at 02:00 UTC against the real Sovereign AI Gateway.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AITruthDisclosure
              mode={
                streak?.classification === "green" ? "live-gateway"
                : streak?.classification === "yellow" ? "structural"
                : streak?.classification === "red" ? "degraded"
                : "structural"
              }
              verifiedAt={data.recentRuns[0]?.started_at ?? null}
              to="/admin/ai-runtime"
            />
            <span className="text-[10px] text-muted-foreground">
              {formatTrustLabel(
                "proof",
                streak?.classification === "green" ? "verified"
                : streak?.classification === "red" ? "failed"
                : streak?.classification === "yellow" ? "pending"
                : "needs_evidence",
              )}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Truth artifacts regenerated nightly at 03:00 UTC via GitHub Actions{" "}
            <code className="font-mono">ai-runtime-truth-nightly.yml</code> →{" "}
            <code className="font-mono">generated/ai-runtime-truth-closure/</code>.
            Last DB observation: {data.recentRuns[0]?.started_at ? new Date(data.recentRuns[0].started_at).toLocaleString() : "—"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button size="sm" onClick={handleManualTrigger} disabled={triggering}>
            <PlayCircle className={`h-3.5 w-3.5 mr-1.5 ${triggering ? "animate-pulse" : ""}`} />
            {triggering ? "Triggering…" : "Trigger now"}
          </Button>
        </div>
      </div>

      {/* ── Streak summary ────────────────────────────────── */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wide">Streak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tabular-nums">{streak?.current_streak_days ?? 0}</span>
              <span className="text-xs text-muted-foreground mb-1">clean nights</span>
            </div>
            <StreakDots runs={data.recentRuns} />
            <p className="text-[10px] text-muted-foreground">
              Longest: {streak?.longest_streak_days ?? 0} · Goal: 7
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wide">Classification</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBadge tone={classificationTone(streak?.classification ?? "muted")} dot>
              {(streak?.classification ?? "unknown").toUpperCase()}
            </StatusBadge>
            <p className="text-[10px] text-muted-foreground mt-2">
              {streak?.classification === "green" ? "Behaviorally proven over 7+ nights"
                : streak?.classification === "yellow" ? "Building — 3+ clean nights"
                : streak?.classification === "red" ? "Unacknowledged failure present"
                : "Streak < 3 — building proof"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wide">Last Pass</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{relTime(streak?.last_pass_at ?? null)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {streak?.last_pass_at ? new Date(streak.last_pass_at).toLocaleString() : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wide">Last Fail</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{relTime(streak?.last_fail_at ?? null)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {streak?.last_failure_class ?? "no failures recorded"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Evidence drilldowns (canonical sources) ───────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
            Evidence sources
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <ProvenanceChip
            source="ai_runtime_nightly_runs"
            verifiedAt={data.recentRuns[0]?.started_at ?? null}
          />
          <EvidenceLink
            to="/admin/ai-gateway/receipts"
            label="ai_inference_receipts"
            kind="receipt"
          />
          <EvidenceLink
            to="/admin/ai-gateway/budget"
            label="ai_usage_ledger"
            kind="ledger"
          />
          <EvidenceLink
            to="/admin/ai-runtime/connector-truth"
            label="ai_fallback_events"
            kind="fallback-event"
          />
          <EvidenceLink
            to="/admin/ai-gateway/providers"
            label="provider health"
            kind="integration"
          />
        </CardContent>
      </Card>

      {/* ── Unacknowledged alerts ─────────────────────────── */}
      {data.unackAlerts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Unacknowledged failures ({data.unackAlerts.length})
            </CardTitle>
            <CardDescription>
              These failures reset the streak and must be acknowledged by an admin before the system can return to GREEN.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.unackAlerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{alert.summary}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] h-4">{alert.failure_class}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">{alert.severity}</Badge>
                      <span>· {relTime(alert.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Textarea
                  placeholder="Acknowledgment notes (optional)…"
                  value={ackNotes[alert.id] ?? ""}
                  onChange={(e) => setAckNotes((p) => ({ ...p, [alert.id]: e.target.value }))}
                  className="text-xs min-h-[60px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── 30-day history + drilldown ────────────────────── */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">30-day history ({data.recentRuns.length})</TabsTrigger>
          <TabsTrigger value="drilldown">Run drilldown</TabsTrigger>
          <TabsTrigger value="evidence">Evidence JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-3 py-2">Run ID</th>
                      <th className="text-left px-3 py-2">Started</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-center px-3 py-2">Live</th>
                      <th className="text-center px-3 py-2">Receipt</th>
                      <th className="text-center px-3 py-2">Ledger</th>
                      <th className="text-center px-3 py-2">Fallback</th>
                      <th className="text-center px-3 py-2">Budget</th>
                      <th className="text-right px-3 py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRuns.length === 0 && (
                      <tr><td colSpan={9} className="text-center py-6 text-muted-foreground italic">No runs yet — trigger one.</td></tr>
                    )}
                    {data.recentRuns.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRun(r)}
                        className={`border-t border-border cursor-pointer hover:bg-muted/30 ${selectedRun?.id === r.id ? "bg-muted/40" : ""}`}
                      >
                        <td className="px-3 py-2 font-mono text-[10px] truncate max-w-[160px]">{r.run_id}</td>
                        <td className="px-3 py-2 text-muted-foreground">{relTime(r.started_at)}</td>
                        <td className="px-3 py-2">
                          <StatusBadge
                            tone={r.status === "pass" ? "success" : r.status === "degraded" ? "warning" : r.status === "running" ? "muted" : "danger"}
                            size="xs"
                            dot
                          >{r.status}</StatusBadge>
                        </td>
                        <td className="text-center px-3 py-2">{r.provider_calls_ok ? "✓" : "✗"}</td>
                        <td className="text-center px-3 py-2">{r.receipts_verified ? "✓" : "✗"}</td>
                        <td className="text-center px-3 py-2">{r.ledger_verified ? "✓" : "✗"}</td>
                        <td className="text-center px-3 py-2">{r.fallback_verified ? "✓" : "✗"}</td>
                        <td className="text-center px-3 py-2">{r.budget_enforced ? "✓" : "✗"}</td>
                        <td className="text-right px-3 py-2 tabular-nums">${Number(r.estimated_cost_usd).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drilldown" className="mt-3">
          {selectedRun ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Run {selectedRun.run_id}</span>
                  <StatusBadge
                    tone={selectedRun.status === "pass" ? "success" : selectedRun.status === "degraded" ? "warning" : "danger"}
                    dot
                  >{selectedRun.status}</StatusBadge>
                </CardTitle>
                <CardDescription className="flex gap-3 text-[10px]">
                  <span><Clock className="h-3 w-3 inline mr-1" />{new Date(selectedRun.started_at).toLocaleString()}</span>
                  <span>· {selectedRun.total_invocations} invocations</span>
                  <span>· ${Number(selectedRun.estimated_cost_usd).toFixed(4)}</span>
                  <span>· triggered by {selectedRun.triggered_by}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <SubCheckRow label="Live provider call (real ai-gateway)" ok={selectedRun.provider_calls_ok} />
                <SubCheckRow label="Receipt persistence (ai_inference_receipts)" ok={selectedRun.receipts_verified} />
                <SubCheckRow label="Ledger write (ai_usage_ledger)" ok={selectedRun.ledger_verified} />
                <SubCheckRow label="Fallback path (ai_fallback_events)" ok={selectedRun.fallback_verified} />
                <SubCheckRow label="Budget enforcement (under load)" ok={selectedRun.budget_enforced} />
                {selectedRun.failure_detail && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
                    <p className="font-medium text-destructive">Failure detail</p>
                    <p className="text-muted-foreground mt-1">{selectedRun.failure_detail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Select a run from the history.</p>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="mt-3">
          {selectedRun ? (
            <Card>
              <CardContent className="p-3">
                <pre className="text-[10px] bg-muted/30 p-3 rounded overflow-auto max-h-[500px] font-mono">
                  {JSON.stringify(selectedRun.evidence, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Select a run from the history.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
