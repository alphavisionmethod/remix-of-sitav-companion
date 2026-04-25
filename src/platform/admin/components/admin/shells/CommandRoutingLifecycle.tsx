import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor, Smartphone, Cloud, ArrowRight, Play, Pause, RotateCcw,
  Radio, FileSearch, BrainCircuit, ShieldCheck, Cpu, CheckCircle,
  ChevronDown, ChevronUp, Zap, AlertTriangle, RefreshCw, Trash2
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  surface: "os" | "cloud" | "app" | "any";
  color: string;
  bg: string;
  border: string;
  description: string;
  actions: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "origin", label: "Origin", sublabel: "Command Source", icon: Radio,
    surface: "any", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    description: "A command is initiated from one of three surfaces: Mobile App, OS local command palette, or Admin control plane.",
    actions: ["Identify source surface", "Attach origin tag (os_local / app_remote / admin_control_plane)", "Package intent + target + scope", "Emit command.initiated event"],
  },
  {
    id: "parse", label: "Cloud Parse", sublabel: "Intent Analysis", icon: FileSearch,
    surface: "cloud", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    description: "Cloud receives the command and parses intent, target, scope, risk level, required approvals, execution owner, and rollback path.",
    actions: ["Parse intent and target", "Evaluate scope boundaries", "Classify risk level", "Determine execution owner", "Identify verification plan", "Map rollback path"],
  },
  {
    id: "plan", label: "Cloud Plan", sublabel: "Orchestration", icon: BrainCircuit,
    surface: "cloud", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    description: "Cloud creates an execution plan: which services participate, whether approval is needed, whether simulation/dry-run should run first.",
    actions: ["Identify participating services", "Determine if app-visible only", "Check if OS execution needed", "Evaluate approval requirement", "Run simulation/dry-run if needed", "Define success telemetry criteria"],
  },
  {
    id: "approval", label: "App Approval", sublabel: "Trust Gate", icon: ShieldCheck,
    surface: "app", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30",
    description: "If the command is risky, Cloud sends an approval request to the App. User sees a human-readable summary and approves or denies.",
    actions: ["Cloud sends approval request", "App renders human-readable prompt", "Show action, device, risk, rollback info", "User approves or denies", "Cloud logs approval decision", "Skipped if risk is low"],
  },
  {
    id: "execute", label: "OS Execute", sublabel: "Local Action", icon: Cpu,
    surface: "os", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30",
    description: "If approved, Cloud sends a structured execution instruction to the OS. OS performs the action and emits result events.",
    actions: ["Receive structured instruction", "Validate local preconditions", "Execute action locally", "Emit result events", "Report success/failure", "Capture rollback state"],
  },
  {
    id: "verify", label: "Cloud Verify", sublabel: "Outcome Check", icon: CheckCircle,
    surface: "cloud", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
    description: "Cloud validates the outcome using telemetry and events. App displays result receipts. Failures trigger repair or rollback.",
    actions: ["Validate outcome via telemetry", "Compare against success criteria", "Generate result receipt", "App displays result + receipt", "Trigger repair/rollback on failure", "Update command history"],
  },
];

interface RoutingCase {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  boundary: string;
  steps: { stage: string; detail: string; surface: string }[];
}

const ROUTING_CASES: RoutingCase[] = [
  {
    id: "case-a", title: "Optimize System Performance", icon: Zap, color: "text-emerald-400",
    boundary: "Cloud decides, OS does, App controls/observes",
    steps: [
      { stage: "Origin", detail: "App sends 'optimize performance' command", surface: "App" },
      { stage: "Cloud Parse", detail: "Cloud evaluates device state and optimization opportunities", surface: "Cloud" },
      { stage: "Cloud Plan", detail: "Cloud generates optimization plan (cache cleanup, process priority, memory reclaim)", surface: "Cloud" },
      { stage: "App Approval", detail: "No high-risk changes detected — approval skipped", surface: "Skipped" },
      { stage: "OS Execute", detail: "OS receives optimization instructions and executes local tuning", surface: "OS" },
      { stage: "Cloud Verify", detail: "Cloud verifies CPU/memory/latency improvement via telemetry", surface: "Cloud" },
    ],
  },
  {
    id: "case-b", title: "Fix Sync Issues", icon: RefreshCw, color: "text-cyan-400",
    boundary: "OS does not independently invent global repair logic",
    steps: [
      { stage: "Origin", detail: "App sends 'fix sync issues' command", surface: "App" },
      { stage: "Cloud Parse", detail: "Cloud analyzes sync telemetry and identifies likely causes", surface: "Cloud" },
      { stage: "Cloud Plan", detail: "Cloud creates repair plan targeting stale caches and conflict resolution", surface: "Cloud" },
      { stage: "App Approval", detail: "Repair touches sensitive data behavior — app approval required", surface: "App" },
      { stage: "OS Execute", detail: "OS executes safe local repair actions (cache clear, re-sync trigger)", surface: "OS" },
      { stage: "Cloud Verify", detail: "Cloud verifies sync health improves; App shows repair receipt", surface: "Cloud" },
    ],
  },
  {
    id: "case-c", title: "Install Low-Trust App", icon: AlertTriangle, color: "text-amber-400",
    boundary: "App becomes security key; OS cannot silently proceed",
    steps: [
      { stage: "Origin", detail: "OS receives local install request for unverified package", surface: "OS" },
      { stage: "Cloud Parse", detail: "Cloud evaluates app trust score — marks action high-risk", surface: "Cloud" },
      { stage: "Cloud Plan", detail: "Cloud determines mandatory approval before installation", surface: "Cloud" },
      { stage: "App Approval", detail: "App receives approval prompt showing risk, publisher, permissions", surface: "App" },
      { stage: "OS Execute", detail: "User approves — OS installs the app in sandboxed environment", surface: "OS" },
      { stage: "Cloud Verify", detail: "Cloud records trust event; monitors initial runtime behavior", surface: "Cloud" },
    ],
  },
  {
    id: "case-d", title: "Remove Trusted Device", icon: Trash2, color: "text-red-400",
    boundary: "Not an OS-owned action — app/cloud trust action exclusively",
    steps: [
      { stage: "Origin", detail: "App initiates 'remove trusted device' for Desktop-01", surface: "App" },
      { stage: "Cloud Parse", detail: "Cloud verifies identity, trust conditions, and session state", surface: "Cloud" },
      { stage: "Cloud Plan", detail: "Cloud may require reauth or second confirmation factor", surface: "Cloud" },
      { stage: "App Approval", detail: "App confirms with strong reauth — biometric or password required", surface: "App" },
      { stage: "OS Execute", detail: "Cloud revokes canonical trust; OS on target device is invalidated", surface: "Cloud → OS" },
      { stage: "Cloud Verify", detail: "Cloud confirms session terminated; App shows revocation receipt", surface: "Cloud" },
    ],
  },
];

