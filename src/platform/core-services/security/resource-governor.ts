// ═══════════════════════════════════════════════════════════════
// SITA OS — Resource Governor
// Per-app CPU/memory/FD/network budgets with enforcement actions,
// budget policies per trust ring, real-time metering
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type ResourceType = "cpu" | "memory" | "file-descriptors" | "network" | "storage" | "ai-compute" | "background-time";
export type EnforcementAction = "allow" | "throttle" | "warn" | "kill" | "deny" | "alert";
export type BudgetPeriod = "per-second" | "per-minute" | "per-hour" | "per-day";

export interface ResourceBudget {
  id: string;
  processId: string;
  appId: string;
  trustRing: number;
  limits: ResourceLimit[];
  currentUsage: ResourceUsage[];
  enforcementHistory: EnforcementEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceLimit {
  resource: ResourceType;
  maxValue: number;
  unit: string;
  period: BudgetPeriod;
  warningThreshold: number; // 0-1
  criticalThreshold: number; // 0-1
  enforcementAction: EnforcementAction;
  hardCap: boolean;
}

export interface ResourceUsage {
  resource: ResourceType;
  currentValue: number;
  peakValue: number;
  averageValue: number;
  utilizationPercent: number;
  lastUpdated: string;
  samples: number;
}

export interface EnforcementEvent {
  id: string;
  timestamp: string;
  processId: string;
  resource: ResourceType;
  action: EnforcementAction;
  currentValue: number;
  limitValue: number;
  utilizationPercent: number;
  reason: string;
}

export interface ResourcePolicy {
  trustRing: number;
  limits: Record<ResourceType, { max: number; unit: string; period: BudgetPeriod }>;
}

export interface GovernorMetrics {
  totalBudgets: number;
  activeBudgets: number;
  enforcementEvents: number;
  throttledProcesses: number;
  killedProcesses: number;
  resourceUtilization: Record<ResourceType, { total: number; used: number; percent: number }>;
}

// ── Default Ring Policies ──────────────────────────────────────

const DEFAULT_RING_POLICIES: ResourcePolicy[] = [
  { trustRing: 0, limits: { cpu: { max: 100, unit: "%", period: "per-second" }, memory: { max: 4096, unit: "MB", period: "per-second" }, "file-descriptors": { max: 65536, unit: "count", period: "per-second" }, network: { max: 1000, unit: "MB/s", period: "per-second" }, storage: { max: 100000, unit: "MB", period: "per-day" }, "ai-compute": { max: 10000, unit: "tokens", period: "per-hour" }, "background-time": { max: 86400, unit: "seconds", period: "per-day" } } },
  { trustRing: 1, limits: { cpu: { max: 80, unit: "%", period: "per-second" }, memory: { max: 2048, unit: "MB", period: "per-second" }, "file-descriptors": { max: 8192, unit: "count", period: "per-second" }, network: { max: 500, unit: "MB/s", period: "per-second" }, storage: { max: 50000, unit: "MB", period: "per-day" }, "ai-compute": { max: 5000, unit: "tokens", period: "per-hour" }, "background-time": { max: 43200, unit: "seconds", period: "per-day" } } },
  { trustRing: 2, limits: { cpu: { max: 50, unit: "%", period: "per-second" }, memory: { max: 1024, unit: "MB", period: "per-second" }, "file-descriptors": { max: 2048, unit: "count", period: "per-second" }, network: { max: 100, unit: "MB/s", period: "per-second" }, storage: { max: 10000, unit: "MB", period: "per-day" }, "ai-compute": { max: 2000, unit: "tokens", period: "per-hour" }, "background-time": { max: 14400, unit: "seconds", period: "per-day" } } },
  { trustRing: 3, limits: { cpu: { max: 25, unit: "%", period: "per-second" }, memory: { max: 512, unit: "MB", period: "per-second" }, "file-descriptors": { max: 512, unit: "count", period: "per-second" }, network: { max: 20, unit: "MB/s", period: "per-second" }, storage: { max: 2000, unit: "MB", period: "per-day" }, "ai-compute": { max: 500, unit: "tokens", period: "per-hour" }, "background-time": { max: 3600, unit: "seconds", period: "per-day" } } },
  { trustRing: 4, limits: { cpu: { max: 10, unit: "%", period: "per-second" }, memory: { max: 128, unit: "MB", period: "per-second" }, "file-descriptors": { max: 64, unit: "count", period: "per-second" }, network: { max: 5, unit: "MB/s", period: "per-second" }, storage: { max: 500, unit: "MB", period: "per-day" }, "ai-compute": { max: 0, unit: "tokens", period: "per-hour" }, "background-time": { max: 600, unit: "seconds", period: "per-day" } } },
];

// ── Engine ─────────────────────────────────────────────────────

export class ResourceGovernor {
  private budgets: Map<string, ResourceBudget> = new Map();
  private ringPolicies: ResourcePolicy[] = [...DEFAULT_RING_POLICIES];
  private enforcementLog: EnforcementEvent[] = [];
  private listeners: Array<(event: EnforcementEvent) => void> = [];
  private eventCounter = 0;

  // ── Budget Lifecycle ───────────────────────────────────────

