// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT04-08: Full Spec Boards
// Activity Feed, Cost & Efficiency, Recommendations,
// Approval Queue, Launch Truth
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getRecentInvocations, getRecommendations, getApprovalQueue, getWorkforceStats } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { computeTruthIndices } from "@/lib/core-services/truth-indices/truth-index-aggregator";
import { Activity, DollarSign, Lightbulb, CheckCircle, Shield, TrendingDown, TrendingUp, Filter, AlertTriangle, XCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { formatFreshness } from "@/lib/ai/ai-surface-grammar";
import { supabase } from "@/integrations/supabase/client";
import { updateRecommendationStatus, updateApprovalQueueItem } from "@/lib/admin-ai/admin-ai-workforce-client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import AITSubNav from "@/platform/admin/components/admin/AITSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



// ═══════════════════════════════════════════════════════════════
// AIT04 — Workforce Activity Feed (Full Spec)
// ═══════════════════════════════════════════════════════════════
export function AIT04ActivityFeed() {
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCost, setFilterCost] = useState("all");

  const { data: invocations = [] } = useQuery({
    queryKey: ["ai-workforce-invocations"],
    queryFn: () => getRecentInvocations(100),
  });

  const filtered = invocations.filter(inv => {
    if (filterRole !== "all" && inv.role_key !== filterRole) return false;
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (filterCost === "premium" && inv.cost_cents <= 5) return false;
    if (filterCost === "economy" && inv.cost_cents > 5) return false;
    return true;
  });

  const roles = [...new Set(invocations.map(i => i.role_key))];
  const statuses = [...new Set(invocations.map(i => i.status))];

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary" /> AIT04 — Workforce Activity Feed</h1>
          <p className="text-muted-foreground mt-1 text-sm">Operational log of all AI workforce tasks with filtering</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCost} onValueChange={setFilterCost}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cost</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Activity ({filtered.length} items)</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matching activity. Adjust filters or invoke tasks via AIT03.</p>
          ) : filtered.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/20 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs capitalize">{inv.role_key.replace(/_/g, " ")}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{inv.task_type}</span>
                  {inv.fallback_occurred && <Badge variant="destructive" className="text-[10px]">fallback</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{inv.output_summary?.slice(0, 100) ?? "Processing..."}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {inv.latency_ms != null && <span className="text-[10px] text-muted-foreground">{inv.latency_ms}ms</span>}
                <span className="text-[10px] font-mono text-muted-foreground">${(inv.cost_cents / 100).toFixed(3)}</span>
                <Badge variant={
                  inv.status === "completed" ? "default" :
                  inv.status === "failed" ? "destructive" :
                  inv.status === "blocked_budget" ? "destructive" : "secondary"
                } className="text-[10px]">{inv.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIT05 — Cost & Efficiency Board (Full Spec)
// ═══════════════════════════════════════════════════════════════
export function AIT05CostEfficiency() {
  const { data: stats } = useQuery({ queryKey: ["ai-workforce-stats"], queryFn: getWorkforceStats });
  const { data: invocations = [] } = useQuery({ queryKey: ["ai-workforce-invocations-cost"], queryFn: () => getRecentInvocations(500) });

  const spendByRole: Record<string, { cost: number; count: number }> = {};
  const spendByTask: Record<string, { cost: number; count: number }> = {};
  let premiumCount = 0;
  let economyCount = 0;
  let fallbackByBudget = 0;

  invocations.forEach(inv => {
    if (!spendByRole[inv.role_key]) spendByRole[inv.role_key] = { cost: 0, count: 0 };
    spendByRole[inv.role_key].cost += inv.cost_cents ?? 0;
    spendByRole[inv.role_key].count += 1;
    if (!spendByTask[inv.task_type]) spendByTask[inv.task_type] = { cost: 0, count: 0 };
    spendByTask[inv.task_type].cost += inv.cost_cents ?? 0;
    spendByTask[inv.task_type].count += 1;
    if (inv.cost_cents > 5) premiumCount++; else economyCount++;
    if (inv.status === "blocked_budget") fallbackByBudget++;
  });

  const sortedRoles = Object.entries(spendByRole).sort((a, b) => b[1].cost - a[1].cost);
  const sortedTasks = Object.entries(spendByTask).sort((a, b) => b[1].cost - a[1].cost);
  const totalSpend = (stats?.totalCostCents ?? 0) / 100;
  const premiumPct = invocations.length > 0 ? Math.round((premiumCount / invocations.length) * 100) : 0;

  // Optimization insights
  const insights: string[] = [];
  sortedRoles.forEach(([role, data]) => {
    if (data.cost > 100 && data.count > 5) insights.push(`"${role.replace(/_/g, " ")}" is high-cost — consider downgrading to economy for routine tasks`);
  });
  if (premiumPct > 40) insights.push("Premium usage is above 40% — review which tasks truly need premium routing");
  if (fallbackByBudget > 0) insights.push(`${fallbackByBudget} tasks were blocked by budget — review budget thresholds`);
  sortedTasks.forEach(([task, data]) => {
    if (data.count > 10 && data.cost / data.count > 5) insights.push(`Task "${task}" is frequently expensive — consider caching or downgrading`);
  });

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> AIT05 — Cost & Efficiency</h1>

      <div className="grid md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.totalTokens?.toLocaleString() ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Tokens</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className={`text-2xl font-bold ${premiumPct > 30 ? "text-amber-500" : "text-emerald-500"}`}>{premiumPct}%</div>
          <div className="text-xs text-muted-foreground">Premium %</div>
          <Progress value={premiumPct} className="h-1 mt-1" />
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats?.avgLatencyMs ?? 0}ms</div>
          <div className="text-xs text-muted-foreground">Avg Latency</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{fallbackByBudget}</div>
          <div className="text-xs text-muted-foreground">Budget Blocks</div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Spend by Role</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {sortedRoles.map(([role, data]) => (
              <div key={role} className="flex items-center justify-between p-2 rounded border text-xs">
                <span className="font-medium capitalize">{role.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{data.count} tasks</span>
                  <span className="font-mono">${(data.cost / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">(avg ${(data.cost / data.count / 100).toFixed(3)})</span>
                  {data.cost / data.count > 10 ? <TrendingUp className="h-3 w-3 text-amber-500" /> : <TrendingDown className="h-3 w-3 text-emerald-500" />}
                </div>
              </div>
            ))}
            {sortedRoles.length === 0 && <p className="text-sm text-muted-foreground">No spend data.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Spend by Task Type</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {sortedTasks.map(([task, data]) => (
              <div key={task} className="flex items-center justify-between p-2 rounded border text-xs">
                <span className="font-medium">{task}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{data.count}×</span>
                  <span className="font-mono">${(data.cost / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {sortedTasks.length === 0 && <p className="text-sm text-muted-foreground">No task data.</p>}
          </CardContent>
        </Card>
      </div>

      {insights.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Lightbulb className="h-4 w-4 text-amber-500" />Optimization Insights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIT06 — Recommendations Board (Full Spec)
// ═══════════════════════════════════════════════════════════════
export function AIT06Recommendations() {
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const qc = useQueryClient();

  const { data: recs = [] } = useQuery({
    queryKey: ["ai-workforce-recommendations"],
    queryFn: () => getRecommendations(),
  });

  const queryClient = useQueryClient();
  const updateStatus = async (id: string, status: string) => {
    await updateRecommendationStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["ai-workforce-recommendations"] });
  };

  const filtered = recs.filter((r: Record<string, any>) => {
    if (filterDomain !== "all" && r.domain !== filterDomain) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const domains = [...new Set(recs.map((r: Record<string, any>) => r.domain))] as string[];
  const statuses = [...new Set(recs.map((r: Record<string, any>) => r.status))] as string[];

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary" /> AIT06 — Recommendations & Remediation</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated findings and proposals with accept/reject/defer workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="gap-1.5 text-xs" onClick={async () => {
            try {
              toast.info("Generating AI recommendations…");
              const { data } = await supabase.functions.invoke("brain-core", {
                body: { intent: "generate_recommendations", context: { scope: "all_domains", include_low_scoring: true } },
              });
              if (data?.recommendations) {
                for (const rec of data.recommendations) {
                  await fromTable("ai_workforce_recommendations").insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    title: rec.title,
                    description: rec.description,
                    domain: rec.domain || "general",
                    severity: rec.severity || "medium",
                    status: "pending",
                    confidence: rec.confidence || 75,
                    evidence_summary: rec.evidence || "",
                    role_source: "brain-core",
                  } as never);
                }
                qc.invalidateQueries({ queryKey: ["ai-workforce-recommendations"] });
                toast.success(`${data.recommendations.length} recommendations generated`);
              } else {
                toast.success("Analysis complete — no new recommendations");
              }
            } catch { toast.error("AI recommendation generation failed"); }
          }}><Zap className="h-3 w-3" />Generate AI Recommendations</Button>
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <Card className="md:col-span-2"><CardContent className="py-8 text-center text-muted-foreground text-sm">No recommendations match filters.</CardContent></Card>
        ) : filtered.map((r: Record<string, any>) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.title}</span>
                <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "high" ? "default" : "secondary"} className="text-[10px]">{r.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.description?.slice(0, 150)}</p>
              {r.evidence_summary && <p className="text-[10px] text-muted-foreground italic">Evidence: {r.evidence_summary.slice(0, 100)}</p>}
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">{r.domain}</Badge>
                <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                {r.role_source && <Badge variant="secondary" className="text-[10px]">{r.role_source}</Badge>}
                {r.confidence && <Badge variant="outline" className="text-[10px]">conf: {r.confidence}%</Badge>}
              </div>
              <div className="flex gap-2 pt-1 border-t">
                <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => updateStatus(r.id, "accepted")}>
                  <CheckCircle className="h-3 w-3 mr-1" />Accept
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(r.id, "rejected")}>
                  <XCircle className="h-3 w-3 mr-1" />Reject
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(r.id, "deferred")}>
                  <Clock className="h-3 w-3 mr-1" />Defer
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(r.id, "queued_for_execution")}>
                  <Zap className="h-3 w-3 mr-1" />Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIT07 — Human Approval Queue (Full Spec)
// ═══════════════════════════════════════════════════════════════
export function AIT07ApprovalQueue() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("pending");

  const { data: queue = [] } = useQuery({
    queryKey: ["ai-workforce-approval-queue", filterStatus],
    queryFn: () => getApprovalQueue(filterStatus === "all" ? undefined : filterStatus),
  });

  const updateApproval = async (id: string, updates: Record<string, unknown>) => {
    await updateApprovalQueueItem(id, updates);
    queryClient.invalidateQueries({ queryKey: ["ai-workforce-approval-queue"] });
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CheckCircle className="h-6 w-6 text-primary" /> AIT07 — Human Approval Queue</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and approve AI-proposed changes with risk assessment and evidence</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {queue.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No {filterStatus !== "all" ? filterStatus : ""} approval items.</CardContent></Card>
        ) : queue.map((item: Record<string, any>) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{item.title}</span>
                  {item.originating_role && <span className="text-xs text-muted-foreground ml-2">from {item.originating_role}</span>}
                </div>
                <div className="flex gap-1">
                  <Badge variant={item.risk_tier === "critical" ? "destructive" : item.risk_tier === "high" ? "default" : "secondary"} className="text-[10px]">{item.risk_tier} risk</Badge>
                  <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.description?.slice(0, 200)}</p>
              {item.why_approval_required && (
                <div className="p-2 rounded bg-muted/30 text-xs">
                  <span className="font-medium">Why approval needed: </span>{item.why_approval_required}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {item.affected_area && <Badge variant="outline" className="text-[10px]">{item.affected_area}</Badge>}
                {item.proposed_action_type && <Badge variant="outline" className="text-[10px]">{item.proposed_action_type}</Badge>}
                {item.budget_implication && <Badge variant="outline" className="text-[10px]">Budget: {item.budget_implication}</Badge>}
              </div>
              {item.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => updateApproval(item.id, { status: "approved" })}>
                    <CheckCircle className="h-3 w-3" />Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => updateApproval(item.id, { status: "rejected" })}>
                    <XCircle className="h-3 w-3" />Reject
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateApproval(item.id, { status: "returned" })}>
                    Request More Evidence
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIT08 — Launch Truth & Runtime Reality Board (Full Spec)
// ═══════════════════════════════════════════════════════════════
export function AIT08LaunchTruth() {
  const { data: indices } = useQuery({ queryKey: ["truth-indices-ait08"], queryFn: computeTruthIndices, staleTime: 60_000 });

  const indexCards = indices ? [
    { label: "Runtime Truth", ...indices.runtimeTruth, key: "runtime" },
    { label: "Launch Honesty", ...indices.launchHonesty, key: "launch" },
    { label: "AI Truth", ...indices.aiTruth, key: "ai" },
    { label: "Connector Truth", ...indices.connectorTruth, key: "connector" },
    { label: "Demo Governance", ...indices.demoGovernance, key: "demo" },
    { label: "Surface Portability", ...indices.surfacePortability, key: "surface" },
  ] : [];

  const getColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-destructive";
  const getBg = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-destructive";

  // Derive contradictions and risk areas from indices
  const contradictions: string[] = [];
  const riskAreas: string[] = [];
  if (indices) {
    if (indices.runtimeTruth.score < 50) { contradictions.push("Runtime truth below 50% — significant gap between claimed and actual runtime states"); riskAreas.push("Runtime Truth"); }
    if (indices.connectorTruth.score < 40) { contradictions.push("Connector truth very low — OAuth flows may be schema-only"); riskAreas.push("Connectors"); }
    if (indices.aiTruth.score < 40) { contradictions.push("AI truth low — contracts exist but runtime activation pending"); riskAreas.push("AI Runtime"); }
    if (indices.surfacePortability.score < 40) { contradictions.push("Surface portability low — web-first with limited mobile runtime"); riskAreas.push("Surface Portability"); }
    if (indices.demoGovernance.score < 60) { contradictions.push("Demo governance gaps — some demo providers lack governed boundaries"); riskAreas.push("Demo Governance"); }
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> AIT08 — Launch Truth & Runtime Reality</h1>
          <p className="text-muted-foreground text-sm">Live truth indices with contradiction detection and risk analysis</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={async () => {
          try {
            toast.info("Analyzing truth gaps…");
            const lowScoring = indices ? Object.entries(indices)
              .filter(([k, v]: any) => v?.score !== undefined && v.score < 80 && k !== "overallScore")
              .map(([k, v]: any) => ({ index: k, score: v.score, detail: v.detail })) : [];
            const { data } = await supabase.functions.invoke("brain-core", {
              body: { intent: "analyze_truth_gaps", context: { low_scoring_indices: lowScoring, overall_score: indices?.overallScore } },
            });
            if (data?.recommendations) {
              const userId = (await supabase.auth.getUser()).data.user?.id;
              for (const rec of data.recommendations) {
                await fromTable("ai_workforce_recommendations").insert({
                  user_id: userId,
                  title: rec.title,
                  description: rec.description,
                  domain: rec.domain || "truth",
                  severity: rec.severity || "high",
                  status: "pending",
                  confidence: rec.confidence || 80,
                  evidence_summary: rec.evidence || "",
                  role_source: "brain-core",
                } as never);
              }
              toast.success(`${data.recommendations.length} gap remediation recommendations created`);
            } else {
              toast.success("No gaps requiring remediation");
            }
          } catch { toast.error("Gap analysis failed"); }
        }}><AlertTriangle className="h-3 w-3" />Analyze Gaps</Button>
      </div>

      {indices && (
        <>
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-4 text-center">
              <div className={`text-5xl font-bold ${getColor(indices.overallScore)}`}>{indices.overallScore}/100</div>
              <div className="text-sm text-muted-foreground mt-1">Overall Truth Score</div>
              <div className="text-xs text-muted-foreground mt-0.5">{formatFreshness(indices.lastComputed)}</div>
              <Progress value={indices.overallScore} className="h-2 mt-3 max-w-md mx-auto" />
            </CardContent>
          </Card>

          {/* Index Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {indexCards.map(card => (
              <Card key={card.key}>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getColor(card.score)}`}>{card.score}</div>
                    <div className="text-xs font-medium mt-1">{card.label}</div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full ${getBg(card.score)}`} style={{ width: `${card.score}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{card.detail}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contradictions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" />Unresolved Contradictions ({contradictions.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {contradictions.length === 0 ? (
                  <p className="text-sm text-emerald-500 flex items-center gap-1"><CheckCircle className="h-4 w-4" />No contradictions detected</p>
                ) : contradictions.map((c, i) => (
                  <div key={i} className="p-2 rounded border text-xs flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-1"><Shield className="h-4 w-4" />Risk Areas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {riskAreas.length === 0 ? (
                  <p className="text-sm text-emerald-500">No high-risk areas identified</p>
                ) : riskAreas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border text-xs">
                    <span className="font-medium">{area}</span>
                    <Badge variant="destructive" className="text-[10px]">Needs Attention</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Claim Classification */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Launch Claim Classification</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded border">
                  <div className="text-2xl font-bold text-emerald-500">{indexCards.filter(c => c.score >= 80).length}</div>
                  <div className="text-xs text-muted-foreground">Launch-Safe Claims</div>
                </div>
                <div className="p-4 rounded border">
                  <div className="text-2xl font-bold text-amber-500">{indexCards.filter(c => c.score >= 40 && c.score < 80).length}</div>
                  <div className="text-xs text-muted-foreground">Claim-with-Qualifier</div>
                </div>
                <div className="p-4 rounded border">
                  <div className="text-2xl font-bold text-destructive">{indexCards.filter(c => c.score < 40).length}</div>
                  <div className="text-xs text-muted-foreground">Internal-Only</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!indices && (
        <Card><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Loading truth indices...</p></CardContent></Card>
      )}
    </div>
  );
}
