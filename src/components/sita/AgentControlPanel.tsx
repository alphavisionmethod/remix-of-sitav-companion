// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Control Panel
// Manual run, pause, promote, demote, quarantine with confirmations
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { InternalAgentCouncil } from "@/lib/internal-agents/types";
import {
  Play, Pause, ShieldBan, TrendingUp, TrendingDown, Search,
  AlertTriangle, CheckCircle, XCircle, Radio, Shield, Cpu,
  RotateCcw, Zap, Eye, Activity, Filter, ChevronRight,
  Loader2, Power, Clock, Gauge, DollarSign, Lock,
  CheckSquare, Square, ListChecks, X,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────

type AgentAction = "run" | "pause" | "promote" | "demote" | "quarantine" | "unquarantine";

interface AgentControlState {
  agentId: string;
  name: string;
  council: InternalAgentCouncil;
  status: "active" | "paused" | "quarantined" | "cooldown" | "error";
  autonomyLevel: number; // 0-6
  confidence: number;
  costTokens: number;
  invocations: number;
  lastAction: string;
  lastActionTime: number;
  failureCount: number;
  successRate: number;
}

interface ConfirmDialogState {
  open: boolean;
  action: AgentAction;
  agent: AgentControlState | null;
  loading: boolean;
}

const AUTONOMY_LABELS = ["L0 Observe", "L1 Diagnose", "L2 Recommend", "L3 Draft", "L4 Simulate", "L5 Approval", "L6 Action"];

const COUNCIL_COLORS: Record<InternalAgentCouncil, string> = {
  "product-build": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "reliability-ops": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "security-trust": "bg-red-500/15 text-red-400 border-red-500/20",
  "runtime-cost": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "architecture-governance": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "knowledge-coordination": "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

const COUNCIL_LABELS: Record<InternalAgentCouncil, string> = {
  "product-build": "Product",
  "reliability-ops": "Reliability",
  "security-trust": "Security",
  "runtime-cost": "Cost",
  "architecture-governance": "Architecture",
  "knowledge-coordination": "Knowledge",
};

const STATUS_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-trust-safe", label: "Active" },
  paused: { icon: Pause, color: "text-muted-foreground", label: "Paused" },
  quarantined: { icon: ShieldBan, color: "text-destructive", label: "Quarantined" },
  cooldown: { icon: Clock, color: "text-accent", label: "Cooldown" },
  error: { icon: XCircle, color: "text-destructive", label: "Error" },
};

const ACTION_CONFIG: Record<AgentAction, { icon: typeof Activity; label: string; color: string; description: string; destructive?: boolean }> = {
  run: { icon: Play, label: "Run Agent", color: "text-trust-safe", description: "Start this agent immediately. It will begin processing within its defined scope and autonomy level." },
  pause: { icon: Pause, label: "Pause Agent", color: "text-accent", description: "Temporarily pause this agent. It will stop processing but retain its state and can be resumed later." },
  promote: { icon: TrendingUp, label: "Promote Autonomy", color: "text-primary", description: "Increase this agent's autonomy level by one tier. This grants it more capabilities within its scope." },
  demote: { icon: TrendingDown, label: "Demote Autonomy", color: "text-accent", description: "Decrease this agent's autonomy level by one tier. This restricts its capabilities as a safety measure." },
  quarantine: { icon: ShieldBan, label: "Quarantine Agent", color: "text-destructive", description: "Immediately isolate this agent. It will be completely disabled and cannot execute any actions until manually unquarantined.", destructive: true },
  unquarantine: { icon: RotateCcw, label: "Unquarantine Agent", color: "text-trust-safe", description: "Release this agent from quarantine. It will be set to paused state for manual review before reactivation." },
};

// ── Agent Row ───────────────────────────────────────────────────

function AgentRow({ agent, onAction, bulkMode, selected, onToggleSelect }: {
  agent: AgentControlState;
  onAction: (agent: AgentControlState, action: AgentAction) => void;
  bulkMode: boolean;
  selected: boolean;
  onToggleSelect: (agentId: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.error;
  const StatusIcon = statusCfg.icon;
  const timeAgo = Date.now() - agent.lastActionTime;
  const timeLabel = timeAgo < 60000 ? `${Math.floor(timeAgo / 1000)}s` : timeAgo < 3600000 ? `${Math.floor(timeAgo / 60000)}m` : `${Math.floor(timeAgo / 3600000)}h`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group rounded-xl border p-3 transition-all hover:shadow-md",
        agent.status === "quarantined" ? "border-destructive/20 bg-destructive/3" :
        agent.status === "error" ? "border-destructive/15 bg-destructive/2" :
        agent.status === "paused" ? "border-border/40 bg-card/30" :
        "border-border/50 bg-card/50 hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Bulk checkbox */}
        {bulkMode && (
          <button onClick={() => onToggleSelect(agent.agentId)} className="mt-1 shrink-0">
            {selected
              ? <CheckSquare className="h-4 w-4 text-primary" />
              : <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
          </button>
        )}

        {/* Status indicator */}
        <div className="mt-1 shrink-0">
          <StatusIcon className={cn("h-4 w-4", statusCfg.color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-foreground truncate">{agent.name}</span>
            <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 border", COUNCIL_COLORS[agent.council])}>
              {COUNCIL_LABELS[agent.council]}
            </Badge>
            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-border/40 text-muted-foreground">
              {AUTONOMY_LABELS[agent.autonomyLevel]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gauge className="h-2.5 w-2.5" />{(agent.confidence * 100).toFixed(0)}% conf
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-2.5 w-2.5" />{agent.costTokens.toLocaleString()} tok
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />{agent.invocations} calls
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />{timeLabel} ago
            </span>
            {agent.failureCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-2.5 w-2.5" />{agent.failureCount} fails
              </span>
            )}
            <span className={cn("flex items-center gap-1", agent.successRate > 0.9 ? "text-trust-safe" : agent.successRate > 0.7 ? "text-accent" : "text-destructive")}>
              {(agent.successRate * 100).toFixed(0)}% success
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{agent.lastAction}</p>
        </div>

        {/* Actions — hidden in bulk mode */}
        {!bulkMode && (
          <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            {agent.status === "quarantined" ? (
              <ActionButton icon={RotateCcw} label="Unquarantine" onClick={() => onAction(agent, "unquarantine")} color="text-trust-safe" />
            ) : (
              <>
                {agent.status !== "active" && (
                  <ActionButton icon={Play} label="Run" onClick={() => onAction(agent, "run")} color="text-trust-safe" />
                )}
                {agent.status === "active" && (
                  <ActionButton icon={Pause} label="Pause" onClick={() => onAction(agent, "pause")} color="text-accent" />
                )}
                {agent.autonomyLevel < 6 && (
                  <ActionButton icon={TrendingUp} label="Promote" onClick={() => onAction(agent, "promote")} color="text-primary" />
                )}
                {agent.autonomyLevel > 0 && (
                  <ActionButton icon={TrendingDown} label="Demote" onClick={() => onAction(agent, "demote")} color="text-accent" />
                )}
                <ActionButton icon={ShieldBan} label="Quarantine" onClick={() => onAction(agent, "quarantine")} color="text-destructive" />
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, onClick, color }: { icon: typeof Activity; label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn("rounded-lg p-1.5 transition-all hover:bg-secondary/80", color)}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function AgentControlPanel() {
  const { companionEngine } = useCompanion();
  const [agents, setAgents] = useState<AgentControlState[]>([]);
  const [councilFilter, setCouncilFilter] = useState<InternalAgentCouncil | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false, action: "run", agent: null, loading: false,
  });

  // Bulk mode state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; action: AgentAction; loading: boolean }>({
    open: false, action: "run", loading: false,
  });

  const toggleSelect = useCallback((agentId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(agentId) ? next.delete(agentId) : next.add(agentId);
      return next;
    });
  }, []);

  const selectedAgents = useMemo(() => agents.filter(a => selectedIds.has(a.agentId)), [agents, selectedIds]);

  const exitBulkMode = useCallback(() => {
    setBulkMode(false);
    setSelectedIds(new Set());
  }, []);

  // Load agent states
  const loadAgents = useCallback(() => {
    if (!companionEngine) return;
    const orchestrator = companionEngine.getOrchestrator();
    const states = orchestrator.getAllAgentStates();

    let agentMeta = new Map<string, { council: InternalAgentCouncil; name: string; maxAutonomy: number }>();
    try {
      const { ALL_DETAILED_AGENTS } = require("@/lib/internal-agents/agents");
      ALL_DETAILED_AGENTS.forEach((a: any) => agentMeta.set(a.agentId, {
        council: a.council,
        name: a.name,
        maxAutonomy: ["observe", "diagnose", "recommend", "draft", "simulate", "approval_ready", "constrained_action_ready"].indexOf(a.maxAutonomyLevel),
      }));
    } catch { /* fallback */ }

    const controlStates: AgentControlState[] = states.map(s => {
      const meta = agentMeta.get(s.agentId);
      const autonomyIdx = Math.min(s.confidenceAvg > 0.9 ? 4 : s.confidenceAvg > 0.7 ? 3 : s.confidenceAvg > 0.5 ? 2 : 1, meta?.maxAutonomy ?? 4);
      return {
        agentId: s.agentId,
        name: meta?.name || s.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        council: meta?.council || "reliability-ops",
        status: s.status as AgentControlState["status"],
        autonomyLevel: autonomyIdx,
        confidence: s.confidenceAvg,
        costTokens: s.costTokens,
        invocations: s.invocationCount,
        lastAction: s.lastAction,
        lastActionTime: new Date(s.lastActionTimestamp).getTime(),
        failureCount: s.failureCount,
        successRate: s.invocationCount > 0 ? Math.max(0, 1 - (s.failureCount / s.invocationCount)) : 1,
      };
    });

    setAgents(controlStates);
  }, [companionEngine]);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 3000);
    return () => clearInterval(interval);
  }, [loadAgents]);

  // Action handler
  const handleAction = (agent: AgentControlState, action: AgentAction) => {
    setConfirmDialog({ open: true, action, agent, loading: false });
  };

  const executeAction = async () => {
    if (!confirmDialog.agent) return;
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    // Simulate action execution
    await new Promise(r => setTimeout(r, 800));

    const { agent, action } = confirmDialog;
    const actionLabel = ACTION_CONFIG[action].label;

    setAgents(prev => prev.map(a => {
      if (a.agentId !== agent.agentId) return a;
      switch (action) {
        case "run": return { ...a, status: "active" as const };
        case "pause": return { ...a, status: "paused" as const };
        case "quarantine": return { ...a, status: "quarantined" as const };
        case "unquarantine": return { ...a, status: "paused" as const };
        case "promote": return { ...a, autonomyLevel: Math.min(6, a.autonomyLevel + 1) };
        case "demote": return { ...a, autonomyLevel: Math.max(0, a.autonomyLevel - 1) };
        default: return a;
      }
    }));

    toast.success(`${actionLabel}: ${agent.name}`, {
      description: action === "promote" ? `Promoted to ${AUTONOMY_LABELS[Math.min(6, agent.autonomyLevel + 1)]}` :
        action === "demote" ? `Demoted to ${AUTONOMY_LABELS[Math.max(0, agent.autonomyLevel - 1)]}` :
        action === "quarantine" ? "Agent isolated — no further actions until unquarantined" :
        action === "unquarantine" ? "Agent released — set to paused for review" :
        undefined,
    });

    setConfirmDialog({ open: false, action: "run", agent: null, loading: false });
  };

  // Filters
  const filtered = useMemo(() => {
    let result = agents;
    if (councilFilter !== "all") result = result.filter(a => a.council === councilFilter);
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.agentId.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      const order = { quarantined: 0, error: 1, active: 2, cooldown: 3, paused: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    });
  }, [agents, councilFilter, statusFilter, searchQuery]);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds(prev => {
      const allIds = filtered.map(a => a.agentId);
      const allSelected = allIds.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set([...prev, ...allIds]);
    });
  }, [filtered]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a.agentId));

  // Bulk action execution
  const executeBulkAction = async () => {
    setBulkDialog(prev => ({ ...prev, loading: true }));
    await new Promise(r => setTimeout(r, 1000));

    const action = bulkDialog.action;
    const actionLabel = ACTION_CONFIG[action].label;

    setAgents(prev => prev.map(a => {
      if (!selectedIds.has(a.agentId)) return a;
      switch (action) {
        case "run": return { ...a, status: "active" as const };
        case "pause": return { ...a, status: "paused" as const };
        case "quarantine": return { ...a, status: "quarantined" as const };
        case "unquarantine": return { ...a, status: "paused" as const };
        case "promote": return { ...a, autonomyLevel: Math.min(6, a.autonomyLevel + 1) };
        case "demote": return { ...a, autonomyLevel: Math.max(0, a.autonomyLevel - 1) };
        default: return a;
      }
    }));

    toast.success(`Bulk ${actionLabel}`, {
      description: `Applied to ${selectedIds.size} agent${selectedIds.size > 1 ? "s" : ""}`,
    });

    setBulkDialog({ open: false, action: "run", loading: false });
    setSelectedIds(new Set());
  };

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === "active").length,
    paused: agents.filter(a => a.status === "paused").length,
    quarantined: agents.filter(a => a.status === "quarantined").length,
    errors: agents.filter(a => a.status === "error").length,
  }), [agents]);

  const councils: (InternalAgentCouncil | "all")[] = ["all", "product-build", "reliability-ops", "security-trust", "runtime-cost", "architecture-governance", "knowledge-coordination"];

  const actionCfg = confirmDialog.agent ? ACTION_CONFIG[confirmDialog.action] : null;
  const ActionIcon = actionCfg?.icon || Play;
  const BulkActionCfg = ACTION_CONFIG[bulkDialog.action];
  const BulkIcon = BulkActionCfg?.icon || Play;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Power className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Agent Control Panel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manually run, pause, promote, demote, and quarantine agents with full confirmation and audit trail.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds(new Set()); }}
              className={cn("rounded-lg p-1.5 transition-all", bulkMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
              title="Bulk operations"
            ><ListChecks className="h-3.5 w-3.5" /></button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn("rounded-lg p-1.5 transition-all", showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            ><Filter className="h-3.5 w-3.5" /></button>
            <button onClick={loadAgents} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-all">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Active", value: stats.active, color: "text-trust-safe" },
          { label: "Paused", value: stats.paused, color: "text-muted-foreground" },
          { label: "Quarantined", value: stats.quarantined, color: "text-destructive" },
          { label: "Errors", value: stats.errors, color: "text-destructive" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2.5 text-center">
            <p className={cn("font-display text-lg font-bold", m.color)}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-border/40 bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Council filter */}
            <div className="flex flex-wrap gap-1.5">
              {councils.map(c => (
                <button key={c} onClick={() => setCouncilFilter(c)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border transition-all",
                    councilFilter === c
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {c === "all" ? "All Councils" : COUNCIL_LABELS[c]}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5">
              {["all", "active", "paused", "quarantined", "error"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize",
                    statusFilter === s
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {bulkMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3 flex-wrap">
              <button onClick={selectAllFiltered} className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 transition-all">
                {allFilteredSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                {allFilteredSelected ? "Deselect All" : `Select All (${filtered.length})`}
              </button>

              <div className="h-4 w-px bg-border/40" />

              <span className="text-[10px] text-muted-foreground">
                <span className="font-bold text-foreground">{selectedIds.size}</span> selected
              </span>

              <div className="h-4 w-px bg-border/40" />

              {(["run", "pause", "promote", "demote", "quarantine"] as AgentAction[]).map(action => {
                const cfg = ACTION_CONFIG[action];
                const Icon = cfg.icon;
                return (
                  <Button
                    key={action}
                    size="sm"
                    variant="outline"
                    disabled={selectedIds.size === 0}
                    onClick={() => setBulkDialog({ open: true, action, loading: false })}
                    className={cn("h-7 text-[10px] gap-1 border-border/30", cfg.color)}
                  >
                    <Icon className="h-3 w-3" />{cfg.label.replace(" Agent", "")}
                  </Button>
                );
              })}

              <div className="ml-auto">
                <button onClick={exitBulkMode} className="text-muted-foreground hover:text-foreground transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/20 p-8 text-center">
            <Cpu className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No agents match filters</p>
          </div>
        ) : (
          filtered.map((agent, i) => (
            <motion.div key={agent.agentId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <AgentRow agent={agent} onAction={handleAction} bulkMode={bulkMode} selected={selectedIds.has(agent.agentId)} onToggleSelect={toggleSelect} />
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={open => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
                actionCfg?.destructive ? "bg-destructive/15" : "bg-primary/15"
              )}>
                <ActionIcon className={cn("h-5 w-5", actionCfg?.color)} />
              </div>
              <div>
                <DialogTitle className="text-base">{actionCfg?.label}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {confirmDialog.agent?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{actionCfg?.description}</p>

            {confirmDialog.agent && (
              <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Agent</span>
                  <span className="font-medium text-foreground">{confirmDialog.agent.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Council</span>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border", COUNCIL_COLORS[confirmDialog.agent.council])}>
                    {COUNCIL_LABELS[confirmDialog.agent.council]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Status</span>
                  <span className={STATUS_CONFIG[confirmDialog.agent.status]?.color}>{STATUS_CONFIG[confirmDialog.agent.status]?.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Autonomy</span>
                  <span className="text-foreground">{AUTONOMY_LABELS[confirmDialog.agent.autonomyLevel]}</span>
                </div>
                {(confirmDialog.action === "promote" || confirmDialog.action === "demote") && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/20">
                    <span className="text-muted-foreground">New Level</span>
                    <span className="font-bold text-primary">
                      {AUTONOMY_LABELS[confirmDialog.action === "promote"
                        ? Math.min(6, confirmDialog.agent.autonomyLevel + 1)
                        : Math.max(0, confirmDialog.agent.autonomyLevel - 1)]}
                    </span>
                  </div>
                )}
              </div>
            )}

            {actionCfg?.destructive && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive">
                  This is a destructive action. The agent will be completely isolated and unable to perform any operations.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              disabled={confirmDialog.loading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={actionCfg?.destructive ? "destructive" : "default"}
              onClick={executeAction}
              disabled={confirmDialog.loading}
              className="gap-1.5"
            >
              {confirmDialog.loading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Executing...</>
              ) : (
                <><ActionIcon className="h-3.5 w-3.5" />{actionCfg?.label}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirmation Dialog */}
      <Dialog open={bulkDialog.open} onOpenChange={open => !open && setBulkDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
                BulkActionCfg?.destructive ? "bg-destructive/15" : "bg-primary/15"
              )}>
                <BulkIcon className={cn("h-5 w-5", BulkActionCfg?.color)} />
              </div>
              <div>
                <DialogTitle className="text-base">Bulk {BulkActionCfg?.label}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {selectedIds.size} agent{selectedIds.size > 1 ? "s" : ""} selected
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{BulkActionCfg?.description}</p>

            <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 max-h-40 overflow-y-auto space-y-1.5">
              {selectedAgents.map(a => (
                <div key={a.agentId} className="flex items-center gap-2 text-xs">
                  <div className={cn("h-2 w-2 rounded-full", `bg-${STATUS_CONFIG[a.status]?.color.replace("text-", "")}`)} />
                  <span className="font-medium text-foreground truncate flex-1">{a.name}</span>
                  <Badge variant="outline" className={cn("text-[7px] px-1 py-0 h-3.5 border", COUNCIL_COLORS[a.council])}>
                    {COUNCIL_LABELS[a.council]}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">{AUTONOMY_LABELS[a.autonomyLevel]}</span>
                </div>
              ))}
            </div>

            {BulkActionCfg?.destructive && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive">
                  This will quarantine {selectedIds.size} agent{selectedIds.size > 1 ? "s" : ""}. They will all be completely isolated.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkDialog(prev => ({ ...prev, open: false }))}
              disabled={bulkDialog.loading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={BulkActionCfg?.destructive ? "destructive" : "default"}
              onClick={executeBulkAction}
              disabled={bulkDialog.loading}
              className="gap-1.5"
            >
              {bulkDialog.loading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Applying to {selectedIds.size}...</>
              ) : (
                <><BulkIcon className="h-3.5 w-3.5" />{BulkActionCfg?.label} ({selectedIds.size})</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
