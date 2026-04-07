// ═══════════════════════════════════════════════════════════════
// SITA OS — Model Router Service
// LLM model selection, fallback routing, cost-quality optimization
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type ModelProvider = "openai" | "anthropic" | "google" | "mistral" | "local";

export type TaskComplexity = "trivial" | "simple" | "moderate" | "complex" | "expert";

export type ModelHealth = "healthy" | "degraded" | "down" | "rate-limited";

export interface ModelEndpoint {
  id: string;
  provider: ModelProvider;
  modelName: string;
  contextWindow: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  avgLatencyMs: number;
  health: ModelHealth;
  qualityScore: number; // 0-100
  supportedTasks: string[];
  rateLimitRpm: number;
  currentRpm: number;
  priority: number;
  fallbackId?: string;
}

export interface RoutingRequest {
  taskType: string;
  complexity: TaskComplexity;
  estimatedTokens: number;
  maxLatencyMs?: number;
  qualityMinimum?: number;
  costSensitivity: "low" | "medium" | "high";
  preferredProvider?: ModelProvider;
}

export interface RoutingDecision {
  modelId: string;
  provider: ModelProvider;
  modelName: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  fallbackChain: string[];
  confidence: number;
}

const COMPLEXITY_QUALITY_MIN: Record<TaskComplexity, number> = {
  trivial: 20,
  simple: 40,
  moderate: 60,
  complex: 80,
  expert: 90,
};

export class ModelRouterService {
  private endpoints: Map<string, ModelEndpoint> = new Map();
  private routingHistory: { request: RoutingRequest; decision: RoutingDecision; timestamp: string }[] = [];

  registerEndpoint(endpoint: ModelEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
  }

  removeEndpoint(id: string): boolean {
    return this.endpoints.delete(id);
  }

  route(request: RoutingRequest): RoutingDecision {
    const qualityMin = request.qualityMinimum ?? COMPLEXITY_QUALITY_MIN[request.complexity] ?? 50;

    let candidates = Array.from(this.endpoints.values()).filter(ep =>
      ep.health === "healthy" &&
      ep.contextWindow >= request.estimatedTokens &&
      ep.qualityScore >= qualityMin &&
      ep.currentRpm < ep.rateLimitRpm
    );

    if (request.preferredProvider) {
      const preferred = candidates.filter(c => c.provider === request.preferredProvider);
      if (preferred.length > 0) candidates = preferred;
    }

    if (request.maxLatencyMs) {
      candidates = candidates.filter(c => c.avgLatencyMs <= request.maxLatencyMs!);
    }

    if (candidates.length === 0) {
      // Fall back to degraded endpoints
      candidates = Array.from(this.endpoints.values()).filter(ep =>
        ep.health !== "down" && ep.contextWindow >= request.estimatedTokens
      );
    }

    // Sort by cost-quality tradeoff
    candidates.sort((a, b) => {
      if (request.costSensitivity === "high") return a.costPer1kInput - b.costPer1kInput;
      if (request.costSensitivity === "low") return b.qualityScore - a.qualityScore;
      return (b.qualityScore / (b.costPer1kInput + 0.001)) - (a.qualityScore / (a.costPer1kInput + 0.001));
    });

    const chosen = candidates[0];
    if (!chosen) {
      return {
        modelId: "fallback",
        provider: "openai",
        modelName: "gpt-4o-mini",
        reason: "No available endpoints; using hardcoded fallback",
        estimatedCost: 0,
        estimatedLatency: 1000,
        fallbackChain: [],
        confidence: 0.2,
      };
    }

    const fallbackChain = this.buildFallbackChain(chosen.id, 3);
    const estimatedCost = (request.estimatedTokens / 1000) * chosen.costPer1kInput;

    const decision: RoutingDecision = {
      modelId: chosen.id,
      provider: chosen.provider,
      modelName: chosen.modelName,
      reason: `Best ${request.costSensitivity}-cost match for ${request.complexity} task (quality: ${chosen.qualityScore})`,
      estimatedCost,
      estimatedLatency: chosen.avgLatencyMs,
      fallbackChain,
      confidence: chosen.health === "healthy" ? 0.95 : 0.6,
    };

    this.routingHistory.push({ request, decision, timestamp: new Date().toISOString() });
    if (this.routingHistory.length > 2000) this.routingHistory = this.routingHistory.slice(-2000);

    return decision;
  }

  reportHealth(modelId: string, health: ModelHealth): void {
    const ep = this.endpoints.get(modelId);
    if (ep) ep.health = health;
  }

  reportLatency(modelId: string, latencyMs: number): void {
    const ep = this.endpoints.get(modelId);
    if (ep) ep.avgLatencyMs = Math.round(ep.avgLatencyMs * 0.9 + latencyMs * 0.1);
  }

  incrementRpm(modelId: string): void {
    const ep = this.endpoints.get(modelId);
    if (ep) ep.currentRpm++;
  }

  resetRpmCounters(): void {
    this.endpoints.forEach(ep => { ep.currentRpm = 0; });
  }

  listEndpoints(): ModelEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getRoutingStats(): { totalRouted: number; byProvider: Record<string, number>; avgCost: number } {
    const byProvider: Record<string, number> = {};
    let totalCost = 0;
    this.routingHistory.forEach(r => {
      byProvider[r.decision.provider] = (byProvider[r.decision.provider] ?? 0) + 1;
      totalCost += r.decision.estimatedCost;
    });
    return {
      totalRouted: this.routingHistory.length,
      byProvider,
      avgCost: this.routingHistory.length > 0 ? totalCost / this.routingHistory.length : 0,
    };
  }

  private buildFallbackChain(startId: string, maxDepth: number): string[] {
    const chain: string[] = [];
    let current = this.endpoints.get(startId);
    for (let i = 0; i < maxDepth && current?.fallbackId; i++) {
      chain.push(current.fallbackId);
      current = this.endpoints.get(current.fallbackId);
    }
    return chain;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("model-router", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      endpoints: Array.from(this.endpoints.entries()),
      routingHistory: this.routingHistory,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.endpoints) this.endpoints = new Map(state.endpoints as [string, unknown][]);
    if (state.routingHistory) this.routingHistory = state.routingHistory as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("model-router");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createModelRouter(): ModelRouterService {
  return new ModelRouterService();
}
