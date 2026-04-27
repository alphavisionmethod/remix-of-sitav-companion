// ═══════════════════════════════════════════════════════════════
// SITA OS — Mission Control Typed Hooks
// Shared hooks that provide view models for all MC surfaces
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import type {
  MissionControlSummaryView, WhatMattersItem, ConnectorSummaryView,
  ConnectorDetailView, ConnectorLogEntry, ConnectorHealthView,
  IncidentSummaryView, IncidentDetailView, TrustSummaryView,
  FounderCostSummaryView, RecoverySummaryView, ReleaseSummaryView,
  PermissionMatrixView, AITeamSummaryView, DiagnosticsSummaryView,
  SystemActivityEntry, ControlMode, PackSummaryView,
} from "@/packages/contracts";

const internalAgents: any[] = [];
const incidents: any[] = [];
const connectorHealth: any[] = [];
const costAnomalies: any[] = [];
const stuckWorkflows: any[] = [];
const releaseSafety: any = { currentRing: "stable", canaryStatus: "healthy" };
const safeMode: any = { globalSafeMode: false };

// ── Control Mode ────────────────────────────────────────────────
export function useControlMode() {
  const [mode, setMode] = useState<ControlMode>("owner");
  return { mode, setMode, isOwner: mode === "owner", isAdvanced: mode === "advanced" };
}

// ── System Summary ──────────────────────────────────────────────
export function useMissionControlSummary(): MissionControlSummaryView {
  return useMemo(() => {
    const healthy = internalAgents.filter(a => a.health === "healthy").length;
    const total = internalAgents.length;
    const openInc = incidents.filter(i => i.status !== "resolved").length;
    const critInc = incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length;
    const connected = connectorHealth.filter(c => c.status === "connected").length;
    const degradedConn = connectorHealth.filter(c => c.status === "degraded").length;
    const disconnected = connectorHealth.filter(c => c.status === "disconnected").length;
    const avgHealth = Math.round(connectorHealth.reduce((s, c) => s + c.healthScore, 0) / connectorHealth.length);
    const stuck = stuckWorkflows.length;
    const totalTokens = internalAgents.reduce((s, a) => s + a.costTokens24h, 0);
    const budget = 5.0;
    const costToday = totalTokens * 0.002 / 1000;

    const score = Math.round(
      ((healthy / total) * 40) +
      ((openInc === 0 ? 1 : Math.max(0, 1 - openInc * 0.2)) * 25) +
      ((1 - degradedConn / connectorHealth.length) * 20) +
      ((stuck === 0 ? 1 : 0.5) * 15)
    );

    return {
      systemScore: score,
      status: score >= 90 ? "healthy" : score >= 70 ? "warning" : "critical",
      trustPosture: critInc > 0 ? "compromised" : openInc > 0 ? "review" : "verified",
      agentsSummary: {
        total, healthy,
        degraded: internalAgents.filter(a => a.health === "degraded").length,
        paused: internalAgents.filter(a => a.health === "paused").length,
        error: internalAgents.filter(a => a.health === "critical").length,
      },
      incidentsSummary: { open: openInc, critical: critInc, total: incidents.length },
      connectorsSummary: { total: connectorHealth.length, connected, degraded: degradedConn, disconnected, avgHealth },
      workflowsSummary: { total: 24, running: 24 - stuck, stuck, failed: 0 },
      costSummary: { tokensToday: totalTokens, costToday, budget, utilization: Math.round((costToday / budget) * 100) },
      releaseSummary: { currentVersion: "v2.4.0", ringStatus: releaseSafety.currentRing, canaryHealth: releaseSafety.canaryStatus === "healthy" ? 100 : 60 },
      safeModeActive: safeMode.globalSafeMode,
      lastUpdated: new Date().toISOString(),
    };
  }, []);
}

