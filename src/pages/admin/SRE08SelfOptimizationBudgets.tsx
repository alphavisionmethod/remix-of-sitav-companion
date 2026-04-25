// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE08: Self-Optimization & Performance Budgets
// Measure → Analyze → Improve → Validate → Learn cycle + budget enforcement
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, Gauge, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Lightbulb, Wrench, Shield, Zap, DollarSign, Cpu, Clock, Activity,
  ArrowRight, BarChart3
} from "lucide-react";
import { getPerformanceBudgets, getOptimizationProposals, type PerformanceBudget, type OptimizationProposal } from "@/lib/services/engineering-governance";

const BUDGET_ICON: Record<string, React.ElementType> = {
  cpu: Cpu, memory: Activity, sync_latency: Clock, api_response: Zap,
  startup: RefreshCw, agent_cost: DollarSign, rollout_degradation: TrendingUp, queue_growth: BarChart3,
};

const STATUS_CFG: Record<string, { color: string; border: string }> = {
  within: { color: "text-trust-safe", border: "" },
  warning: { color: "text-amber-400", border: "border-amber-500/30" },
  exceeded: { color: "text-destructive", border: "border-destructive/30" },
};

const PROPOSAL_ICON: Record<string, React.ElementType> = {
  debt_cleanup: Wrench, reliability_fix: Shield, policy_tuning: RefreshCw,
  architecture_warning: AlertTriangle, cost_reduction: DollarSign, performance_improvement: Zap,
};

const PROPOSAL_COLOR: Record<string, string> = {
  debt_cleanup: "text-cyan-400", reliability_fix: "text-trust-safe", policy_tuning: "text-purple-400",
  architecture_warning: "text-amber-400", cost_reduction: "text-emerald-400", performance_improvement: "text-blue-400",
};

const OPTIMIZATION_LOOP = [
  { step: "Measure", icon: Gauge, desc: "Collect telemetry, support signals, incident trends" },
  { step: "Analyze", icon: Activity, desc: "Identify patterns, regressions, cost anomalies" },
  { step: "Improve", icon: Lightbulb, desc: "Generate optimization & reliability proposals" },
  { step: "Validate", icon: CheckCircle2, desc: "Verify improvements via simulation & staging" },
  { step: "Learn", icon: TrendingUp, desc: "Update memory, policies, and preventive rules" },
];

export default function SRE08SelfOptimizationBudgets() {
  const [budgets] = useState<PerformanceBudget[]>(getPerformanceBudgets);
  const [proposals] = useState<OptimizationProposal[]>(getOptimizationProposals);

  const withinBudget = budgets.filter(b => b.status === "within").length;
  const warningBudgets = budgets.filter(b => b.status === "warning").length;
  const activeProposals = proposals.filter(p => p.status !== "completed" && p.status !== "rejected").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={TrendingUp}
        title="Self-Optimization & Performance Budgets"
        subtitle="Continuous improvement cycle with enforced resource budgets"
        accent="trust"
      />

      {/* Optimization Loop Visual */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Self-Optimization Loop</p>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
              {OPTIMIZATION_LOOP.map((step, i) => (
                <div key={step.step} className="flex items-center gap-1 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mx-auto mb-1">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-[10px] font-semibold text-foreground">{step.step}</p>
                    <p className="text-[8px] text-muted-foreground max-w-16 leading-tight">{step.desc.split(",")[0]}</p>
                  </div>
                  {i < OPTIMIZATION_LOOP.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mx-1" />}
                </div>
              ))}
              <ArrowRight className="h-3 w-3 text-primary shrink-0 mx-1" />
              <span className="text-[10px] text-primary font-semibold shrink-0">Repeat</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Budgets OK", value: `${withinBudget}/${budgets.length}`, icon: Gauge, color: "text-trust-safe" },
          { label: "Warnings", value: warningBudgets, icon: AlertTriangle, color: warningBudgets > 0 ? "text-amber-400" : "text-trust-safe" },
          { label: "Active Proposals", value: activeProposals, icon: Lightbulb, color: "text-primary" },
          { label: "Completed", value: proposals.filter(p => p.status === "completed").length, icon: CheckCircle2, color: "text-sita-gold" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="budgets">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="budgets" className="text-xs gap-1.5"><Gauge className="h-3 w-3" />Performance Budgets ({budgets.length})</TabsTrigger>
          <TabsTrigger value="proposals" className="text-xs gap-1.5"><Lightbulb className="h-3 w-3" />Optimization Proposals ({proposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="mt-4 space-y-3">
          {budgets.map((budget, i) => {
            const BIcon = BUDGET_ICON[budget.category] || Gauge;
            const cfg = STATUS_CFG[budget.status];
            const pct = (budget.current / budget.limit) * 100;

            return (
              <motion.div key={budget.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`border-border/50 bg-card/80 ${cfg.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/40 shrink-0">
                        <BIcon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{budget.metric}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={budget.status === "within" ? "outline" : budget.status === "warning" ? "secondary" : "destructive"} className="text-[10px] h-5">
                              {budget.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5">{budget.enforcement.replace(/_/g, " ")}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(pct, 100)} className={`h-1.5 flex-1 ${pct > 90 ? "[&>div]:bg-destructive" : pct > 75 ? "[&>div]:bg-amber-500" : ""}`} />
                          <span className={`text-xs font-mono ${cfg.color}`}>
                            {budget.current}{budget.unit} / {budget.limit}{budget.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="proposals" className="mt-4 space-y-3">
          {proposals.map((proposal, i) => {
            const PIcon = PROPOSAL_ICON[proposal.category] || Lightbulb;
            return (
              <motion.div key={proposal.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-border/50 bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/40 shrink-0">
                        <PIcon className={`h-5 w-5 ${PROPOSAL_COLOR[proposal.category] || "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-semibold text-foreground">{proposal.title}</p>
                          <Badge variant={
                            proposal.status === "completed" ? "default" :
                            proposal.status === "in_progress" ? "secondary" :
                            proposal.status === "approved" ? "outline" :
                            proposal.status === "rejected" ? "destructive" : "outline"
                          } className="text-[10px] h-5">{proposal.status.replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{proposal.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-[10px] h-4">{proposal.category.replace(/_/g, " ")}</Badge>
                          <span className="text-[10px] text-muted-foreground">Impact: <span className="text-foreground">{proposal.impact}</span></span>
                          <span className="text-[10px] text-muted-foreground">Effort: <span className="text-foreground">{proposal.effort}</span></span>
                          <span className="text-[10px] text-muted-foreground">Confidence: <span className="font-mono text-foreground">{(proposal.confidence * 100).toFixed(0)}%</span></span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
