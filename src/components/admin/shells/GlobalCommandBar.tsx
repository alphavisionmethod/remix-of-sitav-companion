import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Sparkles, ArrowRight, Clock, Zap, Shield, TrendingUp,
  RefreshCw, AlertTriangle, CheckCircle, X, ChevronDown, Loader2,
  Play, Eye, Pencil, CornerDownLeft
} from "lucide-react";

interface ExecutionPlan {
  objective: string;
  tasks: { label: string; status: "pending" | "running" | "done" }[];
  risk: "low" | "medium" | "high";
  affectedAreas: string[];
  rollbackAvailable: boolean;
  estimatedCost: string;
  approvalsNeeded: boolean;
}

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

export function GlobalCommandBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
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
    setProcessing(true);
    setPlan(null);
    // Simulate AI parsing + plan generation
    setTimeout(() => {
      setPlan({
        objective: query,
        tasks: [
          { label: "Analyze current state and gather metrics", status: "done" },
          { label: "Identify root causes and bottlenecks", status: "done" },
          { label: "Generate targeted fixes and improvements", status: "running" },
          { label: "Run validation gates and regression tests", status: "pending" },
          { label: "Prepare staged rollout with canary", status: "pending" },
          { label: "Monitor health for 24h before expansion", status: "pending" },
        ],
        risk: "medium",
        affectedAreas: ["sync-service", "storage-service", "mobile sync core"],
        rollbackAvailable: true,
        estimatedCost: "AI: Low-Medium · Infra: Low",
        approvalsNeeded: true,
      });
      setProcessing(false);
    }, 1800);
  }, [query]);

  const riskColor = { low: "text-emerald-400", medium: "text-amber-400", high: "text-red-400" };
  const showDropdown = focused && !processing && !plan;

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
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") { setFocused(false); setPlan(null); setQuery(""); } }}
          placeholder="Tell your platform what to do… e.g. 'Improve sync reliability across all devices'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {processing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {query && !processing && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleSubmit}>
            <CornerDownLeft className="h-3 w-3" /> Execute
          </Button>
        )}
        <Badge variant="outline" className="text-[9px] h-5 shrink-0 text-muted-foreground">⌘K</Badge>
      </div>

      {/* Dropdown: Suggestions + History */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-x-0 top-full bg-card/95 backdrop-blur-2xl border-b border-x border-border/40 rounded-b-xl shadow-2xl max-h-[400px] overflow-y-auto z-50"
          >
            {query.length === 0 && (
              <>
                {/* Recent */}
                <div className="px-4 py-2 border-b border-border/20">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent Commands</span>
                </div>
                {COMMAND_HISTORY.map((cmd, i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left"
                    onMouseDown={() => { setQuery(cmd.text); }}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1">{cmd.text}</span>
                    <span className="text-[10px] text-muted-foreground">{cmd.time}</span>
                  </button>
                ))}
              </>
            )}

            {/* Suggestions */}
            <div className="px-4 py-2 border-b border-border/20">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {query ? "Suggestions" : "Try These"}
              </span>
            </div>
            {COMMAND_SUGGESTIONS
              .filter(s => !query || s.text.toLowerCase().includes(query.toLowerCase()))
              .map((suggestion, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left"
                  onMouseDown={() => { setQuery(suggestion.text); }}
                >
                  <suggestion.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="text-sm text-foreground">{suggestion.text}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Plan Card */}
      <AnimatePresence>
        {plan && (
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
                <button onClick={() => { setPlan(null); setQuery(""); }} className="p-1 hover:bg-muted/40 rounded">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px] flex-wrap">
                <span className={cn("font-medium", riskColor[plan.risk])}>Risk: {plan.risk}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{plan.estimatedCost}</span>
                <span className="text-muted-foreground">·</span>
                {plan.rollbackAvailable && <span className="text-emerald-400">Rollback Available</span>}
                {plan.approvalsNeeded && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-amber-400">Approval Required</span>
                  </>
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 space-y-2">
              {plan.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  {task.status === "done" && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  {task.status === "running" && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />}
                  {task.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />}
                  <span className={cn(
                    task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                  )}>{task.label}</span>
                </div>
              ))}
            </div>

            {/* Affected areas */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Affected:</span>
                {plan.affectedAreas.map(area => (
                  <Badge key={area} variant="outline" className="text-[9px] h-4">{area}</Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-2">
              <Button size="sm" className="h-7 text-xs gap-1.5">
                <Play className="h-3 w-3" /> Approve & Execute
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Eye className="h-3 w-3" /> Simulate First
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Pencil className="h-3 w-3" /> Edit Scope
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => { setPlan(null); setQuery(""); }}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
