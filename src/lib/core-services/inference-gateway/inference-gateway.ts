// ═══════════════════════════════════════════════════════════════
// SITA OS — Inference Gateway Service
// Unified inference API abstraction over multiple LLM providers
// Routes all inference through the ai-gateway edge function
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type InferenceProvider = "openai" | "anthropic" | "google" | "mistral" | "local";

export interface InferenceRequest {
  id: string;
  provider?: InferenceProvider;
  model?: string;
  messages: InferenceMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  tools?: InferenceTool[];
  systemPrompt?: string;
  userId: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface InferenceMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface InferenceTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface InferenceResponse {
  id: string;
  requestId: string;
  provider: InferenceProvider;
  model: string;
  content: string;
  finishReason: "stop" | "length" | "tool_calls" | "error";
  toolCalls?: InferenceToolCall[];
  usage: InferenceUsage;
  latencyMs: number;
  cached: boolean;
  timestamp: string;
}

export interface InferenceToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface InferenceUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface InferenceProviderConfig {
  provider: InferenceProvider;
  apiKeyEnvVar: string;
  baseUrl: string;
  defaultModel: string;
  maxRetries: number;
  timeoutMs: number;
  enabled: boolean;
}

// Map complexity/task class to ai-gateway task classes
const PROVIDER_TO_TASK_CLASS: Record<string, string> = {
  openai: "premium_synthesis",
  anthropic: "premium_synthesis",
  google: "balanced_assistant",
  mistral: "cheap_utility",
  local: "cheap_utility",
};

export class InferenceGatewayService {
  private providers: Map<InferenceProvider, InferenceProviderConfig> = new Map();
  private cache: Map<string, InferenceResponse> = new Map();
  private history: InferenceResponse[] = [];
  private maxCache = 500;

  registerProvider(config: InferenceProviderConfig): void {
    this.providers.set(config.provider, config);
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const start = performance.now();

    // Check cache for identical deterministic requests
    const cacheKey = this.buildCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && request.temperature === 0) {
      return { ...cached, id: crypto.randomUUID(), requestId: request.id, cached: true };
    }

    const provider = request.provider ?? "google";
    const model = request.model ?? this.providers.get(provider)?.defaultModel ?? "google/gemini-3-flash-preview";
    const taskClass = PROVIDER_TO_TASK_CLASS[provider] ?? "balanced_assistant";

    // Build messages array with optional system prompt
    const messages: Array<{ role: string; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push(...request.messages.map(m => ({ role: m.role, content: m.content })));

    try {
      // Call the ai-gateway edge function — the canonical inference path
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          capabilityId: request.metadata?.capabilityId ?? "general",
          taskClass,
          messages,
          stream: false,
          maxTokens: request.maxTokens,
          temperature: request.temperature,
        },
      });

      if (error) {
        console.error("[InferenceGateway] Edge function error:", error);
        return this.buildErrorResponse(request, provider, model, start, error.message ?? "Edge function error");
      }

      const responseData = data as Record<string, unknown> | null;
      if (!responseData) {
        return this.buildErrorResponse(request, provider, model, start, "Empty response from ai-gateway");
      }

      const content = (responseData.content as string) ?? "";
      const inputTokens = (responseData.inputTokens as number) ?? 0;
      const outputTokens = (responseData.outputTokens as number) ?? 0;
      const totalTokens = inputTokens + outputTokens;
      const costCents = (responseData.costCents as number) ?? 0;
      const latencyMs = performance.now() - start;
      const resolvedModel = (responseData.model as string) ?? model;
      const resolvedProvider = (responseData.provider as string) ?? provider;

      const response: InferenceResponse = {
        id: (responseData.receiptId as string) ?? crypto.randomUUID(),
        requestId: request.id,
        provider: resolvedProvider as InferenceProvider,
        model: resolvedModel,
        content,
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCostUsd: costCents / 100,
        },
        latencyMs,
        cached: false,
        timestamp: new Date().toISOString(),
      };

      // Cache deterministic responses
      if (request.temperature === 0) {
        this.cache.set(cacheKey, response);
        if (this.cache.size > this.maxCache) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
      }

      this.history.push(response);
      if (this.history.length > 5000) this.history = this.history.slice(-5000);
      this._persist();

      return response;
    } catch (err) {
      console.error("[InferenceGateway] Network error:", err);
      return this.buildErrorResponse(request, provider, model, start, err instanceof Error ? err.message : "Network error");
    }
  }

  private buildErrorResponse(
    request: InferenceRequest,
    provider: string,
    model: string,
    start: number,
    errorMessage: string
  ): InferenceResponse {
    return {
      id: crypto.randomUUID(),
      requestId: request.id,
      provider: provider as InferenceProvider,
      model,
      content: `[Error] ${errorMessage}`,
      finishReason: "error",
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
      latencyMs: performance.now() - start,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  getProviders(): InferenceProviderConfig[] {
    return Array.from(this.providers.values());
  }

  getUsageStats(): { totalRequests: number; totalTokens: number; totalCost: number; byProvider: Record<string, number>; cacheHitRate: number } {
    const byProvider: Record<string, number> = {};
    let cacheHits = 0;
    this.history.forEach(r => {
      byProvider[r.provider] = (byProvider[r.provider] ?? 0) + 1;
      if (r.cached) cacheHits++;
    });
    return {
      totalRequests: this.history.length,
      totalTokens: this.history.reduce((s, r) => s + r.usage.totalTokens, 0),
      totalCost: this.history.reduce((s, r) => s + r.usage.estimatedCostUsd, 0),
      byProvider,
      cacheHitRate: this.history.length > 0 ? cacheHits / this.history.length : 0,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private buildCacheKey(request: InferenceRequest): string {
    return `${request.provider}:${request.model}:${request.messages.map(m => m.content).join("|")}`;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("inference-gateway", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      providers: Array.from(this.providers.entries()),
      cache: Array.from(this.cache.entries()),
      history: this.history,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.providers) this.providers = new Map(state.providers as Iterable<[string, never]>) as typeof this.providers;
    if (state.cache) this.cache = new Map(state.cache as Iterable<[string, never]>) as typeof this.cache;
    if (state.history) this.history = state.history as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("inference-gateway");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createInferenceGateway(): InferenceGatewayService {
  return new InferenceGatewayService();
}
