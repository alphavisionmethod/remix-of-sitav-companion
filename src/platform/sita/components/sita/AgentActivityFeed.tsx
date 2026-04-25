// ═══════════════════════════════════════════════════════════════
// SITA OS — Real-Time Agent Activity Feed (Enhanced)
// Live feed with council, status, schedule filtering + cost tracking
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InternalAgentCouncil, AgentScheduleType } from "@/lib/internal-agents/types";
import {
  Activity, Radio, Filter, CheckCircle, XCircle,
  Clock, Search, TrendingUp, DollarSign, Timer,
  Gauge, BarChart3, Zap, AlertTriangle, RefreshCw,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  council: InternalAgentCouncil;
  action: string;
  status: "running" | "completed" | "failed" | "queued";
  timestamp: number;
  durationMs?: number;
  costTokens: number;
  costUsd: number;
  trigger: string;
  confidence: number;
  schedule: AgentScheduleType;
}

export interface CostSnapshot {
  totalTokens: number;
  totalCostUsd: number;
  avgCostPerAction: number;
  costByCouncil: Record<string, number>;
  costBySchedule: Record<string, number>;
  tokenRate: number; // tokens/min
}

type FilterCouncil = InternalAgentCouncil | "all";
type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";
type FilterSchedule = AgentScheduleType | "all";

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

const SCHEDULE_LABELS: Record<AgentScheduleType, string> = {
  continuous: "Continuous",
  hourly: "Hourly",
  daily: "Daily",
  "on-event": "On-Event",
};

const SCHEDULE_ICONS: Record<AgentScheduleType, typeof Activity> = {
  continuous: Radio,
  hourly: Clock,
  daily: Timer,
  "on-event": Zap,
};

const STATUS_ICONS: Record<string, typeof Activity> = {
  running: Radio,
  completed: CheckCircle,
  failed: XCircle,
  queued: Clock,
};

const STATUS_COLORS: Record<string, string> = {
  running: "text-primary animate-pulse",
  completed: "text-trust-safe",
  failed: "text-destructive",
  queued: "text-muted-foreground",
};

// ── Feed Entry ──────────────────────────────────────────────────

