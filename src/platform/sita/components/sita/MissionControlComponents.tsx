// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Mission Control Components (Admin/Owner)
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Shield, Activity, Zap, RefreshCw, Eye, Wifi, WifiOff, CheckCircle, RotateCcw,
  AlertTriangle, Loader2, DollarSign, Cpu, Rocket, GitBranch, Pause, Play,
  ChevronRight, Clock, FileText, Lock, Unlock, ShieldAlert, XCircle,
  Server, Database, Globe, Heart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import type {
  InternalAgentSummary, IncidentSummary, ConnectorHealthItem,
  StuckWorkflow, CostAnomaly, PolicyAnomaly, ReleaseSafetyState, SafeModeState,
} from "@/data/fixtures/mock-data/advisor-mission-control";

const healthColor = (h: string) =>
  h === "healthy" ? "trust-verified" : h === "degraded" ? "trust-degraded" : h === "critical" ? "urgency-critical" : "muted-foreground";

const statusIcon = (s: string) =>
  s === "connected" ? Wifi : s === "degraded" ? AlertTriangle : s === "disconnected" ? WifiOff : XCircle;

// ── Internal Agent Card ─────────────────────────────────────────────────────

export function AgentCard({ agent, onPause, onResume }: {
  agent: InternalAgentSummary;
  onPause?: () => void;
  onResume?: () => void;
}) {
  const hc = healthColor(agent.health);
  return (
    <motion.div whileHover={{ y: -1 }} className="rounded-xl border border-border/60 bg-card p-4 hover:border-primary/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--${hc}))]/10`}>
            <Server className={`h-4 w-4 text-[hsl(var(--${hc}))]`} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">{agent.name}</h3>
            <p className="text-[10px] text-muted-foreground">{agent.role} · {agent.autonomyLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full bg-[hsl(var(--${hc}))]`} />
          <span className={`text-[10px] capitalize text-[hsl(var(--${hc}))]`}>{agent.health}</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">{agent.mission}</p>

      {agent.currentTasks.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Current Tasks</p>
          {agent.currentTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/70">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />{t}
            </div>
          ))}
        </div>
      )}

      {agent.recentFindings.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Recent Findings</p>
          {agent.recentFindings.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--trust-review))]">
              <AlertTriangle className="h-2.5 w-2.5" />{f}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
        <div className="flex items-center gap-3">
          <span>{agent.invocations24h} calls/24h</span>
          <span>{(agent.costTokens24h / 1000).toFixed(1)}k tokens</span>
        </div>
        <div className="flex items-center gap-1">
          {agent.health !== "paused" ? (
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={onPause}><Pause className="h-3 w-3 mr-1" />Pause</Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-primary" onClick={onResume}><Play className="h-3 w-3 mr-1" />Resume</Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Incident Card ───────────────────────────────────────────────────────────

export function IncidentCard({ incident }: { incident: IncidentSummary }) {
  const sevColor = incident.severity === "critical" ? "urgency-critical" : incident.severity === "high" ? "urgency-high" : incident.severity === "medium" ? "trust-review" : "muted-foreground";
  const statusColor = incident.status === "resolved" ? "trust-verified" : incident.status === "mitigated" ? "trust-review" : incident.status === "investigating" ? "sita-purple" : "urgency-high";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] bg-[hsl(var(--${sevColor}))]/10 text-[hsl(var(--${sevColor}))] border-[hsl(var(--${sevColor}))]/20`}>{incident.severity}</Badge>
            <Badge variant="outline" className={`text-[10px] bg-[hsl(var(--${statusColor}))]/10 text-[hsl(var(--${statusColor}))] border-[hsl(var(--${statusColor}))]/20`}>{incident.status}</Badge>
            <span className="text-[10px] text-muted-foreground">{incident.createdAt}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{incident.title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{incident.scope}</p>
        </div>
      </div>

      <div className="rounded-lg bg-muted/30 px-3 py-2 mb-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Root Cause</p>
        <p className="text-[11px] text-foreground/80">{incident.rootCause}</p>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-1">Recommended Actions</p>
        {incident.recommendedActions.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/70 mb-0.5">
            <ChevronRight className="h-2.5 w-2.5 text-primary" />{a}
          </div>
        ))}
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-medium text-muted-foreground mb-1">Timeline</p>
        <div className="space-y-1 border-l-2 border-border/40 ml-1 pl-3">
          {incident.timeline.map((t, i) => (
            <div key={i} className="text-[10px]">
              <span className="text-muted-foreground font-mono">{t.time}</span>
              <span className="text-foreground/70 ml-2">{t.event}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {incident.rollbackSuggestion && (
          <Button size="sm" variant="outline" className="h-7 text-[11px]"><RotateCcw className="h-3 w-3 mr-1" />Rollback</Button>
        )}
        <Button size="sm" variant="outline" className="h-7 text-[11px]"><Eye className="h-3 w-3 mr-1" />Replay</Button>
        <Button size="sm" className="h-7 text-[11px] bg-primary"><CheckCircle className="h-3 w-3 mr-1" />Resolve</Button>
      </div>
    </motion.div>
  );
}

// ── Connector Health Card ───────────────────────────────────────────────────

export function ConnectorHealthCard({ connector }: { connector: ConnectorHealthItem }) {
  const StatusIcon = statusIcon(connector.status);
  const scoreColor = connector.healthScore >= 90 ? "trust-verified" : connector.healthScore >= 70 ? "trust-review" : connector.healthScore > 0 ? "urgency-high" : "muted-foreground";

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4 hover:border-primary/15 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 text-[hsl(var(--${scoreColor}))]`} />
          <h4 className="text-[12px] font-semibold text-foreground">{connector.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-semibold text-[hsl(var(--${scoreColor}))]`}>{connector.healthScore}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-2">
        <div className={`h-full rounded-full bg-[hsl(var(--${scoreColor}))]`} style={{ width: `${connector.healthScore}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground mb-2">
        <div><span className="block font-medium">Error Rate</span>{connector.errorRate}</div>
        <div><span className="block font-medium">Failures</span>{connector.recentFailures}</div>
        <div><span className="block font-medium">Last Sync</span>{connector.lastSync}</div>
      </div>

      {connector.impactedWorkflows.length > 0 && (
        <div className="text-[10px] text-[hsl(var(--trust-review))] mb-1">
          Impacts: {connector.impactedWorkflows.join(", ")}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">{connector.nextSteps}</p>
    </div>
  );
}

// ── Stuck Workflow Card ─────────────────────────────────────────────────────

export function WorkflowRecoveryCard({ workflow }: { workflow: StuckWorkflow }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--trust-review))]/30 bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="h-4 w-4 text-[hsl(var(--trust-review))] animate-spin" />
        <h4 className="text-[12px] font-semibold text-foreground">{workflow.name}</h4>
        <Badge variant="outline" className="text-[9px] ml-auto">{workflow.state}</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">{workflow.reason}</p>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
        <Clock className="h-3 w-3" />Stuck since {workflow.stuckSince}
      </div>
      <div className="rounded-lg bg-muted/30 px-3 py-2 mb-3 text-[11px]">
        <span className="font-medium text-muted-foreground">Suggestion: </span>
        <span className="text-foreground/80">{workflow.retrySuggestion}</span>
      </div>
      <div className="flex items-center gap-2 justify-end">
        {workflow.rollbackAvailable && <Button size="sm" variant="outline" className="h-7 text-[11px]"><RotateCcw className="h-3 w-3 mr-1" />Rollback</Button>}
        <Button size="sm" variant="outline" className="h-7 text-[11px]"><RefreshCw className="h-3 w-3 mr-1" />Retry</Button>
        {workflow.humanRequired && <Button size="sm" className="h-7 text-[11px] bg-primary"><Eye className="h-3 w-3 mr-1" />Intervene</Button>}
      </div>
    </div>
  );
}

// ── Cost Anomaly Card ───────────────────────────────────────────────────────

export function CostAnomalyCard({ anomaly }: { anomaly: CostAnomaly }) {
  const typeColor = anomaly.type === "spike" ? "urgency-high" : anomaly.type === "budget-exceeded" ? "urgency-critical" : "trust-review";
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className={`h-4 w-4 text-[hsl(var(--${typeColor}))]`} />
        <h4 className="text-[12px] font-semibold text-foreground">{anomaly.description}</h4>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
        <Badge variant="outline" className={`text-[9px] bg-[hsl(var(--${typeColor}))]/10 text-[hsl(var(--${typeColor}))] border-[hsl(var(--${typeColor}))]/20`}>{anomaly.type.replace("-", " ")}</Badge>
        <span>{anomaly.amount}</span>
        <span>{anomaly.advisor}</span>
        <span>{anomaly.timeframe}</span>
      </div>
      <p className="text-[11px] text-foreground/70">{anomaly.recommendation}</p>
    </div>
  );
}

// ── Policy Anomaly Card ─────────────────────────────────────────────────────

export function PolicyAnomalyCard({ anomaly }: { anomaly: PolicyAnomaly }) {
  const sevColor = anomaly.severity === "high" ? "urgency-high" : anomaly.severity === "medium" ? "trust-review" : "trust-verified";
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Shield className={`h-3.5 w-3.5 text-[hsl(var(--${sevColor}))]`} />
        <span className="text-[12px] font-medium text-foreground">{anomaly.description}</span>
        <Badge variant="outline" className={`text-[9px] ml-auto bg-[hsl(var(--${sevColor}))]/10 text-[hsl(var(--${sevColor}))]`}>{anomaly.severity}</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{anomaly.recommendation}</p>
    </div>
  );
}

// ── Release Safety Card ─────────────────────────────────────────────────────

export function ReleaseSafetyCard({ state }: { state: ReleaseSafetyState }) {
  const canaryColor = state.canaryStatus === "healthy" ? "trust-verified" : state.canaryStatus === "degraded" ? "trust-review" : "urgency-critical";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Release Safety</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Current Ring</p>
          <Badge variant="outline" className="text-[11px]">{state.currentRing}</Badge>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Canary</p>
          <Badge variant="outline" className={`text-[11px] bg-[hsl(var(--${canaryColor}))]/10 text-[hsl(var(--${canaryColor}))]`}>{state.canaryStatus}</Badge>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Regressions</p>
          <span className={`text-sm font-semibold ${state.regressionAlerts > 0 ? "text-[hsl(var(--urgency-high))]" : "text-[hsl(var(--trust-verified))]"}`}>{state.regressionAlerts}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Rollout Progress</span>
          <span>{state.rolloutProgress}%</span>
        </div>
        <Progress value={state.rolloutProgress} className="h-2" />
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
        <Clock className="h-3 w-3" />Last deployment: {state.lastDeployment}
      </div>

      <div className="flex items-center gap-2 justify-end">
        {state.rollbackAvailable && <Button size="sm" variant="outline" className="h-7 text-[11px]"><RotateCcw className="h-3 w-3 mr-1" />Rollback</Button>}
        <Button size="sm" variant="outline" className="h-7 text-[11px]"><Pause className="h-3 w-3 mr-1" />Pause Rollout</Button>
      </div>
    </div>
  );
}

// ── Safe Mode Card ──────────────────────────────────────────────────────────

export function SafeModeCard({ state, onToggle }: {
  state: SafeModeState;
  onToggle?: (key: keyof SafeModeState, value: boolean) => void;
}) {
  const modes: { key: keyof SafeModeState; label: string; description: string; severity: "critical" | "high" | "medium" }[] = [
    { key: "globalSafeMode", label: "Global Safe Mode", description: "All automation paused, all actions require approval", severity: "critical" },
    { key: "executionDisabled", label: "Execution Disabled", description: "No side effects — observe and recommend only", severity: "critical" },
    { key: "connectorPaused", label: "Connector Pause", description: "All external integrations paused", severity: "high" },
    { key: "advisorOnlyMode", label: "Advisor-Only Mode", description: "Advisors can recommend but not execute", severity: "medium" },
    { key: "boardroomReadOnly", label: "Boardroom Read-Only", description: "No new boardroom packets generated", severity: "medium" },
    { key: "sensitiveDomainsLocked", label: "Sensitive Domains Locked", description: "Finance and identity actions require dual approval", severity: "high" },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Safe Mode Controls</h3>
        {state.globalSafeMode && (
          <Badge className="ml-auto bg-destructive/15 text-destructive border-destructive/20 text-[10px]">SAFE MODE ACTIVE</Badge>
        )}
      </div>

      <div className="space-y-3">
        {modes.map((mode) => {
          const active = state[mode.key];
          const sevColor = mode.severity === "critical" ? "urgency-critical" : mode.severity === "high" ? "urgency-high" : "trust-review";
          return (
            <div key={mode.key} className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${active ? `border-[hsl(var(--${sevColor}))]/30 bg-[hsl(var(--${sevColor}))]/5` : "border-border/40 bg-muted/20"}`}>
              <div>
                <p className={`text-[12px] font-semibold ${active ? `text-[hsl(var(--${sevColor}))]` : "text-foreground"}`}>{mode.label}</p>
                <p className="text-[10px] text-muted-foreground">{mode.description}</p>
              </div>
              <Switch checked={active} onCheckedChange={(v) => onToggle?.(mode.key, v)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Permissions Card ────────────────────────────────────────────────────────

export function PermissionsCard({ name, level, allowedActions, blockedActions, memoryScope, onDowngrade }: {
  name: string;
  level: string;
  allowedActions: string[];
  blockedActions: string[];
  memoryScope: string;
  onDowngrade?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[12px] font-semibold text-foreground">{name}</h4>
        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">{level}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2 text-[10px]">
        <div>
          <p className="font-medium text-muted-foreground mb-1">Allowed</p>
          {allowedActions.map((a) => <div key={a} className="flex items-center gap-1 text-[hsl(var(--trust-verified))]"><CheckCircle className="h-2.5 w-2.5" />{a}</div>)}
        </div>
        <div>
          <p className="font-medium text-muted-foreground mb-1">Blocked</p>
          {blockedActions.map((a) => <div key={a} className="flex items-center gap-1 text-destructive"><XCircle className="h-2.5 w-2.5" />{a}</div>)}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Memory: {memoryScope}</span>
        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={onDowngrade}>Downgrade</Button>
      </div>
    </div>
  );
}