// ── What Matters Now ────────────────────────────────────────────
export function useWhatMattersNow(): WhatMattersItem[] {
  return useMemo(() => {
    const items: WhatMattersItem[] = [];
    const openInc = incidents.filter(i => i.status !== "resolved");
    openInc.forEach(i => items.push({
      id: `inc-${i.id}`, title: i.title, description: `${i.severity} severity — ${i.scope}`,
      urgency: i.severity === "critical" ? "critical" : "high", domain: "incidents",
      actionLabel: "Investigate", actionRoute: `/mission/incidents/${i.id}`,
      timestamp: i.createdAt,
    }));

    const degradedConn = connectorHealth.filter(c => c.status !== "connected");
    degradedConn.forEach(c => items.push({
      id: `conn-${c.id}`, title: `${c.name} is ${c.status}`, description: `Health score: ${c.healthScore}/100`,
      urgency: c.status === "disconnected" ? "high" : "medium", domain: "connectors",
      actionLabel: "View", actionRoute: `/mission/connectors/${c.id}`,
      timestamp: new Date().toISOString(),
    }));

    costAnomalies.forEach(a => items.push({
      id: `cost-${a.id}`, title: a.description, description: `${a.advisor} — ${a.timeframe}`,
      urgency: "medium", domain: "costs",
      actionLabel: "Review", actionRoute: `/mission-control/costs`,
      timestamp: new Date().toISOString(),
    }));

    stuckWorkflows.forEach(w => items.push({
      id: `wf-${w.id}`, title: `Workflow stuck: ${w.name}`, description: `${w.reason} — stuck since ${w.stuckSince}`,
      urgency: "high", domain: "workflows",
      actionLabel: "Recover", actionRoute: `/mission-control/recovery`,
      timestamp: w.stuckSince,
    }));

    return items.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return order[a.urgency] - order[b.urgency];
    });
  }, []);
}

// ── Connector Views ─────────────────────────────────────────────
export function useConnectorSummaries(): ConnectorSummaryView[] {
  return useMemo(() =>
    connectorHealth.map(c => ({
      id: c.id, name: c.name, status: c.status as ConnectorSummaryView["status"],
      healthScore: c.healthScore, authState: "valid" as const,
      lastSync: c.lastSync, errorRate: parseFloat(c.errorRate) || 0,
      latencyMs: Math.floor(Math.random() * 300) + 50,
      trustScore: Math.round(c.healthScore * 0.9), affectedWorkflows: c.impactedWorkflows?.length || 0,
      recommendation: c.healthScore < 70 ? "Schedule reconnect" : undefined,
    }))
  , []);
}

export function useConnectorDetail(connectorId: string): ConnectorDetailView | null {
  return useMemo(() => {
    const c = connectorHealth.find(x => x.id === connectorId);
    if (!c) return null;
    return {
      id: c.id, name: c.name, status: c.status as ConnectorSummaryView["status"],
      healthScore: c.healthScore, authState: "valid" as const,
      lastSync: c.lastSync, errorRate: parseFloat(c.errorRate) || 0,
      latencyMs: Math.floor(Math.random() * 300) + 50,
      trustScore: Math.round(c.healthScore * 0.9), affectedWorkflows: c.impactedWorkflows?.length || 0,
      scopes: ["read", "write", "sync"], environment: "live" as const,
      retryQueue: Math.floor(Math.random() * 5), syncQuality: c.healthScore,
      uptimePercent: 95 + Math.random() * 5,
      recentFailures: [
        { id: "log-1", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "sync" as const, message: "Sync timeout after 30s", severity: "warning" as const },
        { id: "log-2", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "auth" as const, message: "Token refresh successful", severity: "info" as const },
      ],
      associatedIncidents: [],
    };
  }, [connectorId]);
}

export function useConnectorHealth(connectorId: string): ConnectorHealthView | null {
  return useMemo(() => {
    const c = connectorHealth.find(x => x.id === connectorId);
    if (!c) return null;
    const latencyMs = Math.floor(Math.random() * 300) + 50;
    return {
      connectorId: c.id, latencyP50: latencyMs * 0.7, latencyP99: latencyMs * 2.5,
      retryQueueDepth: Math.floor(Math.random() * 5), syncFailureRate: parseFloat(c.errorRate) || 0,
      authExpiresIn: "23 days", idempotencyIssues: 0,
      timeoutPatterns: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: Math.floor(Math.random() * 3) })),
      degradationTrend: c.healthScore > 80 ? "stable" : "worsening",
      trustWarnings: c.healthScore < 70 ? ["Health below threshold — data freshness at risk"] : [],
    };
  }, [connectorId]);
}

