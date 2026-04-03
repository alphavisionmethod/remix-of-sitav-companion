// ═══════════════════════════════════════════════════════════════
// SITA OS — Token Governance & Model Routing Engine
// Cost-aware AI routing, budgets, anomaly detection
// ═══════════════════════════════════════════════════════════════

import type {
  ModelRoute, ModelTier, ModelRoutingDecision, TokenBudget,
  TokenUsageRecord, InferenceAnomaly, ContextCompression,
  TokenSpendDashboard, TokenGovernanceConfig,
} from "../types/token-governance.types";

const DEFAULT_ROUTES: ModelRoute[] = [
  { id: "structured", name: "No LLM (Structured)", tier: "no_llm", provider: "local", model: "structured-state", costPer1kTokens: 0, latencyMs: 1, capabilities: ["lookup", "calculation", "state_transition"], maxContextTokens: 0, suitableFor: ["status_check", "calculation", "lookup", "state_transition"], active: true },
  { id: "flash", name: "Gemini Flash", tier: "cheap", provider: "google", model: "gemini-3-flash-preview", costPer1kTokens: 0.00015, latencyMs: 300, capabilities: ["summarize", "classify", "extract", "simple_reasoning"], maxContextTokens: 128000, suitableFor: ["summary", "classification", "extraction", "simple_qa"], active: true },
  { id: "mid", name: "GPT-4o Mini", tier: "mid", provider: "openai", model: "gpt-4o-mini", costPer1kTokens: 0.0003, latencyMs: 500, capabilities: ["reasoning", "analysis", "generation", "code"], maxContextTokens: 128000, suitableFor: ["analysis", "recommendation", "draft", "code_review"], active: true },
  { id: "premium", name: "Claude 4 Sonnet", tier: "premium", provider: "anthropic", model: "claude-sonnet-4-20250514", costPer1kTokens: 0.003, latencyMs: 1000, capabilities: ["deep_reasoning", "complex_analysis", "strategy", "nuanced_generation"], maxContextTokens: 200000, suitableFor: ["boardroom", "strategy", "complex_decision", "policy_analysis", "negotiation"], active: true },
];

const DEFAULT_CONFIG: TokenGovernanceConfig = {
  defaultModelTier: "cheap",
  cheapModeThreshold: 100,
  structuredStateFirst: true,
  reuseBoardroomPackets: true,
  reuseSummaries: true,
  compressionEnabled: true,
  anomalyDetectionEnabled: true,
  backgroundReasoningEnabled: true,
  eventDrivenReasoning: true,
  premiumEntitlements: ["enterprise"],
};

export class TokenGovernanceEngine {
  private routes: ModelRoute[] = [...DEFAULT_ROUTES];
  private budgets: Map<string, TokenBudget> = new Map();
  private usageRecords: TokenUsageRecord[] = [];
  private anomalies: InferenceAnomaly[] = [];
  private config: TokenGovernanceConfig;

  constructor(config: Partial<TokenGovernanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Model Routing ───────────────────────────────────────────
  routeRequest(context: {
    domain: string;
    workflowType: string;
    complexity: "trivial" | "simple" | "moderate" | "complex" | "critical";
    userId: string;
    estimatedTokens: number;
  }): ModelRoutingDecision {
    // 1. Try structured/no-LLM first
    if (this.config.structuredStateFirst && ["trivial", "simple"].includes(context.complexity)) {
      const structured = this.routes.find(r => r.tier === "no_llm" && r.active);
      if (structured && structured.suitableFor.some(s => context.workflowType.includes(s))) {
        return this.createDecision(context, structured, "Handled by structured state — no LLM needed");
      }
    }

    // 2. Check budget
    const budget = this.getUserBudget(context.userId);
    if (budget && budget.remaining < context.estimatedTokens && budget.hardLimit) {
      const cheapest = this.routes.filter(r => r.active).sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)[0];
      return this.createDecision(context, cheapest, "Budget constrained — using cheapest model");
    }

    // 3. Route by complexity
    const tierMap: Record<string, ModelTier> = {
      trivial: "no_llm",
      simple: "cheap",
      moderate: "mid",
      complex: "premium",
      critical: "premium",
    };
    const targetTier = tierMap[context.complexity] || this.config.defaultModelTier;
    const candidates = this.routes.filter(r => r.tier === targetTier && r.active);
    const selected = candidates[0] || this.routes.find(r => r.tier === "cheap" && r.active)!;

    return this.createDecision(context, selected, `Routed to ${targetTier} tier based on complexity: ${context.complexity}`);
  }

  // ── Budget Management ───────────────────────────────────────
  setBudget(budget: TokenBudget): void {
    this.budgets.set(`${budget.scope}:${budget.scopeId}`, budget);
  }

  getUserBudget(userId: string): TokenBudget | undefined {
    return this.budgets.get(`user:${userId}`) || this.budgets.get(`daily:global`);
  }

