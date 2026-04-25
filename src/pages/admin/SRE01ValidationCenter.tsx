// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE01: Multi-Layer Validation Center
// 10-stage pipeline visualization with author≠reviewer enforcement
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2,
  GitBranch, Eye, Code, TestTube, Lock, Scale, Cpu, Rocket, Heart, RotateCcw, Ban
} from "lucide-react";
import { getValidationPipelines, type ValidationPipelineRun, type StageStatus } from "@/lib/services/engineering-governance";

const STAGE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  author_proposal: { label: "Author Proposal", icon: Code, color: "text-blue-400" },
  independent_review: { label: "Independent Review", icon: Eye, color: "text-purple-400" },
  static_analysis: { label: "Static Analysis", icon: GitBranch, color: "text-cyan-400" },
  test_generation: { label: "Test Generation", icon: TestTube, color: "text-emerald-400" },
  security_scan: { label: "Security Scan", icon: Lock, color: "text-red-400" },
  policy_gate: { label: "Policy Gate", icon: Scale, color: "text-amber-400" },
  simulation: { label: "Simulation", icon: Cpu, color: "text-indigo-400" },
  canary_rollout: { label: "Canary Rollout", icon: Rocket, color: "text-orange-400" },
  health_check: { label: "Health Check", icon: Heart, color: "text-pink-400" },
  rollback_ready: { label: "Rollback Ready", icon: RotateCcw, color: "text-teal-400" },
};

const STATUS_BADGE: Record<StageStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType; label: string }> = {
  passed: { variant: "default", icon: CheckCircle2, label: "Passed" },
  failed: { variant: "destructive", icon: XCircle, label: "Failed" },
  running: { variant: "secondary", icon: Loader2, label: "Running" },
  pending: { variant: "outline", icon: Clock, label: "Pending" },
  skipped: { variant: "outline", icon: Clock, label: "Skipped" },
  blocked: { variant: "destructive", icon: Ban, label: "Blocked" },
};

export default function SRE01ValidationCenter() {
  const [pipelines] = useState<ValidationPipelineRun[]>(getValidationPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState<string>(pipelines[0]?.id || "");

  const selected = pipelines.find(p => p.id === selectedPipeline);
  const passedCount = pipelines.filter(p => p.overall_status === "passed").length;
  const blockedCount = pipelines.filter(p => p.overall_status === "blocked" || p.overall_status === "failed").length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={ShieldCheck}
        title="Multi-Layer Validation Center"
        subtitle="10-stage validation pipeline — no single agent can approve its own work"
        accent="trust"
      />

      {/* Enforcement Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-trust-verified/20 bg-trust-verified/5 p-4 flex items-center gap-3"
      >
        <ShieldCheck className="h-5 w-5 text-trust-safe shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Author ≠ Reviewer Enforcement: <span className="text-trust-safe">ACTIVE</span></p>
          <p className="text-xs text-muted-foreground">No agent can author, approve, deploy, and validate its own work. All {pipelines.length} active pipelines comply.</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Pipelines", value: pipelines.length, icon: GitBranch, color: "text-primary" },
          { label: "Passed", value: passedCount, icon: CheckCircle2, color: "text-trust-safe" },
          { label: "Blocked/Failed", value: blockedCount, icon: AlertTriangle, color: "text-destructive" },
          { label: "Avg Confidence", value: `${Math.round(pipelines.reduce((s, p) => s + p.stages.filter(st => st.status === "passed").reduce((a, st) => a + st.confidence, 0) / Math.max(p.stages.filter(st => st.status === "passed").length, 1), 0) / pipelines.length * 100)}%`, icon: ShieldCheck, color: "text-sita-gold" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={selectedPipeline} onValueChange={setSelectedPipeline}>
        <TabsList className="bg-muted/30 flex-wrap h-auto gap-1">
          {pipelines.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="text-xs gap-1.5">
              {p.overall_status === "passed" && <CheckCircle2 className="h-3 w-3 text-trust-safe" />}
              {p.overall_status === "blocked" && <Ban className="h-3 w-3 text-destructive" />}
              {p.overall_status === "failed" && <XCircle className="h-3 w-3 text-destructive" />}
              {p.overall_status === "in_progress" && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
              {p.change_title}
            </TabsTrigger>
          ))}
        </TabsList>

        {selected && (
          <TabsContent value={selected.id} className="mt-4 space-y-4">
            {/* Pipeline Header */}
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.change_id}: {selected.change_title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Author: <span className="text-primary">{selected.author_agent_id}</span>
                      {" · "}Reviewer: <span className="text-purple-400">{selected.reviewer_agent_id || "Pending"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.author_equals_reviewer ? (
                      <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> VIOLATION: Author = Reviewer</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-trust-verified/30 text-trust-safe"><CheckCircle2 className="h-3 w-3" /> Separation Verified</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 10-Stage Pipeline */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Validation Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selected.stages.map((stage, i) => {
                  const meta = STAGE_META[stage.stage];
                  const badge = STATUS_BADGE[stage.status];
                  const StIcon = meta.icon;
                  const BIcon = badge.icon;
                  const passedStages = selected.stages.filter(s => s.status === "passed").length;
                  return (
                    <motion.div key={stage.stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40">
                        <StIcon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{meta.label}</p>
                          <Badge variant={badge.variant} className="text-[10px] h-5 gap-1">
                            <BIcon className={`h-3 w-3 ${stage.status === "running" ? "animate-spin" : ""}`} />
                            {badge.label}
                          </Badge>
                        </div>
                        {stage.findings.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">{stage.findings.join(", ")}</p>
                        )}
                        {stage.blockers.length > 0 && (
                          <p className="text-xs text-destructive mt-0.5">{stage.blockers.join(", ")}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {stage.confidence > 0 && <p className="text-xs font-mono text-muted-foreground">{Math.round(stage.confidence * 100)}%</p>}
                        {stage.duration_ms ? <p className="text-[10px] text-muted-foreground">{stage.duration_ms > 60000 ? `${(stage.duration_ms / 60000).toFixed(1)}m` : `${(stage.duration_ms / 1000).toFixed(1)}s`}</p> : null}
                      </div>
                      {i < selected.stages.length - 1 && (
                        <div className="absolute left-[2.35rem] top-full h-2 w-px bg-border/50 hidden" />
                      )}
                    </motion.div>
                  );
                })}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Pipeline Progress</span>
                    <span>{selected.stages.filter(s => s.status === "passed").length}/{selected.stages.length} stages</span>
                  </div>
                  <Progress value={(selected.stages.filter(s => s.status === "passed").length / selected.stages.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
