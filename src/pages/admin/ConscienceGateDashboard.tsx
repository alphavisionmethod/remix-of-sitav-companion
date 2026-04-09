// ═══════════════════════════════════════════════════════════════
// SITA OS — ConscienceGate Admin Dashboard
// Inspectable + Governable surface for the ConscienceGate OS primitive
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { motion } from "framer-motion";
import {
  ShieldCheck, Eye, AlertTriangle, XCircle, CheckCircle2,
  RefreshCw, Brain, DollarSign, Activity, Zap,
} from "lucide-react";
import type { GateDecision, GateVerdict } from "@/lib/core-services/conscience-gate/conscience-gate";

// ── Demo Data ──────────────────────────────────────────────────

const DEMO_VERDICTS: Array<GateVerdict & { id: string }> = [
  {
    id: "v-001",
    decision: "pass",
    taskType: "advisor.summarize",
    riskClass: "standard",
    evidenceState: { sufficient: true, sourcesAvailable: 4, sourcesRequired: 2, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 3, budgetClass: "standard", remainingBudgetCents: 480, shouldDowngrade: false },
    routingHints: { preferredProvider: "openai", preferredModel: "gpt-4o-mini", maxLatencyMs: 2000, routingClass: "standard", deterministicPath: false },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: false, deterministicRequired: false,
    reasons: ["All evidence sufficient", "Budget within limits"],
    timestamp: new Date(Date.now() - 120000).toISOString(), correlationId: "corr-001",
  },
  {
    id: "v-002",
    decision: "caveat",
    taskType: "advisor.financial_advice",
    riskClass: "elevated",
    evidenceState: { sufficient: true, sourcesAvailable: 3, sourcesRequired: 3, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 12, budgetClass: "premium", remainingBudgetCents: 200, shouldDowngrade: false },
    routingHints: { preferredProvider: "anthropic", preferredModel: "claude-sonnet", maxLatencyMs: 5000, routingClass: "premium", deterministicPath: false },
    retrievalRequired: true, critiqueRequired: true, approvalRequired: false, deterministicRequired: false,
    reasons: ["High-risk domain requires critique loop", "Grounding mandatory"],
    timestamp: new Date(Date.now() - 300000).toISOString(), correlationId: "corr-002",
  },
  {
    id: "v-003",
    decision: "block",
    taskType: "advisor.execute_trade",
    riskClass: "critical",
    evidenceState: { sufficient: false, sourcesAvailable: 1, sourcesRequired: 3, missingTypes: ["market_data", "portfolio_state"] },
    budgetState: { allowed: false, estimatedCostCents: 45, budgetClass: "premium", remainingBudgetCents: 20, shouldDowngrade: true },
    routingHints: { preferredProvider: "anthropic", preferredModel: "claude-opus", maxLatencyMs: 10000, routingClass: "critical", deterministicPath: true },
    retrievalRequired: true, critiqueRequired: true, approvalRequired: true, deterministicRequired: true,
    reasons: ["Insufficient evidence sources", "Budget exceeded", "Critical risk requires approval"],
    timestamp: new Date(Date.now() - 600000).toISOString(), correlationId: "corr-003",
  },
  {
    id: "v-004",
    decision: "refuse",
    taskType: "advisor.delete_account",
    riskClass: "critical",
    evidenceState: { sufficient: false, sourcesAvailable: 0, sourcesRequired: 5, missingTypes: ["identity_proof", "authorization", "cooldown_period", "confirmation", "backup_verified"] },
    budgetState: { allowed: false, estimatedCostCents: 0, budgetClass: "critical", remainingBudgetCents: 0, shouldDowngrade: false },
    routingHints: { maxLatencyMs: 0, routingClass: "blocked", deterministicPath: true },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: true, deterministicRequired: true,
    reasons: ["Destructive action blocked by constitution", "Missing all required evidence"],
    timestamp: new Date(Date.now() - 900000).toISOString(), correlationId: "corr-004",
  },
  {
    id: "v-005",
    decision: "pass",
    taskType: "concierge.schedule_reminder",
    riskClass: "standard",
    evidenceState: { sufficient: true, sourcesAvailable: 1, sourcesRequired: 1, missingTypes: [] },
    budgetState: { allowed: true, estimatedCostCents: 1, budgetClass: "micro", remainingBudgetCents: 999, shouldDowngrade: false },
    routingHints: { preferredModel: "gpt-4o-mini", maxLatencyMs: 1000, routingClass: "fast", deterministicPath: true },
    retrievalRequired: false, critiqueRequired: false, approvalRequired: false, deterministicRequired: true,
    reasons: ["Minimal risk, deterministic path"],
    timestamp: new Date(Date.now() - 60000).toISOString(), correlationId: "corr-005",
  },
];

const DECISION_COLORS: Record<GateDecision, string> = {
  pass: "text-trust-verified bg-trust-verified/10",
  caveat: "text-amber-500 bg-amber-500/10",
  block: "text-orange-500 bg-orange-500/10",
  refuse: "text-destructive bg-destructive/10",
};

const DECISION_ICONS: Record<GateDecision, React.ReactNode> = {
  pass: <CheckCircle2 className="h-4 w-4" />,
  caveat: <AlertTriangle className="h-4 w-4" />,
  block: <XCircle className="h-4 w-4" />,
  refuse: <ShieldCheck className="h-4 w-4" />,
};

