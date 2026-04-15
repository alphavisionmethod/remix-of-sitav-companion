import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Sparkles, ArrowRight, Clock, Zap, Shield, TrendingUp,
  RefreshCw, AlertTriangle, CheckCircle, X, ChevronDown, Loader2,
  Play, Eye, Pencil, CornerDownLeft, Beaker, HelpCircle, Undo2
} from "lucide-react";
import { SimulationResultCard } from "./SimulationResultCard";
import { SafetyConfirmDialog, type SafetyAction } from "./SafetyConfirmDialog";
import { pushUndoAction } from "./UndoToastSystem";

interface ExecutionPlan {
  objective: string;
  tasks: { label: string; status: "pending" | "running" | "done" }[];
  risk: "low" | "medium" | "high";
  confidence: number;
  impact: "local" | "service" | "cohort" | "global";
  affectedAreas: string[];
  rollbackAvailable: boolean;
  estimatedCost: string;
  approvalsNeeded: boolean;
}

type CommandView = "idle" | "planning" | "plan" | "simulating" | "simulation" | "approving" | "executing" | "done";

const COMMAND_SUGGESTIONS = [
  { text: "Improve sync reliability across all devices", icon: RefreshCw, category: "reliability" },
  { text: "Run a full security review on authentication", icon: Shield, category: "security" },
  { text: "Reduce AI operating cost by 30%", icon: TrendingUp, category: "cost" },
  { text: "Prepare the next stable release", icon: Zap, category: "release" },
  { text: "Show me the biggest performance regressions", icon: AlertTriangle, category: "performance" },
  { text: "Find and fix the top user-reported issues", icon: Search, category: "support" },
];

const COMMAND_HISTORY = [
  { text: "Optimize sync retry logic", time: "2h ago" },
  { text: "Run security scan on storage service", time: "Yesterday" },
  { text: "Deploy UI animation update to beta", time: "2 days ago" },
];

function buildSimulationOutcomes(plan: ExecutionPlan) {
  const outcomes: { type: "improvement" | "warning" | "blocked"; text: string }[] = [];
  if (plan.affectedAreas.includes("sync-service")) {
    outcomes.push({ type: "improvement", text: "Estimated sync speed improvement: +22% across affected cohorts" });
    outcomes.push({ type: "improvement", text: "Reduced retry storm probability — high confidence" });
    outcomes.push({ type: "warning", text: "CPU usage may increase +5% on older desktop clients during transition" });
  }
  if (plan.affectedAreas.includes("storage-service")) {
    outcomes.push({ type: "improvement", text: "Storage read latency reduced by ~15ms (p95)" });
    outcomes.push({ type: "warning", text: "One mobile client cohort may require additional validation" });
  }
  if (plan.affectedAreas.includes("auth-service")) {
    outcomes.push({ type: "improvement", text: "Session validation overhead reduced by 30%" });
  }
  if (outcomes.length === 0) {
    outcomes.push({ type: "improvement", text: "All targeted metrics projected to improve within safe margins" });
    outcomes.push({ type: "improvement", text: "No degradation detected in simulation across 10k test scenarios" });
  }
  return outcomes;
}

function buildSafetyAction(plan: ExecutionPlan): SafetyAction {
  return {
    title: `Execute: ${plan.objective}`,
    description: `This action will modify ${plan.affectedAreas.length} subsystem(s) based on the generated plan. ${plan.approvalsNeeded ? "This requires explicit approval." : ""}`,
    riskLevel: plan.risk === "high" ? "high" : plan.risk === "medium" ? "medium" : "low",
    affectedSystems: plan.affectedAreas,
    affectedUsers: plan.impact === "global" ? "All platform users" : plan.impact === "cohort" ? "Beta cohort users" : plan.impact === "service" ? "Users of affected services" : "Limited scope",
    rollbackAvailable: plan.rollbackAvailable,
    rollbackDescription: plan.rollbackAvailable ? "Full state snapshot taken before execution. One-click rollback available for 24 hours." : "Partial rollback only — some changes may be irreversible.",
    approvalRequired: plan.approvalsNeeded,
    estimatedDuration: "2–8 minutes depending on scope",
    simulationAvailable: true,
    simulationResult: `Simulation passed with ${plan.confidence}% confidence. Predicted improvements across ${plan.affectedAreas.length} systems with ${plan.risk} risk.`,
    saferAlternative: plan.risk !== "low" ? {
      label: "Canary-first rollout",
      description: "Apply changes to 5% of traffic first, monitor for 2 hours, then expand if healthy."
    } : undefined,
    technicalDetails: `Plan: ${plan.tasks.length} tasks\nRisk: ${plan.risk}\nConfidence: ${plan.confidence}%\nImpact: ${plan.impact}\nAffected: ${plan.affectedAreas.join(", ")}\nRollback: ${plan.rollbackAvailable ? "armed" : "limited"}\nEstimated cost: ${plan.estimatedCost}`,
  };
}

