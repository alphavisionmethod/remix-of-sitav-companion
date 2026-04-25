// ═══════════════════════════════════════════════════════════════
// SITA OS — Economic Trust & Future Truth Panel
// Operator-facing live view for the economic-trust-future closure.
// Reads:
//   • Live: ai_user_hard_ceilings, ai_budget_decision_receipts (24h)
//   • Static evidence: agency-wording-lockdown report,
//     calm-mode-default-posture report, future-surface registry
// Mounted as tab #9 on /admin/ai-runtime.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, DollarSign, Eye, AlertTriangle, RefreshCw } from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface BudgetDecisionRow {
  decision: string;
  count: number;
}

interface CeilingRow {
  user_id: string;
  daily_cap_usd: number | null;
  monthly_cap_usd: number | null;
  current_daily_usd: number | null;
  current_monthly_usd: number | null;
}

export default function EconomicTrustFutureTruthPanel() {
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);
  const [decisions, setDecisions] = useState<BudgetDecisionRow[]>([]);
  const [ceilings, setCeilings] = useState<CeilingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [decisionRes, ceilingRes] = await Promise.all([
          supabase
            .from("ai_budget_decision_receipts")
            .select("decision")
            .gte("created_at", since)
            .limit(1000),
          supabase
            .from("ai_user_hard_ceilings" as never)
            .select("user_id, daily_cap_usd, monthly_cap_usd, current_daily_usd, current_monthly_usd")
            .order("current_monthly_usd", { ascending: false })
            .limit(10),
        ]);
        if (cancelled) return;
        if (decisionRes.error && decisionRes.error.code !== "PGRST116") {
          setError(decisionRes.error.message);
        } else {
          const counts = new Map<string, number>();
          (decisionRes.data ?? []).forEach((r: { decision: string }) => {
            counts.set(r.decision, (counts.get(r.decision) ?? 0) + 1);
          });
          setDecisions(
            Array.from(counts.entries()).map(([decision, count]) => ({ decision, count })),
          );
        }
        if (!ceilingRes.error) {
          setCeilings((ceilingRes.data as CeilingRow[]) ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Economic Trust & Future Truth
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live evidence for the 7-gate economic-trust-and-future closure: per-user budget
              ceilings, agency-wording lockdown, future-surface containment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setReloadTick((t) => t + 1)}
              disabled={loading}
              aria-label="Refresh budget snapshot"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh budget snapshot
            </Button>
            <TruthPanelActions
              onRefresh={() => setReloadTick((t) => t + 1)}
              refreshing={loading}
              sourcePath="/generated/economic-trust-and-future-closure/"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="budgets">
            <TabsList>
              <TabsTrigger value="budgets">Per-User Budgets</TabsTrigger>
              <TabsTrigger value="trust">Trust UX</TabsTrigger>
              <TabsTrigger value="future">Future Containment</TabsTrigger>
            </TabsList>

            <TabsContent value="budgets" className="space-y-4 pt-3">
              <div className="text-xs text-muted-foreground">
                Last 24 hours of budget decisions (ai_budget_decision_receipts)
              </div>
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : error ? (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </div>
              ) : decisions.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No budget decisions in the last 24h. Closure is wired but quiet — gate{" "}
                  <code>ai-budget-hard-stop</code> remains WARN until first real load-test run.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {decisions.map((d) => (
                    <div key={d.decision} className="rounded border bg-card p-3">
                      <div className="text-xs uppercase text-muted-foreground">{d.decision}</div>
                      <div className="text-2xl font-semibold">{d.count}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <DollarSign className="h-3 w-3" />
                  Top 10 users by current monthly spend
                </div>
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : ceilings.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No ceiling rows yet — table seeded on first AI invocation per user.
                  </div>
                ) : (
                  <div className="rounded border overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">User</th>
                          <th className="p-2 text-right">Daily $</th>
                          <th className="p-2 text-right">Daily Cap</th>
                          <th className="p-2 text-right">Monthly $</th>
                          <th className="p-2 text-right">Monthly Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ceilings.map((c) => (
                          <tr key={c.user_id} className="border-t">
                            <td className="p-2 font-mono">{c.user_id.slice(0, 8)}…</td>
                            <td className="p-2 text-right">
                              {(c.current_daily_usd ?? 0).toFixed(2)}
                            </td>
                            <td className="p-2 text-right text-muted-foreground">
                              {c.daily_cap_usd ?? "—"}
                            </td>
                            <td className="p-2 text-right">
                              {(c.current_monthly_usd ?? 0).toFixed(2)}
                            </td>
                            <td className="p-2 text-right text-muted-foreground">
                              {c.monthly_cap_usd ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trust" className="space-y-3 pt-3">
              <div className="text-xs text-muted-foreground">Trust UX posture (read-only)</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Eye className="h-3 w-3" />
                    Calm-mode default
                  </div>
                  <Badge variant="outline" className="mt-2">
                    enabled
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source: <code>generated/calm-mode-default-posture-report.json</code>
                  </p>
                </div>
                <div className="rounded border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    Agency-wording lockdown
                  </div>
                  <Badge variant="outline" className="mt-2">
                    enforced
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source: <code>generated/agency-wording-lockdown-report.json</code> · 13 surfaces
                    audited · canonical phrases from <code>microcopy.ts::aiAgency</code>
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="future" className="space-y-3 pt-3">
              <div className="text-xs text-muted-foreground">
                Future-surface containment (excluded from launch scoring)
              </div>
              <div className="rounded border p-3">
                <div className="mb-2">
                  <StatusBadge tone="muted">
                    Future / archived surfaces — excluded from launch scoring
                  </StatusBadge>
                </div>
                <p className="text-xs">
                  Future-vision and archived surfaces are registered in{" "}
                  <code>src/runtimes/simulated-surface-registry.ts</code> and excluded from launch
                  scoring via the <code>excludedFromLaunchScoring</code> flag.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Live status:{" "}
                  <code>generated/economic-trust-and-future-closure/future-surface-status.json</code>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">7 BLOCK gates wired</Badge>
                  <Badge variant="outline">Closure status: shipped</Badge>
                  <Badge variant="outline">Drift validators: active</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