export default function ConscienceGateDashboard() {
  const { isAdmin, loading } = useRequireAdmin();
  const [tab, setTab] = useState("verdicts");

  const stats = useMemo(() => {
    const counts: Record<GateDecision, number> = { pass: 0, caveat: 0, block: 0, refuse: 0 };
    DEMO_VERDICTS.forEach((v) => counts[v.decision]++);
    const total = DEMO_VERDICTS.length;
    return { counts, total, passRate: total ? Math.round((counts.pass / total) * 100) : 0 };
  }, []);

  if (loading || !isAdmin) return null;

  return (
    <div className="space-y-6 p-6" data-testid="admin-conscience-gate">
      <AdminPageHeader
        icon={ShieldCheck}
        title="ConscienceGate — Ethical Safety Boundary"
        subtitle="Pre-response policy, evidence, and budget gate for all AI actions"
        accent="trust"
      />

      {/* ── KPI Row ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([
          { label: "Pass", count: stats.counts.pass, icon: <CheckCircle2 className="h-5 w-5 text-trust-verified" />, pct: stats.total ? Math.round((stats.counts.pass / stats.total) * 100) : 0 },
          { label: "Caveat", count: stats.counts.caveat, icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, pct: stats.total ? Math.round((stats.counts.caveat / stats.total) * 100) : 0 },
          { label: "Block", count: stats.counts.block, icon: <XCircle className="h-5 w-5 text-orange-500" />, pct: stats.total ? Math.round((stats.counts.block / stats.total) * 100) : 0 },
          { label: "Refuse", count: stats.counts.refuse, icon: <ShieldCheck className="h-5 w-5 text-destructive" />, pct: stats.total ? Math.round((stats.counts.refuse / stats.total) * 100) : 0 },
        ] as const).map((kpi) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {kpi.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold text-foreground">{kpi.count}</p>
                </div>
                <Badge variant="outline" className="text-xs">{kpi.pct}%</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="verdicts"><Eye className="mr-1.5 h-4 w-4" />Verdicts</TabsTrigger>
          <TabsTrigger value="evidence"><Brain className="mr-1.5 h-4 w-4" />Evidence</TabsTrigger>
          <TabsTrigger value="budget"><DollarSign className="mr-1.5 h-4 w-4" />Budget</TabsTrigger>
          <TabsTrigger value="routing"><Zap className="mr-1.5 h-4 w-4" />Routing</TabsTrigger>
        </TabsList>

        {/* Verdicts Tab */}
        <TabsContent value="verdicts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gate Verdict History</CardTitle>
              <CardDescription>Every AI action passes through the ConscienceGate before execution</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decision</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Critique</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Reasons</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_VERDICTS.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Badge className={DECISION_COLORS[v.decision]}>{DECISION_ICONS[v.decision]} {v.decision}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{v.taskType}</TableCell>
                      <TableCell><Badge variant="outline">{v.riskClass}</Badge></TableCell>
                      <TableCell>{v.critiqueRequired ? <CheckCircle2 className="h-4 w-4 text-amber-500" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{v.approvalRequired ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{v.reasons.join("; ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleTimeString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence State per Verdict</CardTitle>
              <CardDescription>Source sufficiency and missing evidence types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEMO_VERDICTS.map((v) => (
                <div key={v.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{v.taskType}</span>
                    <Badge className={v.evidenceState.sufficient ? "bg-trust-verified/10 text-trust-verified" : "bg-destructive/10 text-destructive"}>
                      {v.evidenceState.sufficient ? "Sufficient" : "Insufficient"}
                    </Badge>
                  </div>
                  <Progress value={(v.evidenceState.sourcesAvailable / Math.max(v.evidenceState.sourcesRequired, 1)) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{v.evidenceState.sourcesAvailable} / {v.evidenceState.sourcesRequired} sources</span>
                    {v.evidenceState.missingTypes.length > 0 && (
                      <span className="text-destructive">Missing: {v.evidenceState.missingTypes.join(", ")}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget State per Verdict</CardTitle>
              <CardDescription>Cost estimates, budget class, and downgrade signals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Allowed</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Budget Class</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Downgrade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_VERDICTS.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.taskType}</TableCell>
                      <TableCell>
                        {v.budgetState.allowed
                          ? <CheckCircle2 className="h-4 w-4 text-trust-verified" />
                          : <XCircle className="h-4 w-4 text-destructive" />}
                      </TableCell>
                      <TableCell>${(v.budgetState.estimatedCostCents / 100).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{v.budgetState.budgetClass}</Badge></TableCell>
                      <TableCell>${(v.budgetState.remainingBudgetCents / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        {v.budgetState.shouldDowngrade
                          ? <Badge className="bg-amber-500/10 text-amber-500">Yes</Badge>
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routing Tab */}
        <TabsContent value="routing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Routing Hints</CardTitle>
              <CardDescription>Provider, model, latency, and determinism signals from the gate</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Max Latency</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Deterministic</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_VERDICTS.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.taskType}</TableCell>
                      <TableCell>{v.routingHints.preferredProvider ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{v.routingHints.preferredModel ?? "—"}</TableCell>
                      <TableCell>{v.routingHints.maxLatencyMs}ms</TableCell>
                      <TableCell><Badge variant="outline">{v.routingHints.routingClass}</Badge></TableCell>
                      <TableCell>
                        {v.routingHints.deterministicPath
                          ? <CheckCircle2 className="h-4 w-4 text-primary" />
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