export function useConnectorLogs(connectorId: string): ConnectorLogEntry[] {
  return useMemo(() => [
    { id: "l1", timestamp: new Date(Date.now() - 300000).toISOString(), type: "sync" as const, message: "Sync completed — 42 records", severity: "info" as const },
    { id: "l2", timestamp: new Date(Date.now() - 1800000).toISOString(), type: "retry" as const, message: "Retry #2 for batch sync", severity: "warning" as const },
    { id: "l3", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "auth" as const, message: "OAuth token refreshed", severity: "info" as const },
    { id: "l4", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "failure" as const, message: "Rate limit exceeded — backoff 60s", severity: "error" as const },
    { id: "l5", timestamp: new Date(Date.now() - 10800000).toISOString(), type: "sync" as const, message: "Sync completed — 38 records", severity: "info" as const },
    { id: "l6", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "verification" as const, message: "Data integrity check passed", severity: "info" as const },
  ], [connectorId]);
}

// ── Incident Views ──────────────────────────────────────────────
export function useIncidentSummaries(): IncidentSummaryView[] {
  return useMemo(() =>
    incidents.map(i => ({
      id: i.id, title: i.title, severity: i.severity as IncidentSummaryView["severity"],
      status: i.status as IncidentSummaryView["status"],
      affectedModules: [i.scope], trustImpact: i.severity === "critical" ? "critical" as const : "minor" as const,
      recoveryStatus: i.status === "resolved" ? "Recovered" : "In progress",
      createdAt: i.createdAt, ttc: i.status === "resolved" ? "35m" : undefined,
    }))
  , []);
}

export function useIncidentDetail(incidentId: string): IncidentDetailView | null {
  return useMemo(() => {
    const i = incidents.find(x => x.id === incidentId);
    if (!i) return null;
    return {
      id: i.id, title: i.title, severity: i.severity as IncidentSummaryView["severity"],
      status: i.status as IncidentSummaryView["status"],
      affectedModules: [i.scope], trustImpact: i.severity === "critical" ? "critical" as const : "minor" as const,
      recoveryStatus: i.status === "resolved" ? "Recovered" : "In progress",
      createdAt: i.createdAt,
      timeline: i.timeline.map(t => ({ ...t, actor: "System" })),
      rootCauseHypothesis: i.rootCause || `Likely caused by ${i.scope} degradation`,
      impactedUsers: Math.floor(Math.random() * 50),
      relatedReleases: [], relatedConnectors: [], relatedWorkflows: i.affectedFlows,
      mitigationActions: i.recommendedActions.map((a, idx) => ({
        label: a, status: (idx === 0 ? "done" : idx === 1 ? "in_progress" : "pending") as never,
      })),
      rollbackCandidates: i.rollbackSuggestion
        ? [{ id: "rb-1", label: i.rollbackSuggestion, risk: "low" as const }]
        : [],
    };
  }, [incidentId]);
}

// ── Trust View ──────────────────────────────────────────────────
export function useTrustSummary(): TrustSummaryView {
  return useMemo(() => ({
    posture: "verified", approvalHealth: "clean", policyConfidence: 94,
    verificationHealth: 98, rollbackReadiness: 92, proofCompleteness: 96,
    uncertaintyExposure: 3, sensitiveWorkflows: 2, trustIncidents: 0,
    lastAudit: new Date(Date.now() - 3600000).toISOString(),
  }), []);
}

// ── Cost View ───────────────────────────────────────────────────
export function useFounderCostSummary(): FounderCostSummaryView {
  return useMemo(() => {
    const totalTokens = internalAgents.reduce((s, a) => s + a.costTokens24h, 0);
    const budget = 5.0;
    const cost = totalTokens * 0.002 / 1000;
    const sorted = [...internalAgents].sort((a, b) => b.costTokens24h - a.costTokens24h);
    return {
      totalTokensToday: totalTokens, totalCostToday: cost, dailyBudget: budget,
      budgetUtilization: Math.round((cost / budget) * 100), anomalyCount: costAnomalies.length,
      topSpenders: sorted.slice(0, 5).map(a => ({ name: a.name, tokens: a.costTokens24h, cost: a.costTokens24h * 0.002 / 1000, invocations: a.invocations24h })),
      byModule: [
        { module: "Business OS", tokens: Math.round(totalTokens * 0.35), cost: cost * 0.35 },
        { module: "Finance OS", tokens: Math.round(totalTokens * 0.30), cost: cost * 0.30 },
        { module: "Concierge OS", tokens: Math.round(totalTokens * 0.20), cost: cost * 0.20 },
        { module: "System Ops", tokens: Math.round(totalTokens * 0.15), cost: cost * 0.15 },
      ],
      byConnector: [
        { connector: "Plaid", tokens: Math.round(totalTokens * 0.25), cost: cost * 0.25 },
        { connector: "Gmail", tokens: Math.round(totalTokens * 0.20), cost: cost * 0.20 },
        { connector: "Calendar", tokens: Math.round(totalTokens * 0.15), cost: cost * 0.15 },
      ],
      forecast: Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", { weekday: "short" }),
        projected: +(cost * (0.9 + Math.random() * 0.3)).toFixed(2),
        budget,
      })),
      recommendations: costAnomalies.length > 0
        ? ["Consider throttling premium model usage", "Review boardroom session frequency"]
        : ["Cost efficiency is within normal range"],
    };
  }, []);
}

