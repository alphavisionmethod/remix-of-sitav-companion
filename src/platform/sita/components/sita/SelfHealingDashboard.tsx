// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Dashboard
// Full visualization: incidents, circuit breakers, immune rules,
// healing plans, recovery sequences, and quarantine
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { cn } from "@/lib/utils";
import type { PatrolIssue, HealthReport, IssueCategory, IssueSeverity } from "@/lib/core-services/error-patrol";
import {
  Shield, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap,
  Heart, Cpu, Eye, Radio, TrendingUp, Clock, ArrowRight, ShieldCheck,
  Thermometer, CircleOff, Power, Target, Layers, BarChart3, Wrench,
} from "lucide-react";

// ── Severity colors ─────────────────────────────────────────────

const SEVERITY_STYLES: Record<IssueSeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
};

const CATEGORY_ICONS: Record<IssueCategory, typeof Activity> = {
  "agent-failure": XCircle,
  "performance-regression": TrendingUp,
  "trust-anomaly": Shield,
  "policy-violation": ShieldCheck,
  "cost-spike": BarChart3,
  "service-degradation": Thermometer,
  "configuration-drift": Wrench,
};

// ── Health Overview ─────────────────────────────────────────────

function HealthOverview({ report }: { report: HealthReport }) {
  const healthColor = report.overallHealth === "healthy" ? "trust-safe"
    : report.overallHealth === "degraded" ? "accent" : "destructive";
  const healthScore = report.overallHealth === "healthy" ? 98
    : report.overallHealth === "degraded" ? 72 : 35;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20">
            <Heart className={cn("h-6 w-6", `text-${healthColor}`)} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground font-display">Self-Healing Engine</h3>
            <p className="text-xs text-muted-foreground">Autonomous incident detection, triage, and recovery</p>
          </div>
        </div>
        <Badge className={cn("text-[10px]", report.overallHealth === "healthy"
          ? "bg-trust-safe/15 text-trust-safe border-trust-safe/20"
          : report.overallHealth === "degraded"
          ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
          : "bg-destructive/15 text-destructive border-destructive/20"
        )}>
          {report.overallHealth.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Health Score", value: `${healthScore}%`, color: healthColor },
          { label: "Open Issues", value: report.openIssues, color: report.openIssues > 0 ? "accent" : "trust-safe" },
          { label: "Critical", value: report.criticalIssues, color: report.criticalIssues > 0 ? "destructive" : "trust-safe" },
          { label: "Auto-Fix Rate", value: `${(report.autoFixRate * 100).toFixed(0)}%`, color: report.autoFixRate > 0.8 ? "trust-safe" : "accent" },
          { label: "Detect Time", value: `${report.meanTimeToDetection}s`, color: "primary" },
          { label: "Recovery Time", value: `${report.meanTimeToRecovery}s`, color: "primary" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
            <p className={cn("font-display text-lg font-bold", `text-${m.color}`)}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="mt-4 grid grid-cols-3 md:grid-cols-7 gap-2">
        {Object.entries(report.issuesByCategory).map(([cat, count]) => {
          const Icon = CATEGORY_ICONS[cat as IssueCategory] || Activity;
          return (
            <div key={cat} className={cn(
              "rounded-lg border p-2 text-center transition-all",
              count > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-border/30 bg-card/20"
            )}>
              <Icon className={cn("h-3 w-3 mx-auto mb-1", count > 0 ? "text-amber-400" : "text-muted-foreground/40")} />
              <p className={cn("text-xs font-bold", count > 0 ? "text-foreground" : "text-muted-foreground/40")}>{count}</p>
              <p className="text-[7px] text-muted-foreground truncate">{cat.replace(/-/g, " ")}</p>
            </div>
          );
        })}
      </div>

      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/3 blur-3xl" />
    </motion.div>
  );
}

// ── Issue Card ──────────────────────────────────────────────────

function IssueCard({ issue, onFix }: { issue: PatrolIssue; onFix: (id: string) => void }) {
  const style = SEVERITY_STYLES[issue.severity];
  const Icon = CATEGORY_ICONS[issue.category] || Activity;
  const age = Date.now() - issue.detectedAt;
  const timeAgo = age < 60000 ? "just now" : age < 3600000 ? `${Math.floor(age / 60000)}m ago` : `${Math.floor(age / 3600000)}h ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-4 transition-all hover:shadow-sm", style.border, style.bg)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 rounded-lg p-1.5", style.bg)}>
          <Icon className={cn("h-4 w-4", style.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-foreground truncate">{issue.title}</h4>
            <Badge variant="outline" className={cn("text-[8px] px-1.5 h-4", style.text, style.border)}>
              {issue.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[8px] px-1.5 h-4">
              {issue.status}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">{issue.description}</p>

          {/* Remediation log */}
          {issue.remediationLog.length > 0 && (
            <div className="rounded-lg bg-card/60 border border-border/30 p-2 mb-2">
              <p className="text-[9px] font-semibold text-muted-foreground mb-1">Remediation Log</p>
              {issue.remediationLog.map((log, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <ArrowRight className="h-2.5 w-2.5 text-primary shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span>{timeAgo}</span>
              <span>Fixes: {issue.autoFixAttempts}</span>
              {issue.agentId && <span className="font-mono">{issue.agentId}</span>}
            </div>
            {issue.status === "open" && (
              <button onClick={() => onFix(issue.id)}
                className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] text-primary font-medium hover:bg-primary/20 transition-all"
              >
                <Zap className="h-2.5 w-2.5" />Auto-Fix
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Circuit Breaker Viz ─────────────────────────────────────────

function CircuitBreakerPanel() {
  const breakers = useMemo(() => [
    { serviceId: "payment-gateway", state: "closed" as const, attempts: 0, maxAttempts: 5 },
    { serviceId: "email-sender", state: "half-open" as const, attempts: 3, maxAttempts: 5 },
    { serviceId: "ai-model-router", state: "closed" as const, attempts: 1, maxAttempts: 5 },
    { serviceId: "connector-sync", state: "closed" as const, attempts: 0, maxAttempts: 5 },
    { serviceId: "webhook-dispatcher", state: "open" as const, attempts: 5, maxAttempts: 5 },
  ], []);

  const stateColors = { closed: "trust-safe", "half-open": "accent", open: "destructive" };

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Automatic failure isolation and recovery">
        <div className="flex items-center gap-2">
          <CircleOff className="h-4 w-4 text-primary" />Circuit Breakers
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-2">
        {breakers.map(b => (
          <div key={b.serviceId} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/30 p-3">
            <div className={cn("h-2.5 w-2.5 rounded-full", `bg-${stateColors[b.state]}`)} />
            <span className="text-xs font-medium text-foreground flex-1">{b.serviceId}</span>
            <Badge variant="outline" className={cn("text-[8px]", `text-${stateColors[b.state]}`)}>
              {b.state.toUpperCase()}
            </Badge>
            <div className="w-16">
              <Progress value={(b.attempts / b.maxAttempts) * 100} className="h-1.5" />
            </div>
            <span className="text-[9px] text-muted-foreground w-12 text-right">{b.attempts}/{b.maxAttempts}</span>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Immune Rules ────────────────────────────────────────────────

function ImmuneRulesPanel() {
  const rules = useMemo(() => [
    { id: "1", name: "Auto-restart on agent failure", pattern: "agent-failure", action: "service-restart", enabled: true, matchCount: 12 },
    { id: "2", name: "Circuit break on connector failure", pattern: "connector-failure", action: "circuit-breaker", enabled: true, matchCount: 8 },
    { id: "3", name: "Model swap on cost spike", pattern: "runtime-cost", action: "model-swap", enabled: true, matchCount: 3 },
    { id: "4", name: "Cache flush on resource exhaustion", pattern: "resource-exhaustion", action: "cache-flush", enabled: true, matchCount: 5 },
    { id: "5", name: "Permission revert on drift", pattern: "permission-drift", action: "permission-revert", enabled: false, matchCount: 0 },
    { id: "6", name: "Queue drain on pressure", pattern: "queue-pressure", action: "queue-drain", enabled: true, matchCount: 7 },
    { id: "7", name: "Rollback on release failure", pattern: "release-failure", action: "rollback", enabled: true, matchCount: 1 },
  ], []);

  const [localRules, setLocalRules] = useState(rules);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Pattern-matched automatic healing responses">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />Immune Rules
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-1.5">
        {localRules.map(r => (
          <div key={r.id} className={cn(
            "flex items-center gap-3 rounded-lg border p-3 transition-all",
            r.enabled ? "border-border/40 bg-card/30" : "border-border/20 bg-card/10 opacity-60"
          )}>
            <Switch checked={r.enabled} onCheckedChange={v => {
              setLocalRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: v } : x));
            }} className="scale-75" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[7px] px-1 h-3.5">{r.pattern}</Badge>
                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                <Badge variant="outline" className="text-[7px] px-1 h-3.5 text-primary border-primary/20">{r.action}</Badge>
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground">{r.matchCount} matches</span>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Degraded Modes ──────────────────────────────────────────────

function DegradedModesPanel() {
  const modes = [
    { mode: "connector-unavailable", active: false, description: "Connector offline fallback" },
    { mode: "ai-reduced", active: false, description: "AI summarization reduced" },
    { mode: "proof-readonly", active: false, description: "Proof center read-only" },
    { mode: "finance-readonly", active: true, description: "Finance safety mode" },
  ];

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Graceful capability reduction under failure">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-amber-400" />Degraded Modes
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-2">
        {modes.map(m => (
          <div key={m.mode} className={cn(
            "flex items-center justify-between rounded-lg border p-3",
            m.active ? "border-amber-500/20 bg-amber-500/5" : "border-border/30 bg-card/20"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", m.active ? "bg-amber-400 animate-pulse" : "bg-muted-foreground/30")} />
              <div>
                <p className="text-xs font-medium text-foreground">{m.mode}</p>
                <p className="text-[9px] text-muted-foreground">{m.description}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-[8px]", m.active ? "text-amber-400 border-amber-500/20" : "text-muted-foreground")}>
              {m.active ? "ACTIVE" : "STANDBY"}
            </Badge>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Main Self-Healing Dashboard ─────────────────────────────────

export function SelfHealingDashboard() {
  const { companionEngine: engine } = useCompanion();
  const [issues, setIssues] = useState<PatrolIssue[]>([]);
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);

  useEffect(() => {
    if (!engine) return;
    const patrol = engine.getErrorPatrol();
    const update = () => {
      setIssues(patrol.getIssueLog());
      setHealthReport(patrol.getHealthReport());
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  const handleAutoFix = async (issueId: string) => {
    if (!engine) return;
    await engine.getErrorPatrol().autoFix(issueId);
    setIssues(engine.getErrorPatrol().getIssueLog());
    setHealthReport(engine.getErrorPatrol().getHealthReport());
  };

  if (!healthReport) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openIssues = issues.filter(i => i.status === "open" || i.status === "investigating" || i.status === "auto-fixing");
  const resolvedIssues = issues.filter(i => i.status === "fixed");

  return (
    <div className="space-y-6">
      <HealthOverview report={healthReport} />

      {/* Open Issues */}
      {openIssues.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Active Issues" subtitle={`${openIssues.length} requiring attention`} />
          {openIssues.map((issue, i) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <IssueCard issue={issue} onFix={handleAutoFix} />
            </motion.div>
          ))}
        </div>
      )}

      {/* All clear */}
      {openIssues.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-trust-safe/20 bg-trust-safe/5 p-10 text-center"
        >
          <CheckCircle className="h-10 w-10 text-trust-safe mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground font-display">Self-Healing Active — No Issues</p>
          <p className="text-xs text-muted-foreground mt-1">All {issues.length > 0 ? `${resolvedIssues.length} resolved` : "systems"} operating within bounds</p>
        </motion.div>
      )}

      {/* Grid: Circuit Breakers + Immune Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CircuitBreakerPanel />
        <ImmuneRulesPanel />
      </div>

      <DegradedModesPanel />

      {/* Resolved issues timeline */}
      {resolvedIssues.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Resolved Issues" subtitle={`${resolvedIssues.length} auto-fixed`} />
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-none">
            {resolvedIssues.slice(0, 10).map(issue => (
              <div key={issue.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/20 p-2.5">
                <CheckCircle className="h-3.5 w-3.5 text-trust-safe shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate">{issue.title}</p>
                  <p className="text-[9px] text-muted-foreground">{issue.category} · {issue.autoFixAttempts} attempt(s)</p>
                </div>
                <Badge variant="outline" className="text-[7px] text-trust-safe border-trust-safe/20">FIXED</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