export function GlobalCommandBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [view, setView] = useState<CommandView>("idle");
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    setView("planning");
    setTimeout(() => {
      const newPlan: ExecutionPlan = {
        objective: query,
        tasks: [
          { label: "Analyze current state and gather metrics", status: "done" },
          { label: "Identify root causes and bottlenecks", status: "done" },
          { label: "Generate targeted fixes and improvements", status: "running" },
          { label: "Run validation gates and regression tests", status: "pending" },
          { label: "Prepare staged rollout with canary", status: "pending" },
          { label: "Monitor health for 24h before expansion", status: "pending" },
        ],
        risk: query.toLowerCase().includes("security") || query.toLowerCase().includes("delete") ? "high" : "medium",
        confidence: Math.floor(85 + Math.random() * 12),
        impact: query.toLowerCase().includes("all") ? "cohort" : "service",
        affectedAreas: ["sync-service", "storage-service", "mobile sync core"],
        rollbackAvailable: true,
        estimatedCost: "AI: Low-Medium · Infra: Low",
        approvalsNeeded: true,
      };
      setPlan(newPlan);
      setView("plan");
    }, 1800);
  }, [query]);

  const handleSimulate = useCallback(() => {
    if (!plan) return;
    setView("simulating");
    setTimeout(() => setView("simulation"), 1500);
  }, [plan]);

  const handleApproveFromPlan = useCallback(() => {
    setShowApproval(true);
  }, []);

  const handleConfirmExecution = useCallback(() => {
    setShowApproval(false);
    setView("executing");
    setTimeout(() => {
      setView("done");
      if (plan) {
        pushUndoAction({
          label: `Executed: ${plan.objective}`,
          rollbackReady: plan.rollbackAvailable,
        });
      }
      setTimeout(() => {
        setView("idle");
        setPlan(null);
        setQuery("");
      }, 3000);
    }, 2000);
  }, [plan]);

  const resetAll = useCallback(() => {
    setView("idle");
    setPlan(null);
    setQuery("");
    setShowApproval(false);
  }, []);

  const showDropdown = focused && view === "idle" && !query;
  const showSuggestions = focused && view === "idle" && !!query;

  return (
    <div className="relative z-50">
      {/* Command Input */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-2.5 border-b transition-colors",
        "bg-card/60 backdrop-blur-xl",
        focused ? "border-primary/30" : "border-border/40"
      )}>
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") resetAll(); }}
          placeholder="Tell your platform what to do… e.g. 'Improve sync reliability across all devices'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {view === "planning" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {view === "simulating" && (
          <Badge variant="outline" className="text-[9px] h-5 gap-1 text-primary border-primary/20 animate-pulse">
            <Beaker className="h-3 w-3" /> Simulating…
          </Badge>
        )}
        {view === "executing" && (
          <Badge variant="outline" className="text-[9px] h-5 gap-1 text-amber-400 border-amber-500/20 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Executing…
          </Badge>
        )}
        {view === "done" && (
          <Badge variant="outline" className="text-[9px] h-5 gap-1 text-emerald-400 border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Complete
          </Badge>
        )}
        {query && view === "idle" && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleSubmit}>
            <CornerDownLeft className="h-3 w-3" /> Execute
          </Button>
        )}
        <Badge variant="outline" className="text-[9px] h-5 shrink-0 text-muted-foreground">⌘K</Badge>
      </div>

      {/* Dropdown: History */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-x-0 top-full bg-card/95 backdrop-blur-2xl border-b border-x border-border/40 rounded-b-xl shadow-2xl max-h-[400px] overflow-y-auto z-50"
          >
            <div className="px-4 py-2 border-b border-border/20">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent Commands</span>
            </div>
            {COMMAND_HISTORY.map((cmd, i) => (
              <button key={i} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left" onMouseDown={() => setQuery(cmd.text)}>
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground flex-1">{cmd.text}</span>
                <span className="text-[10px] text-muted-foreground">{cmd.time}</span>
              </button>
            ))}
            <div className="px-4 py-2 border-b border-t border-border/20">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Try These</span>
            </div>
            {COMMAND_SUGGESTIONS.map((s, i) => (
              <button key={i} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left" onMouseDown={() => setQuery(s.text)}>
                <s.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span className="text-sm text-foreground">{s.text}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown: Filtered Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-x-0 top-full bg-card/95 backdrop-blur-2xl border-b border-x border-border/40 rounded-b-xl shadow-2xl max-h-[300px] overflow-y-auto z-50"
          >
            {COMMAND_SUGGESTIONS.filter(s => s.text.toLowerCase().includes(query.toLowerCase())).map((s, i) => (
              <button key={i} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left" onMouseDown={() => setQuery(s.text)}>
                <s.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span className="text-sm text-foreground">{s.text}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PLAN CARD ── */}
      <AnimatePresence>
        {view === "plan" && plan && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-full mt-2 bg-card/95 backdrop-blur-2xl border border-border/40 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Execution Plan</span>
                  <h3 className="text-sm font-semibold text-foreground mt-0.5">{plan.objective}</h3>
                </div>
                <button onClick={resetAll} className="p-1 hover:bg-muted/40 rounded">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <Badge variant="outline" className="text-[9px] h-5 bg-primary/5 border-primary/20 text-primary">
                  Confidence: {plan.confidence}%
                </Badge>
                <Badge variant="outline" className={cn("text-[9px] h-5",
                  plan.risk === "low" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  plan.risk === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  Risk: {plan.risk}
                </Badge>
                <Badge variant="outline" className="text-[9px] h-5 text-muted-foreground">
                  Impact: {plan.impact === "global" ? "Global" : plan.impact === "cohort" ? "Cohort-wide" : plan.impact === "service" ? "Service-level" : "Local"}
                </Badge>
                {plan.rollbackAvailable && (
                  <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-500/20 gap-1">
                    <Undo2 className="h-2.5 w-2.5" /> Rollback Available
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              {plan.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  {task.status === "done" && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  {task.status === "running" && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />}
                  {task.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />}
                  <span className={cn(task.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>{task.label}</span>
                </div>
              ))}
            </div>

            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Affected:</span>
                {plan.affectedAreas.map(area => (
                  <Badge key={area} variant="outline" className="text-[9px] h-4">{area}</Badge>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
              <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleApproveFromPlan}>
                <Play className="h-3 w-3" /> Approve & Execute
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleSimulate}>
                <Eye className="h-3 w-3" /> Simulate First
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Pencil className="h-3 w-3" /> Edit Scope
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <HelpCircle className="h-3 w-3" /> Ask Why
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={resetAll}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIMULATION LOADING ── */}
      <AnimatePresence>
        {view === "simulating" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-full mt-2 bg-card/95 backdrop-blur-2xl border border-border/40 rounded-xl shadow-2xl z-50 p-8 flex flex-col items-center gap-3"
          >
            <Beaker className="h-8 w-8 text-primary animate-pulse" />
            <p className="text-sm font-medium text-foreground">Running Simulation…</p>
            <p className="text-[11px] text-muted-foreground">Predicting outcomes across 10,000 scenarios</p>
            <div className="w-48 h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIMULATION RESULT (SimulationResultCard) ── */}
      <AnimatePresence>
        {view === "simulation" && plan && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute inset-x-4 top-full mt-2 z-50"
          >
            <SimulationResultCard
              objective={plan.objective}
              outcomes={buildSimulationOutcomes(plan)}
              confidence={plan.confidence}
              risk={plan.risk}
              impact={plan.impact}
              rollbackAvailable={plan.rollbackAvailable}
              recommendation={
                plan.risk === "high"
                  ? "Recommend canary deployment to 5% of beta users first with 2-hour monitoring window."
                  : plan.risk === "medium"
                  ? "Safe to canary on desktop beta first. Monitor for 1 hour, then expand to full cohort."
                  : "Safe to apply broadly. All simulation scenarios passed with high confidence."
              }
              onApply={handleApproveFromPlan}
              onAdjust={() => setView("plan")}
              onExplain={() => setView("plan")}
              onCancel={resetAll}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXECUTION COMPLETE ── */}
      <AnimatePresence>
        {view === "done" && plan && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-full mt-2 bg-card/95 backdrop-blur-2xl border border-emerald-500/30 rounded-xl shadow-2xl z-50 p-6 flex items-center gap-4"
          >
            <div className="rounded-full bg-emerald-500/10 p-2.5">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Execution Complete</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{plan.objective} — all tasks completed successfully. Rollback available for 24 hours.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
              <Undo2 className="h-3 w-3" /> Undo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPROVAL DIALOG ── */}
      {plan && (
        <SafetyConfirmDialog
          open={showApproval}
          onOpenChange={setShowApproval}
          action={buildSafetyAction(plan)}
          onConfirm={handleConfirmExecution}
          onSimulate={() => { setShowApproval(false); handleSimulate(); }}
          onChooseSafer={() => { setShowApproval(false); handleSimulate(); }}
        />
      )}
    </div>
  );
}