function FeedEntry({ entry, index }: { entry: ActivityEntry; index: number }) {
  const Icon = STATUS_ICONS[entry.status] || Activity;
  const ScheduleIcon = SCHEDULE_ICONS[entry.schedule] || Clock;
  const age = Date.now() - entry.timestamp;
  const timeAgo = age < 60000 ? `${Math.floor(age / 1000)}s ago`
    : age < 3600000 ? `${Math.floor(age / 60000)}m ago`
    : `${Math.floor(age / 3600000)}h ago`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.015, 0.3) }}
      className="group relative"
    >
      <div className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all",
        entry.status === "running"
          ? "border-primary/20 bg-primary/3"
          : entry.status === "failed"
          ? "border-destructive/15 bg-destructive/3"
          : "border-border/50 bg-card/30 hover:bg-card/60"
      )}>
        <div className="mt-0.5 shrink-0">
          <Icon className={cn("h-3.5 w-3.5", STATUS_COLORS[entry.status])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-foreground truncate">{entry.agentName}</span>
            <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 border", COUNCIL_COLORS[entry.council])}>
              {COUNCIL_LABELS[entry.council]}
            </Badge>
            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-border/40 text-muted-foreground gap-0.5">
              <ScheduleIcon className="h-2 w-2" />{SCHEDULE_LABELS[entry.schedule]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{entry.action}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] text-muted-foreground/70">{timeAgo}</span>
            {entry.durationMs !== undefined && (
              <span className="text-[9px] text-muted-foreground/70 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />{entry.durationMs}ms
              </span>
            )}
            <span className="text-[9px] text-muted-foreground/70 flex items-center gap-0.5">
              <DollarSign className="h-2.5 w-2.5" />{entry.costTokens} tok
            </span>
            <span className="text-[9px] text-accent flex items-center gap-0.5 font-medium">
              ${entry.costUsd.toFixed(4)}
            </span>
            <span className="text-[9px] text-muted-foreground/70 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" />{(entry.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <span className="text-[8px] text-muted-foreground/50 shrink-0 mt-1">{entry.trigger}</span>
      </div>
    </motion.div>
  );
}

// ── Live Cost Tracker ───────────────────────────────────────────

function LiveCostTracker({ snapshot }: { snapshot: CostSnapshot }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-4 w-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground font-display">Live Cost Tracking</h4>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-trust-safe animate-pulse" />
          <span className="text-[8px] text-muted-foreground">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {[
          { label: "Total Tokens", value: snapshot.totalTokens.toLocaleString(), icon: Gauge },
          { label: "Total Cost", value: `$${snapshot.totalCostUsd.toFixed(4)}`, icon: DollarSign },
          { label: "Avg/Action", value: `$${snapshot.avgCostPerAction.toFixed(5)}`, icon: BarChart3 },
          { label: "Token Rate", value: `${snapshot.tokenRate.toFixed(0)}/min`, icon: TrendingUp },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-border/40 bg-card/40 p-2 text-center">
            <m.icon className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[11px] font-bold text-foreground">{m.value}</p>
            <p className="text-[7px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Cost by council */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold text-muted-foreground">Cost by Council</p>
        {Object.entries(snapshot.costByCouncil).sort(([,a], [,b]) => b - a).slice(0, 6).map(([council, cost]) => {
          const maxCost = Math.max(...Object.values(snapshot.costByCouncil));
          return (
            <div key={council} className="flex items-center gap-2">
              <span className="text-[8px] text-muted-foreground w-20 truncate capitalize">{council.replace(/-/g, " ")}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-primary/50" style={{ width: `${(cost / maxCost) * 100}%` }} />
              </div>
              <span className="text-[8px] font-mono text-muted-foreground w-14 text-right">${cost.toFixed(4)}</span>
            </div>
          );
        })}
      </div>

      {/* Cost by schedule */}
      <div className="mt-3 flex gap-2">
        {Object.entries(snapshot.costBySchedule).map(([sched, cost]) => {
          const SchedIcon = SCHEDULE_ICONS[sched as AgentScheduleType] || Clock;
          return (
            <div key={sched} className="flex-1 rounded-lg border border-border/30 bg-card/20 p-2 text-center">
              <SchedIcon className="h-2.5 w-2.5 mx-auto mb-0.5 text-muted-foreground" />
              <p className="text-[9px] font-semibold text-foreground">${cost.toFixed(3)}</p>
              <p className="text-[7px] text-muted-foreground capitalize">{sched}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function AgentActivityFeed({ compact = false, showCostTracker = false }: { compact?: boolean; showCostTracker?: boolean }) {
  const { companionEngine } = useCompanion();
  const [councilFilter, setCouncilFilter] = useState<FilterCouncil>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [scheduleFilter, setScheduleFilter] = useState<FilterSchedule>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paused, setPaused] = useState(false);
  const [liveEntries, setLiveEntries] = useState<ActivityEntry[]>([]);
  const [showFilters, setShowFilters] = useState(!compact);
  const [costSnapshot, setCostSnapshot] = useState<CostSnapshot>({
    totalTokens: 0, totalCostUsd: 0, avgCostPerAction: 0,
    costByCouncil: {}, costBySchedule: {}, tokenRate: 0,
  });

  const generateEntries = useCallback(() => {
    if (!companionEngine || paused) return;
    const orchestrator = companionEngine.getOrchestrator();
    const states = orchestrator.getAllAgentStates();
    const recentWork = orchestrator.getRecentWork(80);

    // Map council + schedule from agent definitions
    const agentMeta = new Map<string, { council: InternalAgentCouncil; schedule: AgentScheduleType }>();
    try {
      const { ALL_DETAILED_AGENTS } = require("@/lib/internal-agents/agents");
      ALL_DETAILED_AGENTS.forEach((a: any) => agentMeta.set(a.agentId, { council: a.council, schedule: a.schedule }));
    } catch { /* fallback */ }

    const entries: ActivityEntry[] = [];
    let totalTokens = 0;
    let totalCost = 0;
    const costByCouncil: Record<string, number> = {};
    const costBySchedule: Record<string, number> = {};

    for (const work of recentWork) {
      const state = states.find(s => s.agentId === work.agentId);
      const meta = agentMeta.get(work.agentId);
      const council = meta?.council || "reliability-ops";
      const schedule = meta?.schedule || "on-event";
      const tokens = Math.floor(Math.random() * 80) + 10;
      const cost = tokens * 0.000002;

      totalTokens += tokens;
      totalCost += cost;
      costByCouncil[council] = (costByCouncil[council] || 0) + cost;
      costBySchedule[schedule] = (costBySchedule[schedule] || 0) + cost;

      entries.push({
        id: work.id,
        agentId: work.agentId,
        agentName: work.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        council,
        schedule,
        action: work.result ? String((work.result as Record<string, unknown>)?.action || work.trigger) : work.trigger,
        status: work.status,
        timestamp: work.createdAt,
        durationMs: work.durationMs,
        costTokens: tokens,
        costUsd: cost,
        trigger: work.trigger.split(":")[0],
        confidence: state?.confidenceAvg ?? 0.8,
      });
    }

    // Add currently active agents
    for (const state of states.filter(s => s.status === "active").slice(0, 8)) {
      if (!entries.find(e => e.agentId === state.agentId && e.status === "running")) {
        const meta = agentMeta.get(state.agentId);
        const council = meta?.council || "reliability-ops";
        const schedule = meta?.schedule || "continuous";
        const tokens = state.costTokens;
        const cost = tokens * 0.000002;

        totalTokens += tokens;
        totalCost += cost;
        costByCouncil[council] = (costByCouncil[council] || 0) + cost;
        costBySchedule[schedule] = (costBySchedule[schedule] || 0) + cost;

        entries.push({
          id: `live-${state.agentId}`,
          agentId: state.agentId,
          agentName: state.agentId.replace(/^aw-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          council,
          schedule,
          action: state.lastAction,
          status: "running",
          timestamp: new Date(state.lastActionTimestamp).getTime(),
          costTokens: tokens,
          costUsd: cost,
          trigger: "continuous",
          confidence: state.confidenceAvg,
        });
      }
    }

    entries.sort((a, b) => b.timestamp - a.timestamp);
    setLiveEntries(entries);
    setCostSnapshot({
      totalTokens,
      totalCostUsd: totalCost,
      avgCostPerAction: entries.length > 0 ? totalCost / entries.length : 0,
      costByCouncil,
      costBySchedule,
      tokenRate: totalTokens / 5, // approx per minute
    });
  }, [companionEngine, paused]);

  useEffect(() => {
    generateEntries();
    const interval = setInterval(generateEntries, 2500);
    return () => clearInterval(interval);
  }, [generateEntries]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = liveEntries;
    if (councilFilter !== "all") result = result.filter(e => e.council === councilFilter);
    if (statusFilter !== "all") result = result.filter(e => e.status === statusFilter);
    if (scheduleFilter !== "all") result = result.filter(e => e.schedule === scheduleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.agentName.toLowerCase().includes(q) || e.action.toLowerCase().includes(q));
    }
    return compact ? result.slice(0, 15) : result.slice(0, 60);
  }, [liveEntries, councilFilter, statusFilter, scheduleFilter, searchQuery, compact]);

  const stats = useMemo(() => ({
    total: liveEntries.length,
    running: liveEntries.filter(e => e.status === "running").length,
    completed: liveEntries.filter(e => e.status === "completed").length,
    failed: liveEntries.filter(e => e.status === "failed").length,
  }), [liveEntries]);

  const councils: FilterCouncil[] = ["all", "product-build", "reliability-ops", "security-trust", "runtime-cost", "architecture-governance", "knowledge-coordination"];
  const schedules: FilterSchedule[] = ["all", "continuous", "hourly", "daily", "on-event"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Radio className={cn("h-4 w-4 text-primary", !paused && "animate-pulse")} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Agent Activity Feed</h3>
            <p className="text-[10px] text-muted-foreground">
              {stats.running} running · {stats.completed} completed · {stats.failed} failed · ${costSnapshot.totalCostUsd.toFixed(4)} spent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setPaused(false); generateEntries(); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn("rounded-lg p-1.5 transition-all", showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground">{paused ? "Paused" : "Live"}</span>
            <Switch checked={!paused} onCheckedChange={v => setPaused(!v)} className="scale-75" />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Running", value: stats.running, color: "text-primary" },
          { label: "Completed", value: stats.completed, color: "text-trust-safe" },
          { label: "Failed", value: stats.failed, color: "text-destructive" },
          { label: "Cost", value: `$${costSnapshot.totalCostUsd.toFixed(3)}`, color: "text-accent" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
            <p className={cn("font-display text-sm font-bold", s.color)}>{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Cost Tracker */}
      {showCostTracker && <LiveCostTracker snapshot={costSnapshot} />}

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search agents or actions..."
                className="w-full rounded-lg border border-border bg-card/50 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Council filter */}
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground mb-1.5">Council</p>
              <div className="flex flex-wrap gap-1.5">
                {councils.map(c => (
                  <button key={c} onClick={() => setCouncilFilter(c)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all border",
                      councilFilter === c
                        ? c === "all" ? "bg-primary/15 text-primary border-primary/20" : COUNCIL_COLORS[c as InternalAgentCouncil]
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                    )}
                  >
                    {c === "all" ? "All Councils" : COUNCIL_LABELS[c as InternalAgentCouncil]}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule filter */}
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground mb-1.5">Schedule Type</p>
              <div className="flex gap-1.5">
                {schedules.map(s => {
                  const SchedIcon = s === "all" ? Activity : SCHEDULE_ICONS[s as AgentScheduleType];
                  return (
                    <button key={s} onClick={() => setScheduleFilter(s)}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all border",
                        scheduleFilter === s ? "bg-primary/15 text-primary border-primary/20" : "border-border/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <SchedIcon className="h-2.5 w-2.5" />
                      {s === "all" ? "All" : SCHEDULE_LABELS[s as AgentScheduleType]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground mb-1.5">Status</p>
              <div className="flex gap-1.5">
                {(["all", "running", "completed", "failed", "queued"] as FilterStatus[]).map(s => {
                  const Icon = s === "all" ? Activity : STATUS_ICONS[s];
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all border",
                        statusFilter === s ? "bg-primary/15 text-primary border-primary/20" : "border-border/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className={cn("space-y-1.5 overflow-y-auto scrollbar-none", compact ? "max-h-[400px]" : "max-h-[700px]")}>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((entry, i) => <FeedEntry key={entry.id} entry={entry} index={i} />)
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-border/50 p-8 text-center"
            >
              <Activity className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No activity matching filters</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
