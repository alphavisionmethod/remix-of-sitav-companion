// ═══════════════════════════════════════════════════════════════
// SITA OS — CI/CD Pipeline Board (FCC03)
// Pipeline stage visualization: Code → Build → Test → Scan → Sign → Stage → Canary → Prod
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch, CheckCircle2, Clock, XCircle, Play, Pause, RotateCcw,
  Package, Shield, FileSignature, Server, BarChart3, Rocket, Code, TestTube,
  AlertTriangle, ArrowRight, Loader2
} from "lucide-react";
import { founderOrchestrator, type PipelineRun, type PipelineStage } from "@/lib/services/founder-orchestrator";

const STAGE_ICONS: Record<string, React.ElementType> = {
  code: Code, build: Package, test: TestTube, integration: TestTube,
  scan: Shield, sign: FileSignature, stage: Server, canary: BarChart3, prod: Rocket,
};

const STAGE_STATUS_STYLES = {
  pending: "border-white/10 bg-white/[0.02] text-muted-foreground",
  running: "border-sita-gold/30 bg-sita-gold/5 text-sita-gold",
  passed: "border-trust-safe/30 bg-trust-safe/5 text-trust-safe",
  failed: "border-destructive/30 bg-destructive/5 text-destructive",
  skipped: "border-white/5 bg-white/[0.01] text-muted-foreground/50",
};

const STATUS_ICONS = {
  pending: Clock, running: Loader2, passed: CheckCircle2, failed: XCircle, skipped: Clock,
};

export default function FCC03CICDPipelineBoard() {
  const pipelines = founderOrchestrator.getPipelines();
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineRun>(pipelines[0]);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={GitBranch}
        title="CI/CD Pipeline Orchestrator"
        subtitle="Build → Test → Scan → Sign → Stage → Canary → Production"
        accent="trust"
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Rollback
          </Button>
          <Button size="sm" className="gap-1.5">
            <Rocket className="h-3.5 w-3.5" /> Trigger Build
          </Button>
        </div>
      </AdminPageHeader>

      {/* Pipeline Selector */}
      <div className="flex gap-3">
        {pipelines.map(p => (
          <Card
            key={p.id}
            onClick={() => setSelectedPipeline(p)}
            className={`cursor-pointer transition-all flex-1 ${selectedPipeline.id === p.id ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium font-mono">{p.branch}</span>
                <Badge variant={p.status === "running" ? "default" : p.status === "passed" ? "outline" : "destructive"} className="text-[10px] ml-auto">
                  {p.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="font-mono">{p.commit}</span>
                <span>•</span>
                <span>{p.trigger}</span>
                <span>•</span>
                <span>{new Date(p.started_at).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Stages */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            Pipeline Stages — {selectedPipeline.branch}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stage Flow */}
          <div className="flex items-stretch gap-1 overflow-x-auto pb-4">
            {selectedPipeline.stages.map((stage, i) => {
              const StageIcon = STAGE_ICONS[stage.id] || Code;
              const StatusIcon = STATUS_ICONS[stage.status];
              const styles = STAGE_STATUS_STYLES[stage.status];
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center"
                >
                  <div className={`rounded-xl border p-4 min-w-[140px] ${styles}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <StageIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <StatusIcon className={`h-3.5 w-3.5 ${stage.status === "running" ? "animate-spin" : ""}`} />
                      <span className="text-[10px] capitalize">{stage.status}</span>
                    </div>
                    {stage.duration_ms && (
                      <p className="text-[10px] text-muted-foreground">{(stage.duration_ms / 1000).toFixed(1)}s</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${stage.gate_result === "pass" ? "bg-trust-safe" : stage.gate_result === "fail" ? "bg-destructive" : "bg-muted-foreground/30"}`} />
                      <span className="text-[9px] text-muted-foreground">Gate: {stage.gate_result}</span>
                    </div>
                  </div>
                  {i < selectedPipeline.stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 mx-1 shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Evidence Details */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Stage Evidence</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedPipeline.stages.filter(s => s.evidence.length > 0).map(stage => (
                <div key={stage.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    {(() => { const I = STAGE_ICONS[stage.id] || Code; return <I className="h-3 w-3 text-muted-foreground" />; })()}
                    <span className="text-xs font-medium">{stage.name}</span>
                  </div>
                  <div className="space-y-0.5">
                    {stage.evidence.map((e, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5 text-trust-safe shrink-0" /> {e}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileSignature className="h-4 w-4 text-sita-gold" />
              <span className="text-sm font-medium">Artifact Signing</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>SHA-256: <span className="font-mono text-trust-safe">verified</span></p>
              <p>Chain: <span className="font-mono text-trust-safe">valid</span></p>
              <p>Timestamp: <span className="font-mono">{new Date().toISOString()}</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Canary Metrics</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Error rate: <span className="text-trust-safe">0.02%</span></p>
              <p>Latency p99: <span className="text-foreground">180ms</span></p>
              <p>Traffic: <span className="text-foreground">5% of production</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Rollback Status</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Previous build: <span className="font-mono text-foreground">b8e1f4a</span></p>
              <p>Rollback ready: <span className="text-trust-safe">Yes</span></p>
              <p>Auto-rollback: <span className="text-sita-gold">Error rate &gt; 1%</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
