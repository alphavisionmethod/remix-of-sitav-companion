// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics Service
// Cost tracking, budget enforcement, model routing economics
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type CostCategory = "inference" | "embedding" | "fine-tuning" | "storage" | "bandwidth" | "tool-call";

export type BudgetPeriod = "hourly" | "daily" | "weekly" | "monthly";

export type BudgetAlertLevel = "info" | "warning" | "critical" | "exceeded";

export interface CostEntry {
  id: string;
  category: CostCategory;
  modelId: string;
  agentId?: string;
  sessionId?: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  duration: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface BudgetConfig {
  id: string;
  name: string;
  period: BudgetPeriod;
  limitUsd: number;
  currentSpend: number;
  alertThresholds: { level: BudgetAlertLevel; percentage: number }[];
  scope: "global" | "agent" | "user" | "domain";
  scopeTarget?: string;
  enabled: boolean;
}

export interface SpendSummary {
  period: BudgetPeriod;
  totalSpend: number;
  byCategory: Record<CostCategory, number>;
  byModel: Record<string, number>;
  byAgent: Record<string, number>;
  totalTokens: number;
  avgCostPerRequest: number;
  requestCount: number;
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  budgetId: string;
  budgetName: string;
  level: BudgetAlertLevel;
  currentSpend: number;
  limit: number;
  percentage: number;
  timestamp: string;
}

export interface ModelCostConfig {
  modelId: string;
  provider: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
  qualityTier: "premium" | "standard" | "economy";
}

const DEFAULT_MODEL_COSTS: ModelCostConfig[] = [
  { modelId: "gpt-4o", provider: "openai", inputCostPer1k: 0.005, outputCostPer1k: 0.015, contextWindow: 128000, qualityTier: "premium" },
  { modelId: "gpt-4o-mini", provider: "openai", inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, contextWindow: 128000, qualityTier: "standard" },
  { modelId: "claude-3.5-sonnet", provider: "anthropic", inputCostPer1k: 0.003, outputCostPer1k: 0.015, contextWindow: 200000, qualityTier: "premium" },
  { modelId: "claude-3-haiku", provider: "anthropic", inputCostPer1k: 0.00025, outputCostPer1k: 0.00125, contextWindow: 200000, qualityTier: "economy" },
];

export class AIEconomicsService {
  private entries: CostEntry[] = [];
  private budgets: Map<string, BudgetConfig> = new Map();
  private modelCosts: Map<string, ModelCostConfig> = new Map();
  private alerts: BudgetAlert[] = [];

  constructor() {
    DEFAULT_MODEL_COSTS.forEach(mc => this.modelCosts.set(mc.modelId, mc));
  }

  recordCost(entry: Omit<CostEntry, "id" | "timestamp" | "costUsd">): CostEntry {
    const modelCost = this.modelCosts.get(entry.modelId);
    const costUsd = modelCost
      ? (entry.inputTokens / 1000) * modelCost.inputCostPer1k + (entry.outputTokens / 1000) * modelCost.outputCostPer1k
      : (entry.totalTokens / 1000) * 0.002;

    const full: CostEntry = {
      ...entry,
      id: crypto.randomUUID(),
      costUsd,
      timestamp: new Date().toISOString(),
    };

    this.entries.push(full);
    if (this.entries.length > 10000) this.entries = this.entries.slice(-10000);

    this.checkBudgets(full);
    return full;
  }

  setBudget(config: BudgetConfig): BudgetConfig {
    this.budgets.set(config.id, config);
    return config;
  }

  getBudget(id: string): BudgetConfig | null {
    return this.budgets.get(id) ?? null;
  }

  getSummary(period: BudgetPeriod = "daily"): SpendSummary {
    const cutoff = this.getPeriodCutoff(period);
    const periodEntries = this.entries.filter(e => e.timestamp >= cutoff);

    const byCategory: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byAgent: Record<string, number> = {};

    periodEntries.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.costUsd;
      byModel[e.modelId] = (byModel[e.modelId] ?? 0) + e.costUsd;
      if (e.agentId) byAgent[e.agentId] = (byAgent[e.agentId] ?? 0) + e.costUsd;
    });

    const totalSpend = periodEntries.reduce((s, e) => s + e.costUsd, 0);

    return {
      period,
      totalSpend,
      byCategory: byCategory as Record<CostCategory, number>,
      byModel,
      byAgent,
      totalTokens: periodEntries.reduce((s, e) => s + e.totalTokens, 0),
      avgCostPerRequest: periodEntries.length > 0 ? totalSpend / periodEntries.length : 0,
      requestCount: periodEntries.length,
      alerts: this.alerts.filter(a => a.timestamp >= cutoff),
    };
  }

  getModelCosts(): ModelCostConfig[] {
    return Array.from(this.modelCosts.values());
  }

  setModelCost(config: ModelCostConfig): void {
    this.modelCosts.set(config.modelId, config);
  }

  selectCostEffectiveModel(qualityRequired: "premium" | "standard" | "economy", maxTokens: number): ModelCostConfig | null {
    const candidates = Array.from(this.modelCosts.values())
      .filter(mc => mc.contextWindow >= maxTokens);

    const tierOrder = { economy: 0, standard: 1, premium: 2 };
    const minTier = tierOrder[qualityRequired];

    const eligible = candidates.filter(mc => tierOrder[mc.qualityTier] >= minTier);
    eligible.sort((a, b) => a.inputCostPer1k - b.inputCostPer1k);

    return eligible[0] ?? null;
  }

  getAlerts(limit: number = 50): BudgetAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  private checkBudgets(entry: CostEntry) {
    this.budgets.forEach(budget => {
      if (!budget.enabled) return;
      const cutoff = this.getPeriodCutoff(budget.period);
      const spend = this.entries
        .filter(e => e.timestamp >= cutoff)
        .filter(e => {
          if (budget.scope === "global") return true;
          if (budget.scope === "agent") return e.agentId === budget.scopeTarget;
          if (budget.scope === "user") return e.userId === budget.scopeTarget;
          return true;
        })
        .reduce((s, e) => s + e.costUsd, 0);

      budget.currentSpend = spend;
      const pct = (spend / budget.limitUsd) * 100;

      for (const threshold of budget.alertThresholds) {
        if (pct >= threshold.percentage) {
          const existing = this.alerts.find(a => a.budgetId === budget.id && a.level === threshold.level && a.timestamp >= cutoff);
          if (!existing) {
            this.alerts.push({
              budgetId: budget.id,
              budgetName: budget.name,
              level: threshold.level,
              currentSpend: spend,
              limit: budget.limitUsd,
              percentage: pct,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    });
  }

  private getPeriodCutoff(period: BudgetPeriod): string {
    const now = new Date();
    switch (period) {
      case "hourly": return new Date(now.getTime() - 3600_000).toISOString();
      case "daily": { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString(); }
      case "weekly": { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d.toISOString(); }
      case "monthly": { const d = new Date(now); d.setDate(1); d.setHours(0, 0, 0, 0); return d.toISOString(); }
    }
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("ai-economics", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      entries: this.entries,
      budgets: Array.from(this.budgets.entries()),
      modelCosts: Array.from(this.modelCosts.entries()),
      alerts: this.alerts,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.entries) this.entries = state.entries as never;
    if (state.budgets) this.budgets = new Map(state.budgets as [string, unknown][]);
    if (state.modelCosts) this.modelCosts = new Map(state.modelCosts as [string, unknown][]);
    if (state.alerts) this.alerts = state.alerts as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("ai-economics");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createAIEconomics(): AIEconomicsService {
  return new AIEconomicsService();
}
