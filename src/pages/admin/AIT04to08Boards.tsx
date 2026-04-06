// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT04-08: Workforce Activity, Cost, Recommendations,
// Approval Queue, and Launch Truth boards
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecentInvocations, getRecommendations, getApprovalQueue, getWorkforceStats } from "@/lib/services/ai-workforce/workforce-orchestrator";
import { Activity, DollarSign, Lightbulb, CheckCircle, Shield } from "lucide-react";

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
            <p className="text-sm text-muted-foreground">No workforce activity yet.</p>
          ) : invocations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-2 rounded border">
              <div>
                <span className="font-medium text-sm">{inv.role_key}</span>
                <span className="text-muted-foreground text-sm"> → {inv.task_type}</span>
                {inv.fallback_occurred && <Badge variant="destructive" className="ml-2 text-xs">fallback</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">${(inv.cost_cents / 100).toFixed(3)}</span>
                <Badge variant={inv.status === "completed" ? "default" : "secondary"} className="text-xs">{inv.status}</Badge>
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

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-primary" /> AIT05 — Cost & Efficiency
      </h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">${((stats?.totalCostCents ?? 0) / 100).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total AI Workforce Spend</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.totalTokens?.toLocaleString() ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Tokens Used</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.avgLatencyMs ?? 0}ms</div>
          <div className="text-xs text-muted-foreground">Average Latency</div>
        </CardContent></Card>
      </div>
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
            <p className="text-sm text-muted-foreground">No AI recommendations yet.</p>
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

// AIT08 — Launch Truth Board
export function AIT08LaunchTruth() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> AIT08 — Launch Truth & Runtime Reality
      </h1>
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            This board connects AI workforce analysis outputs to operational governance.
            When the AI team produces runtime truth audits, contradiction findings, and
            launch readiness assessments, they surface here for review and action.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
