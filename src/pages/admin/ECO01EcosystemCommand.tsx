import { useState, useCallback, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Network, Terminal, Shield, FileCheck, Brain, Send, CheckCircle,
  XCircle, Clock, AlertTriangle, Cpu, Cloud, Smartphone, RefreshCw,
  ArrowRight, Zap, Lock, Activity, BarChart3, Layers, Radio,
  ArrowDown, ChevronDown, ChevronUp, Globe, HardDrive, Wifi,
  Database, Monitor, Settings, Eye,
} from "lucide-react";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { ECOSubNav } from "@/platform/admin/components/admin/ECOSubNav";
import { getEcosystemOrchestrator } from "@/lib/services/ecosystem-orchestrator";
import type {
  EcosystemCommand, CommandLifecycleState, RiskClass, LayerHealthReport,
  EcosystemEvent, EcosystemLayer,
} from "@/lib/services/ecosystem-orchestrator/types";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── Hook ────────────────────────────────────────────────────
function useEcosystem() {
  const orch = getEcosystemOrchestrator();
  const state = useSyncExternalStore(
    (cb) => orch.subscribe(cb),
    () => orch.getState(),
  );
  return { orch, state };
}

// ── Reusable Badges ─────────────────────────────────────────
function RiskBadge({ risk }: { risk: RiskClass }) {
  const c: Record<RiskClass, string> = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] ${c[risk]}`}>{risk}</Badge>;
}

function StateBadge({ state }: { state: CommandLifecycleState }) {
  const c: Record<string, string> = {
    submitted: "bg-muted text-muted-foreground",
    parsed: "bg-blue-500/10 text-blue-500",
    evaluated: "bg-blue-500/10 text-blue-500",
    routed: "bg-purple-500/10 text-purple-500",
    pending_approval: "bg-amber-500/10 text-amber-500",
    approved: "bg-emerald-500/10 text-emerald-500",
    dispatched: "bg-purple-500/10 text-purple-500",
    executing: "bg-blue-500/10 text-blue-500",
    verifying: "bg-blue-500/10 text-blue-500",
    completed: "bg-emerald-500/10 text-emerald-500",
    failed: "bg-red-500/10 text-red-500",
    rolled_back: "bg-orange-500/10 text-orange-500",
    denied: "bg-red-500/10 text-red-500",
  };
  return <Badge className={`text-[10px] border-0 ${c[state] ?? ""}`}>{state.replace(/_/g, " ")}</Badge>;
}

function LayerIcon({ layer }: { layer: EcosystemLayer | "orchestrator" }) {
  if (layer === "os") return <Cpu className="h-3 w-3 text-emerald-500" />;
  if (layer === "cloud") return <Cloud className="h-3 w-3 text-primary" />;
  if (layer === "app") return <Smartphone className="h-3 w-3 text-amber-500" />;
  return <Network className="h-3 w-3 text-muted-foreground" />;
}

// ── Layer Health Card (compact) ─────────────────────────────
function LayerCard({ report, color, icon: Icon }: { report: LayerHealthReport; color: string; icon: React.ElementType }) {
  const sc = { online: "bg-emerald-500", degraded: "bg-amber-500", offline: "bg-red-500", maintenance: "bg-blue-500" };
  return (
    <motion.div variants={fadeUp}>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-0.5 ${color}`} />
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${color}/10`}>
                <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold uppercase">{report.layer} Layer</CardTitle>
                <CardDescription className="text-[10px]">{report.servicesTotal} services</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${sc[report.status]}`} />
              <span className="text-[10px] font-medium text-muted-foreground capitalize">{report.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Health</span>
            <span className="text-lg font-bold text-foreground">{report.healthScore}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${report.healthScore >= 90 ? "bg-emerald-500" : report.healthScore >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${report.healthScore}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-xs font-bold text-emerald-500">{report.servicesHealthy}</p><p className="text-[9px] text-muted-foreground">Healthy</p></div>
            <div><p className="text-xs font-bold text-amber-500">{report.servicesDegraded}</p><p className="text-[9px] text-muted-foreground">Degraded</p></div>
            <div><p className="text-xs font-bold text-foreground">{report.activeWorkloads}</p><p className="text-[9px] text-muted-foreground">Workloads</p></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Execution Plan Visualizer ───────────────────────────────
function ExecutionPlanView({ cmd }: { cmd: EcosystemCommand }) {
  if (!cmd.routeDecision) return null;
  const steps = cmd.routeDecision.executionPlan;
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Execution Plan</p>
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40 border border-border/30">
              <LayerIcon layer={step.layer} />
              <span className="text-[9px] font-medium text-foreground">{step.layer.toUpperCase()}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/50" />}
          </div>
        ))}
      </div>
      {cmd.routeDecision.rationale && (
        <p className="text-[9px] text-muted-foreground italic mt-1">{cmd.routeDecision.rationale}</p>
      )}
    </div>
  );
}

