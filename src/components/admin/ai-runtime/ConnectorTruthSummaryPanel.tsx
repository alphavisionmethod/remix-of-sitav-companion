// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Truth Summary Panel (AI Engineer team view)
//
// Read-only summary of connector nightly verification truth.
// Canonical control surface stays at /admin/integrations/oauth-refresh-health.
// This panel exists ONLY in /admin/ai-runtime so the AI Engineer team can
// see connector truth side-by-side with AI runtime truth — NOT a duplicate
// dashboard.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectorStateBadge } from "@/components/primitives/status/ConnectorStateBadge";
import { EvidenceLink } from "@/components/primitives/actions/EvidenceLink";
import { ProvenanceChip } from "@/components/primitives/status/ProvenanceChip";
import { NeedsHistoricalReleasesExplainer } from "@/components/primitives/feedback/NeedsHistoricalReleasesExplainer";
import {
  loadConnectorTruthSummary,
  type ConnectorTruthSummary,
} from "@/lib/internal-agents/runtime/connector-truth-data";

function classificationTone(c: ConnectorTruthSummary["classification"]) {
  switch (c) {
    case "green":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "yellow":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "red":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function fmt(ts: string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function ConnectorTruthSummaryPanel() {
  const [summary, setSummary] = useState<ConnectorTruthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadConnectorTruthSummary();
      if (!cancelled) {
        setSummary(data);
        setLoading(false);
        setLoadedAt(new Date().toISOString());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lastRun = summary?.recent_runs?.[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Connector Truth — Nightly Verification</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live OAuth refresh proof for Google / Microsoft / Slack. Read-only summary —
              canonical control lives at the Integrations Hub.
            </p>
          </div>
          {summary && (
            <Badge
              variant="outline"
              className={classificationTone(summary.classification)}
            >
              {summary.classification.toUpperCase()}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading connector truth…</p>}
          {!loading && !summary && (
            <NeedsHistoricalReleasesExplainer
              title="No connector truth recorded yet"
              description="The connector truth verifier runs nightly at 02:30 UTC. Streaks, classification, and provider state appear after the first scheduled tick completes."
            />
          )}
          {!loading && summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(summary.streaks ?? []).map((s) => (
                  <div
                    key={s.provider}
                    className="border rounded-md p-3 bg-card flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{s.provider}</div>
                      <ConnectorStateBadge
                        state={s.current_streak_days >= 7 ? "connected" : s.current_streak_days >= 1 ? "degraded" : "manual"}
                        size="xs"
                        label={`${s.current_streak_days}d streak`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5 tabular-nums">
                      <div>7d runs: {s.successful_runs_7d ?? 0}/{s.total_runs_7d ?? 0}</div>
                      <div>Last pass: {fmt(s.last_pass_at)}</div>
                      {s.last_fail_at && <div>Last fail: {fmt(s.last_fail_at)}</div>}
                      {s.last_failure_class && (
                        <div>Class: <span className="text-destructive">{s.last_failure_class}</span></div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <ProvenanceChip
                        source="oauth_refresh_probe_results"
                        verifiedAt={s.last_pass_at ?? s.last_fail_at ?? null}
                      />
                      <EvidenceLink
                        to={`/admin/integrations?provider=${encodeURIComponent(s.provider)}`}
                        label="Drilldown"
                        kind="integration"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border rounded-md p-3 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Last nightly verifier run</div>
                  {lastRun && (
                    <Badge variant="outline" className={classificationTone(
                      lastRun.status === "pass" ? "green" : lastRun.status === "degraded" ? "yellow" : "red"
                    )}>
                      {lastRun.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {!lastRun && <p className="text-xs text-muted-foreground">No runs yet.</p>}
                {lastRun && (
                  <dl className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                    <dt className="text-muted-foreground">Run ID</dt>
                    <dd className="font-mono truncate">{lastRun.run_id}</dd>
                    <dt className="text-muted-foreground">Started</dt>
                    <dd>{fmt(lastRun.started_at)}</dd>
                    <dt className="text-muted-foreground">Completed</dt>
                    <dd>{fmt(lastRun.completed_at)}</dd>
                    <dt className="text-muted-foreground">Passed</dt>
                    <dd>{(lastRun.providers_passed ?? []).join(", ") || "—"}</dd>
                    <dt className="text-muted-foreground">Failed</dt>
                    <dd className={lastRun.providers_failed?.length ? "text-destructive" : ""}>
                      {(lastRun.providers_failed ?? []).join(", ") || "—"}
                    </dd>
                    <dt className="text-muted-foreground">Expiry-pressure</dt>
                    <dd className={lastRun.expiry_pressure_passed ? "text-emerald-600" : "text-destructive"}>
                      {lastRun.expiry_pressure_passed ? "passed" : "failed"}
                    </dd>
                    <dt className="text-muted-foreground">State consistency</dt>
                    <dd className={lastRun.state_consistency_passed ? "text-emerald-600" : "text-destructive"}>
                      {lastRun.state_consistency_passed ? "passed" : "failed"}
                    </dd>
                    {lastRun.failure_summary && (
                      <>
                        <dt className="text-muted-foreground">Failure</dt>
                        <dd className="text-destructive col-span-1">{lastRun.failure_summary}</dd>
                      </>
                    )}
                  </dl>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <div>
                  Reauth required (24h): <span className="font-medium">{summary.reauth_required_count_24h ?? 0}</span>
                  {" · "}Min streak: <span className="font-medium">{summary.min_streak_days ?? 0}d</span>
                  {loadedAt && <> {" · "}Last DB observation: {fmt(loadedAt)}</>}
                </div>
                <Link
                  to="/admin/integrations"
                  className="text-primary hover:underline"
                >
                  Canonical control: Integrations Hub →
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
