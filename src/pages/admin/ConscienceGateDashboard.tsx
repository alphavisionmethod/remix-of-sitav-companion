// ═══════════════════════════════════════════════════════════════
// SITA OS — ConscienceGate Admin Dashboard
// Inspectable + Governable surface for the ConscienceGate OS primitive
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
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
import type { GateDecision, GateVerdict, EvidenceState, BudgetState, RoutingHints } from "@/lib/core-services/conscience-gate/conscience-gate";
import { supabase } from "@/integrations/supabase/client";
// Local row type used by this dashboard — keeps a stable `id` for table keys.
type DashboardVerdict = GateVerdict & { id: string };

// Receipt row shape from ai_inference_receipts (only fields we read here)
interface InferenceReceiptRow {
  id: string;
  capability_id: string | null;
  prompt_family: string | null;
  route_reason: string | null;
  verification_outcome: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_estimate_cents: number | null;
  created_at: string;
}

const DEFAULT_EVIDENCE: EvidenceState = {
  sufficient: true,
  sourcesAvailable: 1,
  sourcesRequired: 1,
  missingTypes: [],
};
const DEFAULT_BUDGET: BudgetState = {
  allowed: true,
  estimatedCostCents: 0,
  budgetClass: "standard",
  remainingBudgetCents: 0,
  shouldDowngrade: false,
};
const DEFAULT_ROUTING: RoutingHints = {
  maxLatencyMs: 5000,
  routingClass: "standard",
  deterministicPath: false,
};

function withDashboardId(v: GateVerdict, idx: number): DashboardVerdict {
  const stableId = (v as Partial<DashboardVerdict>).id ?? `${v.correlationId ?? "demo"}-${idx}`;
  return { ...v, id: stableId };
}

// Real-data path: ai_inference_receipts.verification_outcome stores live gate
// decisions. Falls back to seed verdicts when no real receipts exist yet.
function mapReceiptToVerdict(r: InferenceReceiptRow): DashboardVerdict {
  const outcome = (r.verification_outcome || "pass").toLowerCase();
  const decision: GateDecision = ["pass", "caveat", "block", "refuse"].includes(outcome)
    ? (outcome as GateDecision) : "pass";
  return {
    id: r.id,
    decision,
    taskType: r.capability_id ?? r.prompt_family ?? "ai-task",
    riskClass: "standard",
    evidenceState: DEFAULT_EVIDENCE,
    budgetState: { ...DEFAULT_BUDGET, estimatedCostCents: r.cost_estimate_cents ?? 0 },
    routingHints: DEFAULT_ROUTING,
    retrievalRequired: false,
    critiqueRequired: false,
    approvalRequired: decision === "block" || decision === "refuse",
    deterministicRequired: false,
    reasons: r.route_reason ? [r.route_reason] : [],
    timestamp: r.created_at,
    correlationId: r.id,
  };
}

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
  const [liveVerdicts, setLiveVerdicts] = useState<DashboardVerdict[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ai_inference_receipts")
        .select("id, capability_id, prompt_family, route_reason, verification_outcome, input_tokens, output_tokens, cost_estimate_cents, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setLiveVerdicts(([] as never[]).map(withDashboardId));
        setUsingFallback(true);
      } else {
        setLiveVerdicts(data.map(mapReceiptToVerdict));
        setUsingFallback(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const VERDICTS: DashboardVerdict[] = liveVerdicts.length > 0
    ? liveVerdicts
    : ([] as never[]).map(withDashboardId);

  const stats = useMemo(() => {
    const counts: Record<GateDecision, number> = { pass: 0, caveat: 0, block: 0, refuse: 0 };
    ([] as never[]).forEach((v) => counts[v.decision]++);
    const total = ([] as never[]).length;
    return { counts, total, passRate: total ? Math.round((counts.pass / total) * 100) : 0 };
  }, [VERDICTS]);

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
                  {([] as never[]).map((v) => (
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
              {([] as never[]).map((v) => (
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
                  {([] as never[]).map((v) => (
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
                  {([] as never[]).map((v) => (
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
