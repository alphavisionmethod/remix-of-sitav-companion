// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT04-08: Workforce Activity, Cost, Recommendations,
// Approval Queue, and Launch Truth boards
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecentInvocations, getRecommendations, getApprovalQueue, getWorkforceStats } from "@/lib/services/ai-workforce/workforce-orchestrator";
import { computeTruthIndices } from "@/lib/services/truth-indices/truth-index-aggregator";
import { Activity, DollarSign, Lightbulb, CheckCircle, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { formatFreshness } from "@/lib/ai/ai-surface-grammar";

// AIT04 — Workforce Activity Feed
export function AIT04ActivityFeed() {
  const { data: invocations = [] } = useQuery({
    queryKey: ["ai-workforce-invocations"],
    queryFn: () => getRecentInvocations(50),
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" /> AIT04 — Workforce Activity Feed
      </h1>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {invocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workforce activity yet. Use AIT03 to invoke tasks.</p>
          ) : invocations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded border">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{inv.role_key}</span>
                  <span className="text-muted-foreground text-sm">→ {inv.task_type}</span>
                  {inv.fallback_occurred && <Badge variant="destructive" className="text-xs">fallback</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {inv.output_summary?.slice(0, 80) ?? "Pending..."}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {inv.latency_ms != null && <span className="text-xs text-muted-foreground">{inv.latency_ms}ms</span>}
                <span className="text-xs text-muted-foreground">${(inv.cost_cents / 100).toFixed(3)}</span>
                <Badge variant={inv.status === "completed" ? "default" : inv.status === "failed" ? "destructive" : "secondary"} className="text-xs">{inv.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// AIT05 — Cost & Efficiency Board
export function AIT05CostEfficiency() {
  const { data: stats } = useQuery({
    queryKey: ["ai-workforce-stats"],
    queryFn: getWorkforceStats,
  });

  const { data: invocations = [] } = useQuery({
    queryKey: ["ai-workforce-invocations-cost"],
    queryFn: () => getRecentInvocations(200),
  });

  // Compute spend by role
  const spendByRole: Record<string, number> = {};
  invocations.forEach(inv => {
    spendByRole[inv.role_key] = (spendByRole[inv.role_key] ?? 0) + (inv.cost_cents ?? 0);
  });
  const sortedRoles = Object.entries(spendByRole).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-primary" /> AIT05 — Cost & Efficiency
      </h1>
      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">${((stats?.totalCostCents ?? 0) / 100).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.totalTokens?.toLocaleString() ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Tokens</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.avgLatencyMs ?? 0}ms</div>
          <div className="text-xs text-muted-foreground">Avg Latency</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.completedCount ?? 0}/{stats?.totalInvocations ?? 0}</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Spend by Role</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sortedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No spend recorded yet.</p>
          ) : sortedRoles.map(([role, cents]) => (
            <div key={role} className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm font-medium capitalize">{role.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">${(cents / 100).toFixed(3)}</span>
                {cents > 50 ? <TrendingUp className="h-3 w-3 text-amber-400" /> : <TrendingDown className="h-3 w-3 text-emerald-400" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// AIT06 — Recommendations Board
export function AIT06Recommendations() {
  const { data: recs = [] } = useQuery({
    queryKey: ["ai-workforce-recommendations"],
    queryFn: () => getRecommendations(),
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-primary" /> AIT06 — Recommendations
      </h1>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {recs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No AI recommendations yet. Run workforce tasks to generate recommendations.</p>
          ) : recs.map((r: any) => (
            <div key={r.id} className="p-3 rounded border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.title}</span>
                <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "high" ? "default" : "secondary"}>
                  {r.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.description?.slice(0, 120)}</p>
              <div className="flex gap-2 pt-1">
                <Badge variant="outline" className="text-xs">{r.domain}</Badge>
                <Badge variant="outline" className="text-xs">{r.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// AIT07 — Approval Queue
export function AIT07ApprovalQueue() {
  const { data: queue = [] } = useQuery({
    queryKey: ["ai-workforce-approval-queue"],
    queryFn: () => getApprovalQueue(),
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-primary" /> AIT07 — Human Approval Queue
      </h1>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {queue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals. The AI team has no high-impact proposals waiting.</p>
          ) : queue.map((item: any) => (
            <div key={item.id} className="p-3 rounded border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.title}</span>
                <Badge variant={item.risk_tier === "high" ? "destructive" : "secondary"}>{item.risk_tier} risk</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.description?.slice(0, 100)}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="default">Approve</Button>
                <Button size="sm" variant="outline">Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// AIT08 — Launch Truth & Runtime Reality Board
export function AIT08LaunchTruth() {
  const { data: indices } = useQuery({
    queryKey: ["truth-indices-ait08"],
    queryFn: computeTruthIndices,
    staleTime: 60_000,
  });

  const indexCards = indices ? [
    { label: "Runtime Truth", ...indices.runtimeTruth },
    { label: "Launch Honesty", ...indices.launchHonesty },
    { label: "AI Truth", ...indices.aiTruth },
    { label: "Connector Truth", ...indices.connectorTruth },
    { label: "Demo Governance", ...indices.demoGovernance },
    { label: "Surface Portability", ...indices.surfacePortability },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> AIT08 — Launch Truth & Runtime Reality
      </h1>
      <p className="text-muted-foreground text-sm">
        Live truth indices computed from DB-backed governance data. AI workforce analysis outputs connect here.
      </p>

      {indices && (
        <>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className={`text-4xl font-bold ${getScoreColor(indices.overallScore)}`}>{indices.overallScore}/100</div>
              <div className="text-sm text-muted-foreground mt-1">Overall Truth Score</div>
              <div className="text-xs text-muted-foreground mt-0.5">{formatFreshness(indices.lastComputed)}</div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {indexCards.map(card => (
              <Card key={card.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{card.label}</span>
                    <Badge variant={card.score >= 80 ? "default" : card.score >= 50 ? "secondary" : "destructive"}>
                      {card.label.toUpperCase().charAt(0)} {card.score}
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(card.score)}`}>{card.score}/100</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.detail}</div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${card.score >= 80 ? "bg-emerald-500" : card.score >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                      style={{ width: `${card.score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!indices && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Loading truth indices...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
