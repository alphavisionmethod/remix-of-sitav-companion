// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Service (consolidated)
// Merges admin-backend + admin-intelligence into unified service
// Audit, dashboards, governance hints, incidents, policies,
// intelligence engines, council decisions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved" | "closed";
export type PolicyCategory = "trust" | "access" | "spending" | "automation" | "data" | "communication";
export type CouncilDecisionStatus = "pending" | "approved" | "rejected" | "tabled";

// ── Core Interfaces ─────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export interface AdminDashboard {
  id: string;
  name: string;
  widgets: AdminWidget[];
  lastUpdated: string;
}

export interface AdminWidget {
  id: string;
  type: "metric" | "chart" | "table" | "alert-feed";
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
}

export interface GovernanceHint {
  id: string;
  category: PolicyCategory;
  severity: "info" | "warning" | "action-required";
  title: string;
  description: string;
  recommendation: string;
  affectedEntities: string[];
  createdAt: string;
}

export interface AdminIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  affectedServices: string[];
  timeline: Array<{ timestamp: string; action: string; actor: string }>;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminPolicy {
  id: string;
  name: string;
  category: PolicyCategory;
  isActive: boolean;
  rules: Array<{ condition: string; action: string; threshold?: number }>;
  lastModified: string;
  createdBy: string;
}

export interface IntelligenceInsight {
  id: string;
  type: "anomaly" | "forecast" | "optimization" | "risk";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  suggestedAction?: string;
  dataPoints: Record<string, number>;
  generatedAt: string;
}

// ── Council Decision Interface ──────────────────────────────────

export interface CouncilDecision {
  id: string;
  title: string;
  status: CouncilDecisionStatus;
  domain: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstained: number;
  createdAt: string;
  deadline: string;
  resolvedAt?: string;
}

// ── Intelligence Engine Types ───────────────────────────────────

export interface AnomalyResult {
  metricName: string;
  value: number;
  mean: number;
  stdDev: number;
  zScore: number;
  isAnomaly: boolean;
  severity: IncidentSeverity;
}

export interface ForecastResult {
  metric: string;
  currentValue: number;
  projectedValues: Array<{ period: number; value: number; lowerBound: number; upperBound: number }>;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
}

export interface OptimizationResult {
  resourceId: string;
  currentAllocation: number;
  suggestedAllocation: number;
  expectedImpact: string;
  priority: "low" | "medium" | "high";
}

// ── Admin Service Class ─────────────────────────────────────────

export class AdminService {
  private auditLog: AuditLogEntry[] = [];
  private dashboards = new Map<string, AdminDashboard>();
  private hints: GovernanceHint[] = [];
  private incidents = new Map<string, AdminIncident>();
  private policies = new Map<string, AdminPolicy>();
  private insights: IntelligenceInsight[] = [];
  private councilDecisions = new Map<string, CouncilDecision>();
  private maxAuditLog = 10_000;

  // ── Audit ─────────────────────────────────────────────────────

  recordAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const record: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLog.push(record);
    if (this.auditLog.length > this.maxAuditLog) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLog);
    }
    return record;
  }

  getAuditLog(options?: { userId?: string; action?: string; since?: string; limit?: number }): AuditLogEntry[] {
    let log = [...this.auditLog];
    if (options?.userId) log = log.filter(e => e.userId === options.userId);
    if (options?.action) log = log.filter(e => e.action === options.action);
    if (options?.since) log = log.filter(e => e.timestamp >= options.since!);
    log.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return options?.limit ? log.slice(0, options.limit) : log;
  }

  // ── Dashboards ────────────────────────────────────────────────

  createDashboard(name: string, widgets: AdminWidget[] = []): AdminDashboard {
    const dashboard: AdminDashboard = {
      id: `dash-${Date.now()}`,
      name,
      widgets,
      lastUpdated: new Date().toISOString(),
    };
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  getDashboard(dashboardId: string): AdminDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  listDashboards(): AdminDashboard[] {
    return Array.from(this.dashboards.values());
  }

  // ── Governance Hints ──────────────────────────────────────────

  addGovernanceHint(hint: Omit<GovernanceHint, "id" | "createdAt">): GovernanceHint {
    const record: GovernanceHint = {
      ...hint,
      id: `hint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.hints.push(record);
    return record;
  }

  getGovernanceHints(category?: PolicyCategory): GovernanceHint[] {
    return category ? this.hints.filter(h => h.category === category) : [...this.hints];
  }

  // ── Incidents ─────────────────────────────────────────────────

  createIncident(incident: Omit<AdminIncident, "id" | "createdAt" | "timeline">): AdminIncident {
    const record: AdminIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timeline: [{ timestamp: new Date().toISOString(), action: "Incident created", actor: "system" }],
      createdAt: new Date().toISOString(),
    };
    this.incidents.set(record.id, record);
    return record;
  }

  updateIncidentStatus(incidentId: string, status: IncidentStatus, actor: string): AdminIncident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;
    incident.status = status;
    incident.timeline.push({ timestamp: new Date().toISOString(), action: `Status changed to ${status}`, actor });
    if (status === "resolved" || status === "closed") incident.resolvedAt = new Date().toISOString();
    return incident;
  }

  listIncidents(status?: IncidentStatus): AdminIncident[] {
    const all = Array.from(this.incidents.values());
    return status ? all.filter(i => i.status === status) : all;
  }

  // ── Policies ──────────────────────────────────────────────────

  createPolicy(policy: Omit<AdminPolicy, "id" | "lastModified">): AdminPolicy {
    const record: AdminPolicy = {
      ...policy,
      id: `pol-${Date.now()}`,
      lastModified: new Date().toISOString(),
    };
    this.policies.set(record.id, record);
    return record;
  }

  getPolicies(category?: PolicyCategory): AdminPolicy[] {
    const all = Array.from(this.policies.values());
    return category ? all.filter(p => p.category === category) : all;
  }

  togglePolicy(policyId: string): AdminPolicy | null {
    const policy = this.policies.get(policyId);
    if (!policy) return null;
    policy.isActive = !policy.isActive;
    policy.lastModified = new Date().toISOString();
    return policy;
  }

  // ── Intelligence Insights ─────────────────────────────────────

  addInsight(insight: Omit<IntelligenceInsight, "id" | "generatedAt">): IntelligenceInsight {
    const record: IntelligenceInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
      generatedAt: new Date().toISOString(),
    };
    this.insights.push(record);
    return record;
  }

  getIntelligence(type?: IntelligenceInsight["type"]): IntelligenceInsight[] {
    return type ? this.insights.filter(i => i.type === type) : [...this.insights];
  }

  getHighImpactInsights(): IntelligenceInsight[] {
    return this.insights.filter(i => i.impact === "high" && i.confidence > 0.7);
  }

  // ── Council Decisions ─────────────────────────────────────────

  createCouncilDecision(
    decision: Omit<CouncilDecision, "id" | "createdAt" | "votesFor" | "votesAgainst" | "votesAbstained">
  ): CouncilDecision {
    const record: CouncilDecision = {
      ...decision,
      id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      votesFor: 0,
      votesAgainst: 0,
      votesAbstained: 0,
      createdAt: new Date().toISOString(),
    };
    this.councilDecisions.set(record.id, record);
    this.recordAudit({
      userId: "system",
      action: "council_decision_created",
      resource: "council_decisions",
      resourceId: record.id,
      details: { title: record.title, domain: record.domain },
      severity: "info",
    });
    return record;
  }

  listCouncilDecisions(status?: CouncilDecisionStatus): CouncilDecision[] {
    const all = Array.from(this.councilDecisions.values());
    const filtered = status ? all.filter(d => d.status === status) : all;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  voteOnDecision(
    decisionId: string,
    vote: "for" | "against" | "abstain",
    actor: string
  ): CouncilDecision | null {
    const decision = this.councilDecisions.get(decisionId);
    if (!decision || decision.status !== "pending") return null;

    if (vote === "for") decision.votesFor++;
    else if (vote === "against") decision.votesAgainst++;
    else decision.votesAbstained++;

    this.recordAudit({
      userId: actor,
      action: "council_vote_cast",
      resource: "council_decisions",
      resourceId: decisionId,
      details: { vote },
      severity: "info",
    });
    return decision;
  }

  resolveDecision(
    decisionId: string,
    resolution: CouncilDecisionStatus,
    actor: string
  ): CouncilDecision | null {
    const decision = this.councilDecisions.get(decisionId);
    if (!decision) return null;

    decision.status = resolution;
    decision.resolvedAt = new Date().toISOString();

    this.recordAudit({
      userId: actor,
      action: "council_decision_resolved",
      resource: "council_decisions",
      resourceId: decisionId,
      details: { resolution, votesFor: decision.votesFor, votesAgainst: decision.votesAgainst },
      severity: resolution === "rejected" ? "warning" : "info",
    });
    return decision;
  }

  // ── Intelligence Engines ──────────────────────────────────────

  detectAnomalies(metrics: Record<string, number[]>): AnomalyResult[] {
    const results: AnomalyResult[] = [];

    for (const [name, values] of Object.entries(metrics)) {
      if (values.length < 3) continue;

      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const latest = values[values.length - 1];
      const zScore = stdDev === 0 ? 0 : Math.abs((latest - mean) / stdDev);
      const isAnomaly = zScore > 2;

      let severity: IncidentSeverity = "low";
      if (zScore > 4) severity = "critical";
      else if (zScore > 3) severity = "high";
      else if (zScore > 2) severity = "medium";

      results.push({ metricName: name, value: latest, mean, stdDev, zScore, isAnomaly, severity });

      if (isAnomaly) {
        this.addInsight({
          type: "anomaly",
          title: `Anomaly detected in ${name}`,
          description: `Value ${latest.toFixed(2)} deviates ${zScore.toFixed(1)}σ from mean ${mean.toFixed(2)}`,
          confidence: Math.min(0.99, 0.5 + zScore * 0.1),
          impact: severity === "critical" || severity === "high" ? "high" : severity === "medium" ? "medium" : "low",
          suggestedAction: `Investigate ${name} — current value is ${zScore.toFixed(1)} standard deviations from normal`,
          dataPoints: { latest, mean, stdDev, zScore },
        });
      }
    }

    return results;
  }

  forecast(
    metric: string,
    historicalValues: number[],
    horizon: number = 5
  ): ForecastResult {
    const n = historicalValues.length;
    if (n < 2) {
      const v = historicalValues[0] ?? 0;
      return {
        metric,
        currentValue: v,
        projectedValues: Array.from({ length: horizon }, (_, i) => ({
          period: i + 1, value: v, lowerBound: v * 0.9, upperBound: v * 1.1,
        })),
        trend: "stable",
        confidence: 0.3,
      };
    }

    // Linear regression: y = a + b*x
    const xMean = (n - 1) / 2;
    const yMean = historicalValues.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (historicalValues[i] - yMean);
      den += (i - xMean) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = yMean - slope * xMean;

    // Residual standard error
    const residuals = historicalValues.map((v, i) => v - (intercept + slope * i));
    const rse = Math.sqrt(residuals.reduce((s, r) => s + r ** 2, 0) / Math.max(1, n - 2));

    const currentValue = historicalValues[n - 1];
    const projectedValues = Array.from({ length: horizon }, (_, i) => {
      const period = i + 1;
      const predicted = intercept + slope * (n - 1 + period);
      const margin = rse * Math.sqrt(1 + 1 / n + ((n - 1 + period - xMean) ** 2) / (den || 1)) * 1.96;
      return {
        period,
        value: Math.round(predicted * 100) / 100,
        lowerBound: Math.round((predicted - margin) * 100) / 100,
        upperBound: Math.round((predicted + margin) * 100) / 100,
      };
    });

    const slopeRatio = Math.abs(slope) / (yMean || 1);
    const trend: ForecastResult["trend"] = slopeRatio < 0.02 ? "stable" : slope > 0 ? "increasing" : "decreasing";

    // R² for confidence
    const ssRes = residuals.reduce((s, r) => s + r ** 2, 0);
    const ssTot = historicalValues.reduce((s, v) => s + (v - yMean) ** 2, 0);
    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

    return { metric, currentValue, projectedValues, trend, confidence: Math.round(rSquared * 100) / 100 };
  }

  optimizeAllocation(
    resources: Array<{ id: string; currentAllocation: number; efficiency: number; maxCapacity: number }>,
    totalBudget: number
  ): OptimizationResult[] {
    // Greedy allocation by efficiency (highest efficiency first)
    const sorted = [...resources].sort((a, b) => b.efficiency - a.efficiency);
    let remaining = totalBudget;
    const allocations = new Map<string, number>();

    for (const resource of sorted) {
      const allocation = Math.min(resource.maxCapacity, remaining);
      allocations.set(resource.id, allocation);
      remaining -= allocation;
      if (remaining <= 0) break;
    }

    // Distribute any remaining budget to under-filled resources
    if (remaining > 0) {
      for (const resource of sorted) {
        const current = allocations.get(resource.id) ?? 0;
        const headroom = resource.maxCapacity - current;
        if (headroom > 0) {
          const extra = Math.min(headroom, remaining);
          allocations.set(resource.id, current + extra);
          remaining -= extra;
          if (remaining <= 0) break;
        }
      }
    }

    return resources.map(r => {
      const suggested = allocations.get(r.id) ?? 0;
      const delta = suggested - r.currentAllocation;
      const absDelta = Math.abs(delta);
      const pctChange = r.currentAllocation === 0 ? 100 : (absDelta / r.currentAllocation) * 100;

      let priority: OptimizationResult["priority"] = "low";
      if (pctChange > 30) priority = "high";
      else if (pctChange > 10) priority = "medium";

      const direction = delta > 0 ? "increase" : delta < 0 ? "decrease" : "maintain";
      return {
        resourceId: r.id,
        currentAllocation: r.currentAllocation,
        suggestedAllocation: Math.round(suggested * 100) / 100,
        expectedImpact: `${direction} by ${absDelta.toFixed(0)} units (${pctChange.toFixed(1)}% change, efficiency: ${r.efficiency})`,
        priority,
      };
    });
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("admin-service", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      auditLog: this.auditLog,
      dashboards: Array.from(this.dashboards.entries()),
      hints: this.hints,
      incidents: Array.from(this.incidents.entries()),
      policies: Array.from(this.policies.entries()),
      insights: this.insights,
      councilDecisions: Array.from(this.councilDecisions.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.auditLog) this.auditLog = state.auditLog as any;
    if (state.dashboards) this.dashboards = new Map(state.dashboards as any);
    if (state.hints) this.hints = state.hints as any;
    if (state.incidents) this.incidents = new Map(state.incidents as any);
    if (state.policies) this.policies = new Map(state.policies as any);
    if (state.insights) this.insights = state.insights as any;
    if (state.councilDecisions) this.councilDecisions = new Map(state.councilDecisions as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("admin-service");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createAdminService(): AdminService {
  return new AdminService();
}
