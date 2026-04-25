// ═══════════════════════════════════════════════════════════════
// C-020: User Seed Health — admin verifiability of new-user seeding.
// Displays the last 100 seed receipts, status breakdown, and a
// "Force Retry" action that re-invokes the seeder with force=true.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dbAny } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { CheckCircle2, AlertTriangle, SkipForward, RotateCw, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface SeedRun {
  id: string;
  user_id: string;
  status: "seeded" | "skipped" | "failed";
  reason: string | null;
  seed_version: number;
  tables_count: number;
  rows_count: number;
  error_summary: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<SeedRun["status"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  seeded: { label: "Seeded", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  skipped: { label: "Skipped", className: "bg-muted text-muted-foreground", icon: SkipForward },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive", icon: AlertTriangle },
};

export default function UserSeedHealth() {
  const [runs, setRuns] = useState<SeedRun[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await dbAny
      .from("user_seed_runs")
      .select("id, user_id, status, reason, seed_version, tables_count, rows_count, error_summary, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast.error("Failed to load seed receipts", { description: error.message });
      setRuns([]);
    } else {
      setRuns((data ?? []) as SeedRun[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const breakdown = useMemo(() => {
    const counts = { seeded: 0, skipped: 0, failed: 0, total: 0 };
    for (const r of runs ?? []) {
      counts[r.status] += 1;
      counts.total += 1;
    }
    return counts;
  }, [runs]);

  const forceRetry = async () => {
    setRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-user-data", {
        method: "POST",
        body: { force: true },
      });
      if (error) throw error;
      toast.success("Seed re-run", {
        description: `${data?.rows_count ?? "?"} rows across ${data?.tables_count ?? "?"} tables`,
      });
      await load();
    } catch (e) {
      toast.error("Force retry failed", { description: (e as Error).message });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Seed Health</h1>
          <p className="text-muted-foreground mt-1">
            Verifiable receipts for new-user fixture seeding. Each signup writes one row.
          </p>
        </div>
        <Button onClick={forceRetry} disabled={retrying} variant="outline">
          <RotateCw className={`h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}`} />
          Force retry for me
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total runs" value={breakdown.total} />
        <StatCard label="Seeded" value={breakdown.seeded} accent="emerald" />
        <StatCard label="Skipped" value={breakdown.skipped} />
        <StatCard label="Failed" value={breakdown.failed} accent="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent seed runs</CardTitle>
          <CardDescription>Most recent 100 receipts across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !runs || runs.length === 0 ? (
            <EmptyState
              variant="card"
              icon={Sprout}
              title="No seed receipts yet"
              description="Seed receipts will appear here as users sign up and the seeder runs."
            />
          ) : (
            <div className="divide-y">
              {runs.map((r) => {
                const meta = STATUS_BADGE[r.status];
                const Icon = meta.icon;
                return (
                  <div key={r.id} className="py-3 flex items-center gap-4">
                    <Badge className={meta.className} variant="secondary">
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      {meta.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.user_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.reason ?? "—"} · v{r.seed_version} · {r.tables_count} tables · {r.rows_count} rows
                        {r.error_summary ? ` · ${r.error_summary}` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "destructive";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "destructive"
      ? "text-destructive"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`text-3xl font-semibold mt-1 ${accentClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