  recordUsage(record: Omit<TokenUsageRecord, "id" | "timestamp">): TokenUsageRecord {
    const usage: TokenUsageRecord = {
      ...record,
      id: `usage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.usageRecords.push(usage);

    // Update budget
    const budget = this.getUserBudget(record.userId);
    if (budget) {
      budget.used += record.totalTokens;
      budget.remaining = Math.max(0, budget.limit - budget.used);
      if (budget.used > budget.limit * (budget.alertThreshold / 100)) {
        this.detectAnomaly("budget_breach", `User ${record.userId} at ${((budget.used / budget.limit) * 100).toFixed(0)}% of budget`, record.userId, record.cost);
      }
    }

    // Anomaly detection
    if (this.config.anomalyDetectionEnabled) {
      this.checkForAnomalies(usage);
    }

    return usage;
  }

  // ── Compression ─────────────────────────────────────────────
  estimateCompression(originalTokens: number, method: ContextCompression["method"]): ContextCompression {
    const ratios: Record<string, number> = { summary: 0.3, key_extraction: 0.4, sliding_window: 0.6, reuse_packet: 0.1 };
    const ratio = ratios[method] || 0.5;
    return {
      originalTokens,
      compressedTokens: Math.round(originalTokens * ratio),
      compressionRatio: ratio,
      method,
      qualityScore: method === "reuse_packet" ? 0.95 : method === "summary" ? 0.8 : 0.9,
    };
  }

  // ── Dashboard ───────────────────────────────────────────────
  getDashboard(period: string = "today"): TokenSpendDashboard {
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    const byDomain: Record<string, { tokens: number; cost: number }> = {};
    const byAdvisor: Record<string, { tokens: number; cost: number }> = {};
    const byWorkflow: Record<string, { tokens: number; cost: number }> = {};

    for (const r of this.usageRecords) {
      const m = byModel[r.model] || (byModel[r.model] = { tokens: 0, cost: 0 });
      m.tokens += r.totalTokens; m.cost += r.cost;

      const d = byDomain[r.domain] || (byDomain[r.domain] = { tokens: 0, cost: 0 });
      d.tokens += r.totalTokens; d.cost += r.cost;

      if (r.advisorId) {
        const a = byAdvisor[r.advisorId] || (byAdvisor[r.advisorId] = { tokens: 0, cost: 0 });
        a.tokens += r.totalTokens; a.cost += r.cost;
      }

      if (r.workflowId) {
        const w = byWorkflow[r.workflowId] || (byWorkflow[r.workflowId] = { tokens: 0, cost: 0 });
        w.tokens += r.totalTokens; w.cost += r.cost;
      }
    }

    const toArr = (map: Record<string, { tokens: number; cost: number }>, key: string) =>
      Object.entries(map).map(([k, v]) => ({ [key]: k, ...v }));

    const totalSpend = this.usageRecords.reduce((s, r) => s + r.cost, 0);
    const cachedCount = this.usageRecords.filter(r => r.cached).length;
    const efficiency = this.usageRecords.length > 0 ? (cachedCount / this.usageRecords.length) * 100 : 100;

    return {
      totalSpend,
      period,
      byModel: toArr(byModel, "model") as TokenSpendDashboard["byModel"],
      byDomain: toArr(byDomain, "domain") as TokenSpendDashboard["byDomain"],
      byAdvisor: toArr(byAdvisor, "advisorId") as TokenSpendDashboard["byAdvisor"],
      byWorkflow: toArr(byWorkflow, "workflowType") as TokenSpendDashboard["byWorkflow"],
      anomalies: this.anomalies.filter(a => !a.resolved),
      forecastedSpend: totalSpend * 1.1,
      marginImpact: [],
      efficiencyScore: efficiency,
    };
  }

  // ── Anomaly Detection ───────────────────────────────────────
  private checkForAnomalies(usage: TokenUsageRecord): void {
    // Token explosion: single request > 50k tokens
    if (usage.totalTokens > 50000) {
      this.detectAnomaly("token_explosion", `Single request used ${usage.totalTokens} tokens in ${usage.domain}`, usage.domain, usage.cost);
    }

    // Cost spike: single request > $0.10
    if (usage.cost > 0.1) {
      this.detectAnomaly("cost_spike", `Single request cost $${usage.cost.toFixed(4)} (${usage.model})`, usage.domain, usage.cost);
    }
  }

  private detectAnomaly(type: InferenceAnomaly["type"], description: string, scope: string, waste: number): void {
    this.anomalies.push({
      id: `anomaly_${Date.now()}`,
      type,
      severity: waste > 0.5 ? "critical" : waste > 0.1 ? "warning" : "info",
      description,
      affectedScope: scope,
      detectedAt: new Date().toISOString(),
      estimatedWaste: waste,
      suggestedAction: type === "budget_breach" ? "Review budget allocation" : "Review request pattern",
      resolved: false,
    });
  }

  private createDecision(context: { domain: string; workflowType: string }, model: ModelRoute, reason: string): ModelRoutingDecision {
    return {
      requestId: `req_${Date.now()}`,
      domain: context.domain,
      workflowType: context.workflowType,
      selectedModel: model.model,
      selectedTier: model.tier,
      reason,
      estimatedCost: 0,
      alternativesConsidered: [],
      timestamp: new Date().toISOString(),
    };
  }
}