const SURFACE_COLORS: Record<string, string> = {
  App: "text-purple-400", OS: "text-blue-400", Cloud: "text-cyan-400",
  Skipped: "text-muted-foreground", "Cloud → OS": "text-teal-400",
};

export function CommandRoutingLifecycle() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>("case-a");
  const [activeCaseStep, setActiveCaseStep] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Command Routing Lifecycle
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Every command follows this 6-stage pipeline: Origin → Parse → Plan → Approve → Execute → Verify
        </p>
      </div>

      {/* Pipeline Visualization */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="py-6 px-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-2 shrink-0">
                <motion.button
                  onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all min-w-[110px]",
                    activeStage === stage.id ? cn(stage.bg, stage.border, "ring-1 ring-white/10") : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stage.bg)}>
                    <stage.icon className={cn("h-5 w-5", stage.color)} />
                  </div>
                  <span className={cn("text-[11px] font-semibold", activeStage === stage.id ? stage.color : "text-foreground")}>{stage.label}</span>
                  <span className="text-[9px] text-muted-foreground">{stage.sublabel}</span>
                </motion.button>
                {i < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Stage Detail */}
          <AnimatePresence mode="wait">
            {activeStage && (() => {
              const stage = PIPELINE_STAGES.find(s => s.id === activeStage)!;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn("mt-4 p-4 rounded-xl border", stage.border, stage.bg)}
                >
                  <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {stage.actions.map((action, j) => (
                      <motion.div key={j} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.04 }} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03]">
                        <CheckCircle className={cn("h-3 w-3 mt-0.5 shrink-0", stage.color)} />
                        <span className="text-[10px] text-foreground">{action}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Routing Cases */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Canonical Routing Cases
          <WhyTooltip explanation="These walkthroughs show how real commands flow through the 6-stage pipeline, demonstrating the boundary rules between OS, Cloud, and App." />
        </h3>
        <div className="space-y-3">
          {ROUTING_CASES.map(rc => (
            <Card key={rc.id} className="border-white/[0.06] bg-white/[0.03]">
              <CardHeader className="pb-0 pt-3 px-4">
                <button onClick={() => { setExpandedCase(expandedCase === rc.id ? null : rc.id); setActiveCaseStep(0); }} className="w-full flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <rc.icon className={cn("h-4 w-4", rc.color)} />
                    {rc.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] text-muted-foreground">{rc.boundary}</Badge>
                    {expandedCase === rc.id ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </button>
              </CardHeader>
              <AnimatePresence>
                {expandedCase === rc.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <CardContent className="pt-3 px-4 pb-4">
                      {/* Step indicators */}
                      <div className="flex items-center gap-1 mb-4">
                        {rc.steps.map((_, si) => (
                          <button key={si} onClick={() => setActiveCaseStep(si)} className={cn("flex-1 h-1.5 rounded-full transition-colors", si <= activeCaseStep ? "bg-primary" : "bg-white/[0.06]")} />
                        ))}
                      </div>
                      {/* Steps */}
                      <div className="space-y-2">
                        {rc.steps.map((step, si) => (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: si <= activeCaseStep ? 1 : 0.3, x: 0 }}
                            transition={{ delay: si * 0.06 }}
                            className={cn("flex items-start gap-3 p-2.5 rounded-lg transition-colors", si === activeCaseStep ? "bg-white/[0.04] ring-1 ring-white/[0.08]" : "bg-white/[0.01]")}
                          >
                            <div className="flex items-center gap-2 shrink-0 min-w-[100px]">
                              <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold", si <= activeCaseStep ? "bg-primary/20 text-primary" : "bg-white/[0.06] text-muted-foreground")}>{si + 1}</div>
                              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{step.stage}</span>
                            </div>
                            <p className="text-[11px] text-foreground flex-1">{step.detail}</p>
                            <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 shrink-0", SURFACE_COLORS[step.surface])}>{step.surface}</Badge>
                          </motion.div>
                        ))}
                      </div>
                      {/* Nav buttons */}
                      <div className="flex items-center justify-between mt-3">
                        <Button variant="ghost" size="sm" disabled={activeCaseStep === 0} onClick={() => setActiveCaseStep(s => s - 1)} className="text-xs h-7">
                          <RotateCcw className="h-3 w-3 mr-1" /> Previous
                        </Button>
                        <span className="text-[9px] text-muted-foreground">{activeCaseStep + 1} / {rc.steps.length}</span>
                        <Button variant="ghost" size="sm" disabled={activeCaseStep === rc.steps.length - 1} onClick={() => setActiveCaseStep(s => s + 1)} className="text-xs h-7">
                          Next <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