// ── Verification Result View ────────────────────────────────
function VerificationView({ cmd }: { cmd: EcosystemCommand }) {
  if (!cmd.verificationResult) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Verification</p>
      <div className="flex flex-wrap gap-1">
        {cmd.verificationResult.checks.map((check, i) => (
          <Badge key={i} variant="outline" className={`text-[8px] ${check.passed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {check.passed ? "✓" : "✕"} {check.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ── Command Detail Card ─────────────────────────────────────
function CommandDetailCard({ cmd, onApprove, onDeny }: {
  cmd: EcosystemCommand;
  onApprove: (cmd: EcosystemCommand) => void;
  onDeny: (cmd: EcosystemCommand) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = !cmd.completedAt;
  return (
    <div className={`p-3 rounded-lg border space-y-2 ${isActive ? "border-primary/20 bg-primary/[0.02]" : "border-border/50 bg-muted/10"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground truncate">{cmd.input}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StateBadge state={cmd.state} />
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-muted transition-colors">
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {cmd.intent && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
          <span className="font-medium">{cmd.intent.intent.replace(/_/g, " ")}</span>
          <RiskBadge risk={cmd.intent.riskClass} />
          <span className="flex items-center gap-0.5">
            {cmd.intent.targetLayers.map((l) => <LayerIcon key={l} layer={l} />)}
          </span>
          {cmd.completedAt && <span>· {((cmd.completedAt - cmd.createdAt) / 1000).toFixed(1)}s</span>}
        </div>
      )}

      {cmd.state === "pending_approval" && (
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="default" onClick={() => onApprove(cmd)} className="h-7 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDeny(cmd)} className="h-7 text-xs">
            <XCircle className="h-3 w-3 mr-1" />Deny
          </Button>
          {cmd.dualAuthChallenge && (
            <Badge variant="outline" className="text-[9px] bg-red-500/5 text-red-400 border-red-500/20">
              <Lock className="h-2.5 w-2.5 mr-1" />Dual Authority
            </Badge>
          )}
        </div>
      )}

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-2 border-t border-border/30">
          <ExecutionPlanView cmd={cmd} />

          {/* Guarantees */}
          {cmd.guarantees.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Guarantees</p>
              <div className="flex flex-wrap gap-1">
                {cmd.guarantees.map((g, i) => {
                  const gc: Record<string, string> = {
                    verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    unverified: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    violated: "bg-red-500/10 text-red-500 border-red-500/20",
                    not_applicable: "bg-muted text-muted-foreground",
                  };
                  return (
                    <Badge key={i} variant="outline" className={`text-[8px] ${gc[g.status]}`}>
                      {g.status === "verified" ? "✓" : g.status === "violated" ? "✕" : "?"} {g.type.replace(/_/g, " ")}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <VerificationView cmd={cmd} />

          {/* Execution Result */}
          {cmd.executionResult && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Layer Results</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {Object.entries(cmd.executionResult.layerResults).map(([layer, result]) => (
                  <div key={layer} className={`flex items-center gap-1.5 p-1.5 rounded-md ${result.success ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-red-500/5 border border-red-500/10"}`}>
                    <LayerIcon layer={layer as EcosystemLayer} />
                    <span className="text-[9px] font-medium text-foreground uppercase">{layer}</span>
                    {result.success ? <CheckCircle className="h-2.5 w-2.5 text-emerald-500 ml-auto" /> : <XCircle className="h-2.5 w-2.5 text-red-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dual Auth Challenge Details */}
          {cmd.dualAuthChallenge && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Dual Authority Challenge</p>
              <div className="p-2 rounded-md bg-red-500/5 border border-red-500/10 space-y-1">
                <p className="text-[10px] text-foreground">{cmd.dualAuthChallenge.explanation}</p>
                <div className="flex flex-wrap gap-1">
                  {cmd.dualAuthChallenge.consequences.map((c, i) => (
                    <span key={i} className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <AlertTriangle className="h-2 w-2 text-amber-500" />{c}
                    </span>
                  ))}
                </div>
                <Badge variant="outline" className={`text-[8px] ${cmd.dualAuthChallenge.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : cmd.dualAuthChallenge.status === "denied" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-500"}`}>
                  {cmd.dualAuthChallenge.status}
                </Badge>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── Architecture Diagram ────────────────────────────────────
function ArchitectureDiagram() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Distributed Architecture
        </CardTitle>
        <CardDescription className="text-xs">Layer ownership: OS = Execution · Cloud = Truth + Intelligence · App = Control + Authority</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-4">
          {/* App Layer */}
          <div className="w-full max-w-xs p-3 rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.03] text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Smartphone className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground uppercase">Mobile App</span>
            </div>
            <p className="text-[9px] text-muted-foreground">Control + Security + Identity</p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {["Commands", "Approvals", "Alerts", "Visibility"].map((t) => (
                <Badge key={t} variant="outline" className="text-[7px] px-1 py-0 border-amber-500/20 text-amber-500/80">{t}</Badge>
              ))}
            </div>
          </div>

          <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
          <div className="px-3 py-1 rounded-md bg-muted/30 border border-border/30">
            <span className="text-[9px] font-medium text-muted-foreground">Secure API / Event Layer</span>
          </div>
          <ArrowDown className="h-4 w-4 text-muted-foreground/40" />

          {/* OS + Cloud */}
          <div className="flex gap-4 w-full max-w-lg">
            <div className="flex-1 p-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/[0.03] text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Cpu className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground uppercase">OS</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Execution Layer</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {["Runtime", "Hardware", "Sandbox", "UI"].map((t) => (
                  <Badge key={t} variant="outline" className="text-[7px] px-1 py-0 border-emerald-500/20 text-emerald-500/80">{t}</Badge>
                ))}
              </div>
            </div>
            <div className="flex-1 p-3 rounded-xl border-2 border-primary/30 bg-primary/[0.03] text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Cloud className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase">Cloud</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Truth + Brain</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {["Identity", "Sync", "Policy", "AI"].map((t) => (
                  <Badge key={t} variant="outline" className="text-[7px] px-1 py-0 border-primary/20 text-primary/80">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Event Timeline ──────────────────────────────────────────
function EventTimeline({ events }: { events: EcosystemEvent[] }) {
  const typeIcons: Record<string, React.ElementType> = {
    "command.submitted": Send, "command.parsed": Terminal, "command.routed": Network,
    "command.approved": CheckCircle, "command.denied": XCircle, "command.dispatched": Zap,
    "command.executed": Activity, "command.verified": Eye, "command.failed": AlertTriangle,
    "command.rolled_back": RefreshCw, "layer.status_changed": Layers, "layer.health_snapshot": BarChart3,
    "trust.alert": Shield, "dual_auth.challenge_issued": Lock, "dual_auth.response_received": Lock,
    "command.approval_required": Shield, "guarantee.violated": AlertTriangle,
  };
  const typeColors: Record<string, string> = {
    "command.submitted": "text-muted-foreground", "command.parsed": "text-blue-500",
    "command.routed": "text-purple-500", "command.approved": "text-emerald-500",
    "command.denied": "text-red-500", "command.dispatched": "text-purple-500",
    "command.executed": "text-emerald-500", "command.verified": "text-emerald-500",
    "command.failed": "text-red-500", "command.rolled_back": "text-orange-500",
    "layer.status_changed": "text-blue-500", "layer.health_snapshot": "text-primary",
    "trust.alert": "text-red-500", "dual_auth.challenge_issued": "text-red-500",
    "dual_auth.response_received": "text-amber-500", "guarantee.violated": "text-red-500",
    "command.approval_required": "text-amber-500",
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Radio className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No events yet. Submit commands to generate events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.slice(0, 50).map((ev) => {
        const Icon = typeIcons[ev.type] ?? Activity;
        const color = typeColors[ev.type] ?? "text-muted-foreground";
        return (
          <div key={ev.id} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors group">
            <div className="mt-0.5 flex-shrink-0">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-foreground">{ev.type.replace(/\./g, " › ")}</span>
                <LayerIcon layer={ev.sourceLayer} />
              </div>
              <p className="text-[9px] text-muted-foreground truncate">
                {Object.entries(ev.payload).filter(([k]) => k !== "commandId").map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ")}
              </p>
            </div>
            <span className="text-[9px] text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(ev.emittedAt).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════
export default function ECO01EcosystemCommand() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { orch, state } = useEcosystem();
  const [commandInput, setCommandInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!commandInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await orch.submitCommand(commandInput.trim(), "admin");
      setCommandInput("");
    } finally {
      setIsSubmitting(false);
    }
  }, [commandInput, isSubmitting, orch]);

  const handleApprove = useCallback(async (cmd: EcosystemCommand) => {
    if (cmd.dualAuthChallenge) {
      await orch.respondToChallenge(cmd.dualAuthChallenge.id, "approved");
    } else {
      await orch.approveCommand(cmd.id);
    }
  }, [orch]);

  const handleDeny = useCallback(async (cmd: EcosystemCommand) => {
    if (cmd.dualAuthChallenge) {
      await orch.respondToChallenge(cmd.dualAuthChallenge.id, "denied");
    } else {
      await orch.denyCommand(cmd.id);
    }
  }, [orch]);

  if (adminLoading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  const insights = orch.getCommandMemoryInsights();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <ECOSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Ecosystem Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Distributed OS · Cloud · App layer coordination</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => orch.refreshLayerHealth()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh Health
        </Button>
      </div>

      {/* Layer Health Ribbon */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LayerCard report={state.layers.os} color="bg-emerald-500" icon={Cpu} />
        <LayerCard report={state.layers.cloud} color="bg-primary" icon={Cloud} />
        <LayerCard report={state.layers.app} color="bg-amber-500" icon={Smartphone} />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="layers" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-0.5">
          <TabsTrigger value="layers" className="text-xs gap-1.5"><Layers className="h-3 w-3" />Layers</TabsTrigger>
          <TabsTrigger value="command" className="text-xs gap-1.5"><Terminal className="h-3 w-3" />Commands</TabsTrigger>
          <TabsTrigger value="authority" className="text-xs gap-1.5"><Shield className="h-3 w-3" />Dual Authority</TabsTrigger>
          <TabsTrigger value="guarantees" className="text-xs gap-1.5"><FileCheck className="h-3 w-3" />Contracts</TabsTrigger>
          <TabsTrigger value="events" className="text-xs gap-1.5"><Radio className="h-3 w-3" />Events</TabsTrigger>
          <TabsTrigger value="memory" className="text-xs gap-1.5"><Brain className="h-3 w-3" />Memory</TabsTrigger>
        </TabsList>

        {/* ═══ TAB: LAYERS OVERVIEW ═══════════════════════════════ */}
        <TabsContent value="layers" className="space-y-4">
          <ArchitectureDiagram />

          {/* Layer Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["os", "cloud", "app"] as EcosystemLayer[]).map((layer) => {
              const report = state.layers[layer];
              const colors = { os: "emerald", cloud: "primary", app: "amber" };
              const icons = { os: Cpu, cloud: Cloud, app: Smartphone };
              const Icon = icons[layer];
              const descriptions: Record<EcosystemLayer, string[]> = {
                os: [
                  "Executes local actions from dispatched commands",
                  "Manages app runtime, process scheduling, UI rendering",
                  "Enforces sandboxing and local security policies",
                  "Handles hardware abstraction and driver management",
                  "Collects telemetry and emits local events",
                  "Applies updates and manages local rollback",
                ],
                cloud: [
                  "Stores canonical user identity and account state",
                  "Coordinates sync across all connected devices",
                  "Evaluates trust scores and analyzes threats",
                  "Plans and orchestrates update rollouts",
                  "Processes events and routes notifications",
                  "Manages policy engine and feature flags",
                ],
                app: [
                  "Provides remote command input and monitoring",
                  "Handles critical action approvals and denials",
                  "Shows live device status and trust posture",
                  "Delivers alerts, notifications, and explanations",
                  "Controls security shield and trust visibility",
                  "Manages AI chat and conversational interface",
                ],
              };

              return (
                <Card key={layer}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${layer === "cloud" ? "text-primary" : `text-${colors[layer]}-500`}`} />
                      {layer.toUpperCase()} Layer Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {descriptions[layer].map((d, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="h-3 w-3 text-emerald-500/60 mt-0.5 flex-shrink-0" />
                          <span className="text-[10px] text-muted-foreground">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <p className="text-[9px] text-muted-foreground mb-1.5">Active Services</p>
                      <div className="flex flex-wrap gap-1">
                        {report.responsibilities.map((s) => (
                          <Badge key={s} variant="outline" className="text-[7px] px-1 py-0">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Golden Rule Card */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Golden Feature Placement Rule</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-emerald-500">OS →</span> Low-latency, device-local execution, hardware interaction
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-primary">Cloud →</span> Global state, cross-device intelligence, sync, coordination
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-amber-500">App →</span> User visibility, remote control, approval, trust confirmation
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: COMMAND CENTER ════════════════════════════════ */}
        <TabsContent value="command" className="space-y-4">
          {/* Command Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command... (e.g. 'Optimize performance', 'Deploy update', 'Lock device', 'Revoke device')"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleSubmit} disabled={!commandInput.trim() || isSubmitting} size="sm">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {isSubmitting ? "Routing..." : "Submit"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Check status", "Optimize performance", "Fix sync issues", "Deploy update", "Lock device", "Revoke device", "Create backup", "Restart device"].map((t) => (
                  <button key={t} onClick={() => setCommandInput(t)} className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">{t}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Commands */}
          {state.activeCommands.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Active Commands ({state.activeCommands.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {state.activeCommands.map((cmd) => (
                  <CommandDetailCard key={cmd.id} cmd={cmd} onApprove={handleApprove} onDeny={handleDeny} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Command History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Command History ({state.commandHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.commandHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No commands yet. Submit one above.</p>
              ) : (
                <div className="space-y-2">
                  {state.commandHistory.slice(0, 20).map((cmd) => (
                    <CommandDetailCard key={cmd.id} cmd={cmd} onApprove={handleApprove} onDeny={handleDeny} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: DUAL AUTHORITY ════════════════════════════════ */}
        <TabsContent value="authority" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                Dual Authority Challenges
              </CardTitle>
              <CardDescription className="text-xs">Critical actions requiring out-of-band approval — bank-level security</CardDescription>
            </CardHeader>
            <CardContent>
              {state.pendingChallenges.length === 0 && state.commandHistory.filter((c) => c.dualAuthChallenge).length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No dual authority challenges.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Commands like "Revoke device" or "Wipe fleet" trigger dual authority.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.pendingChallenges.map((ch) => (
                    <div key={ch.id} className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-foreground">{ch.action.replace(/_/g, " ")}</span>
                        </div>
                        <RiskBadge risk={ch.riskLevel} />
                      </div>
                      <p className="text-xs text-muted-foreground">{ch.explanation}</p>
                      <div>
                        <p className="text-[10px] font-medium text-foreground mb-1">Consequences:</p>
                        <ul className="space-y-0.5">
                          {ch.consequences.map((c, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                              <AlertTriangle className="h-2.5 w-2.5 text-amber-500 mt-0.5 flex-shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => {
                          const cmd = state.activeCommands.find((c) => c.id === ch.commandId);
                          if (cmd) handleApprove(cmd);
                        }}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve Action
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                          const cmd = state.activeCommands.find((c) => c.id === ch.commandId);
                          if (cmd) handleDeny(cmd);
                        }}>
                          <XCircle className="h-3 w-3 mr-1" />Deny
                        </Button>
                        <span className="text-[9px] text-muted-foreground ml-auto">Expires: {new Date(ch.expiresAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  {state.commandHistory.filter((c) => c.dualAuthChallenge).slice(0, 10).map((cmd) => (
                    <div key={cmd.id} className="p-3 rounded-lg border border-border/50 bg-muted/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{cmd.dualAuthChallenge!.action.replace(/_/g, " ")}</span>
                        <Badge variant="outline" className={`text-[8px] ${cmd.dualAuthChallenge!.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                          {cmd.dualAuthChallenge!.status}
                        </Badge>
                      </div>
                      <StateBadge state={cmd.state} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critical Actions Reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Critical Actions Requiring Dual Authority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Device Revoke", "Fleet Wipe", "Security Downgrade", "Force Rollout", "Delete All Data", "Trust Override", "Policy Disable", "Encryption Disable", "Admin Revoke"].map((action) => (
                  <div key={action} className="flex items-center gap-1.5 p-2 rounded-md bg-red-500/[0.03] border border-red-500/10">
                    <Lock className="h-3 w-3 text-red-400" />
                    <span className="text-[10px] font-medium text-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: CONTRACTS & GUARANTEES ════════════════════════ */}
        <TabsContent value="guarantees" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Feature Ownership Contracts
              </CardTitle>
              <CardDescription className="text-xs">Layer ownership — no duplication of responsibility</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Feature</TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-emerald-500" />OS</span></TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1"><Cloud className="h-3 w-3 text-primary" />Cloud</span></TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1"><Smartphone className="h-3 w-3 text-amber-500" />App</span></TableHead>
                    <TableHead className="text-[10px]">Approval</TableHead>
                    <TableHead className="text-[10px]">Rollback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.contracts.map((c) => (
                    <TableRow key={c.featureName}>
                      <TableCell className="text-xs font-medium">{c.featureName}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[160px]">{c.osOwnership}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[160px]">{c.cloudOwnership}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[160px]">{c.appOwnership}</TableCell>
                      <TableCell>{c.approvalRequired ? <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">Required</Badge> : <Badge variant="outline" className="text-[8px]">No</Badge>}</TableCell>
                      <TableCell>{c.rollbackExists ? <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Yes</Badge> : <Badge variant="outline" className="text-[8px] bg-red-500/10 text-red-400 border-red-500/20">No</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* System Guarantee Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                System Guarantee Engine
              </CardTitle>
              <CardDescription className="text-xs">Every command is validated against these guarantees before execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { type: "No Data Loss", desc: "Validates no user data will be permanently lost", icon: Database },
                  { type: "Rollback Available", desc: "Confirms a rollback path exists for the action", icon: RefreshCw },
                  { type: "No Trust Downgrade", desc: "Ensures trust posture won't degrade silently", icon: Shield },
                  { type: "Verification Path", desc: "Post-execution verification checks are configured", icon: Eye },
                  { type: "No Service Disruption", desc: "Critical services remain available during execution", icon: Activity },
                  { type: "Audit Trail Complete", desc: "All actions are fully logged and traceable", icon: FileCheck },
                ].map((g) => (
                  <div key={g.type} className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <g.icon className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-foreground">{g.type}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{g.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Guarantee Checks */}
          {state.commandHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Recent Guarantee Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {state.commandHistory.slice(0, 5).map((cmd) => (
                  <div key={cmd.id} className="p-2 rounded-lg border border-border/30 bg-muted/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground truncate">{cmd.input}</span>
                      <StateBadge state={cmd.state} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cmd.guarantees.map((g, i) => {
                        const gc: Record<string, string> = {
                          verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          unverified: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          violated: "bg-red-500/10 text-red-500 border-red-500/20",
                          not_applicable: "bg-muted text-muted-foreground",
                        };
                        return <Badge key={i} variant="outline" className={`text-[8px] ${gc[g.status]}`}>{g.status === "verified" ? "✓" : "?"} {g.type.replace(/_/g, " ")}</Badge>;
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ TAB: EVENT TIMELINE ════════════════════════════════ */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary" />
                    Ecosystem Event Stream
                  </CardTitle>
                  <CardDescription className="text-xs">{state.recentEvents.length} events captured · correlation-linked · versioned</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">{state.recentEvents.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EventTimeline events={state.recentEvents} />
            </CardContent>
          </Card>

          {/* Event Type Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Event Type Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {[
                  { type: "command.submitted", color: "text-muted-foreground" },
                  { type: "command.parsed", color: "text-blue-500" },
                  { type: "command.routed", color: "text-purple-500" },
                  { type: "command.approved", color: "text-emerald-500" },
                  { type: "command.denied", color: "text-red-500" },
                  { type: "command.dispatched", color: "text-purple-500" },
                  { type: "command.executed", color: "text-emerald-500" },
                  { type: "command.verified", color: "text-emerald-500" },
                  { type: "command.failed", color: "text-red-500" },
                  { type: "layer.status_changed", color: "text-blue-500" },
                  { type: "dual_auth.challenge", color: "text-red-500" },
                  { type: "trust.alert", color: "text-red-500" },
                ].map((e) => (
                  <div key={e.type} className="flex items-center gap-1.5 text-[9px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${e.color.replace("text-", "bg-")}`} />
                    <span className="text-muted-foreground">{e.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB: COMMAND MEMORY ════════════════════════════════ */}
        <TabsContent value="memory" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Commands", value: String(insights.totalCommands), icon: Terminal, color: "text-primary" },
              { label: "Success Rate", value: `${insights.successRate}%`, icon: CheckCircle, color: "text-emerald-500" },
              { label: "Avg Duration", value: insights.avgDuration > 0 ? `${(insights.avgDuration / 1000).toFixed(1)}s` : "—", icon: Clock, color: "text-amber-500" },
              { label: "Critical Cmds", value: String(insights.riskDistribution.critical), icon: AlertTriangle, color: "text-red-500" },
            ].map((m) => (
              <motion.div key={m.label} variants={fadeUp}>
                <Card><CardContent className="p-4 flex items-center gap-3">
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                  <div><p className="text-lg font-bold text-foreground">{m.value}</p><p className="text-[10px] text-muted-foreground">{m.label}</p></div>
                </CardContent></Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {(["low", "medium", "high", "critical"] as RiskClass[]).map((r) => {
                  const total = insights.totalCommands || 1;
                  const count = insights.riskDistribution[r];
                  const pct = Math.round((count / total) * 100);
                  const colors = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-orange-500", critical: "bg-red-500" };
                  return (
                    <div key={r} className="text-center space-y-1">
                      <div className="h-16 bg-muted/30 rounded-md relative overflow-hidden flex items-end justify-center">
                        <div className={`w-full rounded-t-sm ${colors[r]} transition-all duration-500`} style={{ height: `${Math.max(pct, 5)}%` }} />
                      </div>
                      <p className="text-[10px] font-medium text-foreground capitalize">{r}</p>
                      <p className="text-[9px] text-muted-foreground">{count} ({pct}%)</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Intents */}
          {insights.topIntents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Top Command Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.topIntents.map((t) => (
                  <div key={t.intent} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-foreground">{t.intent.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-[10px]">{t.count}×</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Memory Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />Command Memory ({state.commandMemory.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {state.commandMemory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Submit commands to build the pattern library.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-[10px]">Intent</TableHead>
                    <TableHead className="text-[10px]">Risk</TableHead>
                    <TableHead className="text-[10px]">Outcome</TableHead>
                    <TableHead className="text-[10px]">Duration</TableHead>
                    <TableHead className="text-[10px]">Tags</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {state.commandMemory.slice(0, 20).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs font-medium">{m.intent.replace(/_/g, " ")}</TableCell>
                        <TableCell><RiskBadge risk={m.riskClass} /></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] ${m.outcome === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>{m.outcome}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{(m.durationMs / 1000).toFixed(1)}s</TableCell>
                        <TableCell><div className="flex flex-wrap gap-0.5">{m.patternTags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[8px] px-1 py-0">{t}</Badge>)}</div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