  allocateBudget(processId: string, appId: string, trustRing: number): ResourceBudget {
    const policy = this.ringPolicies.find((p) => p.trustRing === trustRing) ?? this.ringPolicies[this.ringPolicies.length - 1];

    const limits: ResourceLimit[] = Object.entries(policy.limits).map(([resource, cfg]) => ({
      resource: resource as ResourceType,
      maxValue: cfg.max,
      unit: cfg.unit,
      period: cfg.period,
      warningThreshold: 0.75,
      criticalThreshold: 0.9,
      enforcementAction: trustRing >= 3 ? "kill" : "throttle",
      hardCap: trustRing >= 3,
    }));

    const usage: ResourceUsage[] = limits.map((l) => ({
      resource: l.resource,
      currentValue: 0,
      peakValue: 0,
      averageValue: 0,
      utilizationPercent: 0,
      lastUpdated: new Date().toISOString(),
      samples: 0,
    }));

    const budget: ResourceBudget = {
      id: `budget-${processId}`,
      processId,
      appId,
      trustRing,
      limits,
      currentUsage: usage,
      enforcementHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.budgets.set(processId, budget);
    return budget;
  }

  releaseBudget(processId: string): void {
    this.budgets.delete(processId);
  }

  // ── Metering ───────────────────────────────────────────────

  reportUsage(processId: string, resource: ResourceType, value: number): EnforcementAction {
    const budget = this.budgets.get(processId);
    if (!budget) return "allow";

    const usage = budget.currentUsage.find((u) => u.resource === resource);
    const limit = budget.limits.find((l) => l.resource === resource);
    if (!usage || !limit) return "allow";

    // Update usage
    usage.samples++;
    usage.currentValue = value;
    usage.peakValue = Math.max(usage.peakValue, value);
    usage.averageValue = usage.averageValue + (value - usage.averageValue) / usage.samples;
    usage.utilizationPercent = limit.maxValue > 0 ? (value / limit.maxValue) * 100 : 0;
    usage.lastUpdated = new Date().toISOString();
    budget.updatedAt = usage.lastUpdated;

    // Evaluate enforcement
    const ratio = limit.maxValue > 0 ? value / limit.maxValue : 0;

    if (ratio >= 1 && limit.hardCap) {
      return this.enforce(budget, resource, "kill", value, limit.maxValue, "Hard cap exceeded");
    }
    if (ratio >= limit.criticalThreshold) {
      return this.enforce(budget, resource, limit.enforcementAction, value, limit.maxValue, "Critical threshold exceeded");
    }
    if (ratio >= limit.warningThreshold) {
      return this.enforce(budget, resource, "warn", value, limit.maxValue, "Warning threshold exceeded");
    }

    return "allow";
  }

  // ── Queries ────────────────────────────────────────────────

  getBudget(processId: string): ResourceBudget | null {
    return this.budgets.get(processId) ?? null;
  }

  getAllBudgets(): ResourceBudget[] {
    return Array.from(this.budgets.values());
  }

  getEnforcementLog(limit = 100): EnforcementEvent[] {
    return this.enforcementLog.slice(-limit);
  }

  getMetrics(): GovernorMetrics {
    const budgets = Array.from(this.budgets.values());
    const utilization: Record<ResourceType, { total: number; used: number; percent: number }> = {} as any;

    const resourceTypes: ResourceType[] = ["cpu", "memory", "file-descriptors", "network", "storage", "ai-compute", "background-time"];
    for (const rt of resourceTypes) {
      let totalLimit = 0;
      let totalUsed = 0;
      for (const b of budgets) {
        const limit = b.limits.find((l) => l.resource === rt);
        const usage = b.currentUsage.find((u) => u.resource === rt);
        if (limit) totalLimit += limit.maxValue;
        if (usage) totalUsed += usage.currentValue;
      }
      utilization[rt] = { total: totalLimit, used: totalUsed, percent: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0 };
    }

    return {
      totalBudgets: budgets.length,
      activeBudgets: budgets.length,
      enforcementEvents: this.enforcementLog.length,
      throttledProcesses: new Set(this.enforcementLog.filter((e) => e.action === "throttle").map((e) => e.processId)).size,
      killedProcesses: new Set(this.enforcementLog.filter((e) => e.action === "kill").map((e) => e.processId)).size,
      resourceUtilization: utilization,
    };
  }

  // ── Policy ─────────────────────────────────────────────────

  updateRingPolicy(trustRing: number, updates: Partial<Record<ResourceType, { max: number }>>): void {
    const policy = this.ringPolicies.find((p) => p.trustRing === trustRing);
    if (!policy) return;
    for (const [resource, update] of Object.entries(updates)) {
      if (policy.limits[resource as ResourceType]) {
        policy.limits[resource as ResourceType].max = update.max;
      }
    }
  }

  // ── Events ─────────────────────────────────────────────────

  onEnforcement(listener: (event: EnforcementEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Internal ───────────────────────────────────────────────

  private enforce(budget: ResourceBudget, resource: ResourceType, action: EnforcementAction, current: number, limit: number, reason: string): EnforcementAction {
    const event: EnforcementEvent = {
      id: `enf-${++this.eventCounter}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processId: budget.processId,
      resource,
      action,
      currentValue: current,
      limitValue: limit,
      utilizationPercent: limit > 0 ? (current / limit) * 100 : 0,
      reason,
    };

    budget.enforcementHistory.push(event);
    this.enforcementLog.push(event);

    if (this.enforcementLog.length > 10_000) {
      this.enforcementLog = this.enforcementLog.slice(-10_000);
    }

    for (const l of this.listeners) {
      try { l(event); } catch { /* isolation */ }
    }

    return action;
  }
}

export function createResourceGovernor(): ResourceGovernor {
  return new ResourceGovernor();
}