// ── Recovery View ───────────────────────────────────────────────
export function useRecoverySummary(): RecoverySummaryView {
  return useMemo(() => ({
    failedWorkflows: 0, stuckWorkflows: stuckWorkflows.length,
    degradedServices: connectorHealth.filter(c => c.status === "degraded").length,
    unresolvedPostconditions: 0, replayQueue: 1, rollbackQueue: 0,
    items: stuckWorkflows.map(w => ({
      id: w.id, workflowName: w.name, status: "stuck" as const,
      stuckSince: w.stuckSince, suggestedAction: "retry" as const,
      domain: "system", impact: w.reason,
    })),
  }), []);
}

// ── Diagnostics View ────────────────────────────────────────────
export function useDiagnosticsSummary(): DiagnosticsSummaryView {
  return useMemo(() => ({
    recentFailures: 2, affectedModules: ["connector-plaid", "workflow-engine"],
    connectorTimeouts: 3, authAnomalies: 0, releaseLinkedFailures: 0,
    correlationIds: ["corr-abc123", "corr-def456"], exportReady: true,
  }), []);
}

// ── AI Team View ────────────────────────────────────────────────
export function useAITeamSummary(): AITeamSummaryView {
  return useMemo(() => {
    const pods = new Map<string, typeof internalAgents>();
    internalAgents.forEach(a => {
      if (!pods.has(a.role)) pods.set(a.role, []);
      pods.get(a.role)!.push(a);
    });
    return {
      totalAgents: internalAgents.length,
      healthyCount: internalAgents.filter(a => a.health === "healthy").length,
      degradedCount: internalAgents.filter(a => a.health === "degraded").length,
      pausedCount: internalAgents.filter(a => a.health === "paused").length,
      totalTokens24h: internalAgents.reduce((s, a) => s + a.costTokens24h, 0),
      totalInvocations24h: internalAgents.reduce((s, a) => s + a.invocations24h, 0),
      stuckTasks: 0, governanceState: "compliant",
      pods: Array.from(pods.entries()).map(([name, agents]) => ({
        name,
        agents: agents.map(a => ({
          id: a.id, name: a.name, role: a.role, health: a.health as never,
          autonomyLevel: a.autonomyLevel, tokens24h: a.costTokens24h,
          invocations24h: a.invocations24h, currentTasks: a.currentTasks,
          recentFindings: a.recentFindings, lastAction: a.lastMajorAction,
        })),
      })),
    };
  }, []);
}

// ── System Activity ─────────────────────────────────────────────
export function useSystemActivity(): SystemActivityEntry[] {
  return useMemo(() => [
    { id: "sa-1", timestamp: new Date(Date.now() - 300000).toISOString(), type: "connector" as const, event: "Plaid health degradation detected", severity: "warning" as const, domain: "connectors", actor: "Connector Health Agent" },
    { id: "sa-2", timestamp: new Date(Date.now() - 1200000).toISOString(), type: "release" as const, event: "Canary health check passed", severity: "success" as const, domain: "releases", actor: "Release Safety Agent" },
    { id: "sa-3", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "cost" as const, event: "Premium model overuse flagged", severity: "warning" as const, domain: "costs", actor: "Cost Guardrail Agent" },
    { id: "sa-4", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "workflow" as const, event: "Grocery reorder flow recovered", severity: "success" as const, domain: "workflows", actor: "Workflow Recovery Agent" },
    { id: "sa-5", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "trust" as const, event: "Trust audit completed — no anomalies", severity: "info" as const, domain: "trust", actor: "Security Watch Agent" },
    { id: "sa-6", timestamp: new Date(Date.now() - 21600000).toISOString(), type: "policy" as const, event: "Knowledge base updated — 3 runbooks", severity: "info" as const, domain: "knowledge", actor: "Knowledge Coordinator" },
  ], []);
}
