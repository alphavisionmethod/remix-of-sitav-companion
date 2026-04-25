// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Retention Dashboard (C-014)
//
// Admin-only visibility into TTL/retention runs. Shows the last 30
// days of `data_retention_runs` receipts grouped by table, plus a
// "Run cleanup now (dry-run)" trigger that invokes the
// `data-cleanup` edge function with { dryRun: true }.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, PlayCircle, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

interface RetentionRun {
  id: string;
  ran_at: string;
  table_name: string;
  mode: string;
  rows_deleted: number;
  duration_ms: number;
  dry_run: boolean;
  error: string | null;
}

interface RetentionPolicy {
  table: string;
  defaultTtl: string;
  category: string;
}

const POLICIES: RetentionPolicy[] = [
  { table: "notifications", defaultTtl: "90 days", category: "User events" },
  { table: "ai_workforce_invocations", defaultTtl: "90 days", category: "AI logs" },
  { table: "ai_workforce_outputs", defaultTtl: "180 days", category: "AI logs" },
  { table: "ai_inference_receipts", defaultTtl: "365 days", category: "AI audit" },
  { table: "cloud_audit_events", defaultTtl: "730 days", category: "Audit (2y)" },
  { table: "error_events", defaultTtl: "90 days", category: "Telemetry" },
  { table: "cloud_activity_journal", defaultTtl: "180 days", category: "Activity" },
  { table: "admin_sessions", defaultTtl: "On expiry", category: "Sessions" },
  { table: "ai_workforce_cached_outputs", defaultTtl: "30 days", category: "Cache" },
  { table: "connector_oauth_tokens", defaultTtl: "On expiry", category: "Tokens" },
  { table: "webauthn_challenges", defaultTtl: "On expiry", category: "Auth" },
];

export default function DataRetentionDashboard() {
  const [runs, setRuns] = useState<RetentionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    void loadRuns();
  }, []);

  async function loadRuns() {
    setLoading(true);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("data_retention_runs")
      .select("*")
      .gte("ran_at", since)
      .order("ran_at", { ascending: false })
      .limit(500);

    if (error) {
      toast.error(`Failed to load retention runs: ${error.message}`);
      setRuns([]);
    } else {
      setRuns((data ?? []) as RetentionRun[]);
    }
    setLoading(false);
  }

  async function runDryRun() {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("data-cleanup", {
        body: { dryRun: true },
      });
      if (error) throw error;
      const total = (data as { totalDeleted?: number })?.totalDeleted ?? 0;
      toast.success(`Dry-run complete — ${total.toLocaleString()} rows would be purged`);
      await loadRuns();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Cleanup invoke failed";
      toast.error(`Dry-run failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  }

  const lastRunByTable = useMemo(() => {
    const map = new Map<string, RetentionRun>();
    for (const r of runs) {
      if (!map.has(r.table_name)) map.set(r.table_name, r);
    }
    return map;
  }, [runs]);

  const totals = useMemo(() => {
    const liveRuns = runs.filter((r) => !r.dry_run);
    return {
      runs: liveRuns.length,
      rowsPurged: liveRuns.reduce((sum, r) => sum + r.rows_deleted, 0),
      errors: runs.filter((r) => !!r.error).length,
    };
  }, [runs]);

  return (
    <AdminControlPlaneShell contextScope="Privacy / Data Retention">
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Data Retention & TTL
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Retention policies, scheduled cleanup receipts, and the right-to-erasure
              control plane. Aligned with{" "}
              <code className="text-xs">security/policies/security-policies.md</code>.
            </p>
          </div>
          <Button onClick={runDryRun} disabled={running} size="sm">
            {running ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Run cleanup (dry-run)
          </Button>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            icon={<Clock className="h-5 w-5 text-primary" />}
            label="Cleanup runs (30d)"
            value={totals.runs.toLocaleString()}
          />
          <SummaryCard
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            label="Rows purged (30d)"
            value={totals.rowsPurged.toLocaleString()}
          />
          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            label="Runs with errors"
            value={totals.errors.toLocaleString()}
          />
        </div>

        {/* Policy table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retention policies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Default TTL</TableHead>
                  <TableHead>Last cleanup</TableHead>
                  <TableHead className="text-right">Last rows purged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {POLICIES.map((p) => {
                  const last = lastRunByTable.get(p.table);
                  return (
                    <TableRow key={p.table}>
                      <TableCell className="font-mono text-xs">{p.table}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.defaultTtl}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {last
                          ? new Date(last.ran_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {last ? last.rows_deleted.toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent runs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent cleanup receipts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…
              </div>
            ) : runs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No cleanup runs in the last 30 days. The nightly cron may not be
                wired yet — run a dry-run above to verify the function.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 100).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(r.ran_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.table_name}
                      </TableCell>
                      <TableCell className="text-xs">{r.mode}</TableCell>
                      <TableCell className="text-right text-xs">
                        {r.rows_deleted.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {r.duration_ms} ms
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.dry_run ? "secondary" : "default"}
                          className="text-[10px]"
                        >
                          {r.dry_run ? "dry-run" : "live"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-destructive max-w-[240px] truncate">
                        {r.error ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
