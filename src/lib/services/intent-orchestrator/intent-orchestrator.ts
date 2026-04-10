// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Intent / Command Orchestrator
// Single entry point for all user intents across all surfaces
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId, RiskTier, ExecutionStatus } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type IntentSource =
  | "command_palette" | "assistant" | "ui_action" | "wearable"
  | "automation" | "connector_event" | "notification" | "quick_action"
  | "boardroom" | "api" | "schedule";

export type IntentClassification =
  | "query" | "action" | "navigation" | "approval"
  | "configuration" | "delegation" | "communication"
  | "financial" | "scheduling" | "creative";

export interface IntentRequest {
  id: string;
  raw: string;
  source: IntentSource;
  surface: string;
  userId: string;
  classification?: IntentClassification;
  domain?: DomainId;
  context: Record<string, unknown>;
  timestamp: string;
}

export interface IntentResolution {
  intentId: string;
  classification: IntentClassification;
  domain: DomainId;
  capabilityKey: string;
  riskTier: RiskTier;
  policyDecisions: PolicyDecision[];
  executionPlan: ExecutionStep[];
  surfaceUpdates: SurfaceUpdate[];
  receiptRequired: boolean;
  estimatedLatencyMs: number;
}

export interface PolicyDecision {
  policyId: string;
  policyName: string;
  decision: "allow" | "deny" | "require_approval" | "downgrade";
  reason: string;
}

export interface ExecutionStep {
  id: string;
  order: number;
  type: "capability_call" | "approval_gate" | "confirmation" | "side_effect" | "notification";
  target: string;
  params: Record<string, unknown>;
  status: ExecutionStatus;
  result?: unknown;
  error?: string;
}

export interface SurfaceUpdate {
  surfaceId: string;
  type: "refresh" | "navigate" | "toast" | "badge" | "modal" | "push";
  payload: Record<string, unknown>;
}

export interface IntentReceipt {
  intentId: string;
  source: IntentSource;
  classification: IntentClassification;
  domain: DomainId;
  status: "completed" | "failed" | "partial" | "pending_approval";
  steps: ExecutionStep[];
  surfaceUpdates: SurfaceUpdate[];
  duration_ms: number;
  timestamp: string;
}

// ── Classification Engine ────────────────────────────────────────

const CLASSIFICATION_PATTERNS: [RegExp, IntentClassification, DomainId][] = [
  [/\b(pay|transfer|send money|invoice|budget|expense)\b/i, "financial", "finance"],
  [/\b(approve|reject|review|sign off)\b/i, "approval", "platform"],
  [/\b(schedule|meeting|calendar|book|reserve)\b/i, "scheduling", "concierge"],
  [/\b(email|message|call|text|notify|contact)\b/i, "communication", "concierge"],
  [/\b(navigate|go to|open|show|display)\b/i, "navigation", "platform"],
  [/\b(create|build|generate|draft|compose)\b/i, "creative", "business"],
  [/\b(configure|set|enable|disable|toggle)\b/i, "configuration", "platform"],
  [/\b(delegate|assign|forward|hand off)\b/i, "delegation", "platform"],
  [/\b(revenue|sales|pipeline|client|deal)\b/i, "action", "business"],
  [/\b(what|how|why|when|where|show me|tell me)\b/i, "query", "cross-domain"],
];

function classifyIntent(raw: string): { classification: IntentClassification; domain: DomainId } {
  for (const [pattern, classification, domain] of CLASSIFICATION_PATTERNS) {
    if (pattern.test(raw)) return { classification, domain };
  }
  return { classification: "query", domain: "cross-domain" };
}

// ── Risk Assessment ──────────────────────────────────────────────

function assessRisk(classification: IntentClassification, domain: DomainId): RiskTier {
  if (classification === "financial") return "critical";
  if (classification === "approval" || classification === "delegation") return "elevated";
  if (domain === "finance") return "elevated";
  return "standard";
}

// ── Service ──────────────────────────────────────────────────────

export class IntentOrchestratorService {
  private intentLog: IntentReceipt[] = [];
  private counter = 0;
  private middlewares: IntentMiddleware[] = [];

  // ── Middleware Registration ────────────────────────────────

  use(middleware: IntentMiddleware): void {
    this.middlewares.push(middleware);
  }

  // ── Core Processing ───────────────────────────────────────

  async processIntent(raw: string, source: IntentSource, surface: string, userId: string, context: Record<string, unknown> = {}): Promise<IntentResolution> {
    const id = `intent-${++this.counter}-${Date.now()}`;
    const { classification, domain } = classifyIntent(raw);
    const riskTier = assessRisk(classification, domain);

    const intent: IntentRequest = { id, raw, source, surface, userId, classification, domain, context, timestamp: new Date().toISOString() };

    // Run middlewares
    for (const mw of this.middlewares) {
      const result = await mw(intent);
      if (result?.block) {
        return this.buildBlockedResolution(id, classification, domain, result.reason ?? "Blocked by middleware");
      }
    }

    // Build execution plan
    const executionPlan = this.buildExecutionPlan(intent, riskTier);
    const policyDecisions = this.evaluatePolicies(intent, riskTier);
    const surfaceUpdates = this.determineSurfaceUpdates(intent, classification);

    const blocked = policyDecisions.find(p => p.decision === "deny");
    if (blocked) {
      return this.buildBlockedResolution(id, classification, domain, blocked.reason);
    }

    const needsApproval = policyDecisions.some(p => p.decision === "require_approval");

    // Execute steps
    const startTime = Date.now();
    for (const step of executionPlan) {
      if (needsApproval && step.type === "capability_call") {
        step.status = "pending";
        continue;
      }
      step.status = "completed";
    }

    const resolution: IntentResolution = {
      intentId: id,
      classification,
      domain: domain === "cross-domain" ? "platform" : domain,
      capabilityKey: `${domain}.${classification}`,
      riskTier,
      policyDecisions,
      executionPlan,
      surfaceUpdates,
      receiptRequired: riskTier !== "standard",
      estimatedLatencyMs: Date.now() - startTime,
    };

    // Create receipt
    this.intentLog.push({
      intentId: id,
      source,
      classification,
      domain: resolution.domain,
      status: needsApproval ? "pending_approval" : "completed",
      steps: executionPlan,
      surfaceUpdates,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    if (this.intentLog.length > 500) this.intentLog.shift();
    this._persist();
    return resolution;
  }

  // ── Execution Plan Builder ─────────────────────────────────

  private buildExecutionPlan(intent: IntentRequest, riskTier: RiskTier): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    let order = 0;

    // Pre-flight: confirmation for elevated+ risk
    if (riskTier !== "standard") {
      steps.push({ id: `step-${++order}`, order, type: "confirmation", target: intent.surface, params: { message: `Confirm ${intent.classification} action?` }, status: "pending" });
    }

    // Approval gate for critical actions
    if (riskTier === "critical") {
      steps.push({ id: `step-${++order}`, order, type: "approval_gate", target: "approval-engine", params: { intentId: intent.id, riskTier }, status: "pending" });
    }

    // Main capability call
    steps.push({ id: `step-${++order}`, order, type: "capability_call", target: `${intent.domain}.${intent.classification}`, params: { raw: intent.raw, context: intent.context }, status: "pending" });

    // Post-execution notification
    steps.push({ id: `step-${++order}`, order, type: "notification", target: intent.surface, params: { type: "completion" }, status: "pending" });

    return steps;
  }

  // ── Policy Evaluation ──────────────────────────────────────

  private evaluatePolicies(intent: IntentRequest, riskTier: RiskTier): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    // Source-based policy
    if (intent.source === "wearable" && riskTier === "critical") {
      decisions.push({ policyId: "wearable-critical", policyName: "Wearable Critical Block", decision: "require_approval", reason: "Critical actions cannot be initiated from wearable" });
    }

    // Rate limiting
    const recentFromSource = this.intentLog.filter(r => r.source === intent.source && Date.now() - new Date(r.timestamp).getTime() < 60_000);
    if (recentFromSource.length > 30) {
      decisions.push({ policyId: "rate-limit", policyName: "Rate Limit", decision: "deny", reason: "Rate limit exceeded for this source" });
    }

    // Default allow
    if (decisions.length === 0) {
      decisions.push({ policyId: "default-allow", policyName: "Default Allow", decision: "allow", reason: "No policy violations" });
    }

    return decisions;
  }

  // ── Surface Update Resolver ────────────────────────────────

  private determineSurfaceUpdates(intent: IntentRequest, classification: IntentClassification): SurfaceUpdate[] {
    const updates: SurfaceUpdate[] = [];

    if (classification === "navigation") {
      updates.push({ surfaceId: intent.surface, type: "navigate", payload: { raw: intent.raw } });
    } else if (classification === "financial") {
      updates.push({ surfaceId: intent.surface, type: "toast", payload: { message: "Financial action processed" } });
      updates.push({ surfaceId: "finance-dashboard", type: "refresh", payload: {} });
    } else if (classification === "approval") {
      updates.push({ surfaceId: "approval-center", type: "badge", payload: { increment: -1 } });
      updates.push({ surfaceId: intent.surface, type: "toast", payload: { message: "Approval processed" } });
    } else {
      updates.push({ surfaceId: intent.surface, type: "toast", payload: { message: "Action completed" } });
    }

    return updates;
  }

  private buildBlockedResolution(id: string, classification: IntentClassification, domain: DomainId, reason: string): IntentResolution {
    return {
      intentId: id, classification, domain: domain === "cross-domain" ? "platform" : domain, capabilityKey: "blocked",
      riskTier: "standard", policyDecisions: [{ policyId: "block", policyName: "Blocked", decision: "deny", reason }],
      executionPlan: [], surfaceUpdates: [], receiptRequired: false, estimatedLatencyMs: 0,
    };
  }

  // ── Query API ──────────────────────────────────────────────

  getRecentIntents(limit = 20): IntentReceipt[] { return this.intentLog.slice(-limit); }
  getIntentsBySource(source: IntentSource): IntentReceipt[] { return this.intentLog.filter(r => r.source === source); }
  getIntentsByDomain(domain: DomainId): IntentReceipt[] { return this.intentLog.filter(r => r.domain === domain); }
  getFailedIntents(): IntentReceipt[] { return this.intentLog.filter(r => r.status === "failed"); }

  getStats(): { total: number; bySource: Record<string, number>; byClassification: Record<string, number>; avgDuration: number } {
    const bySource: Record<string, number> = {};
    const byClass: Record<string, number> = {};
    let totalDuration = 0;
    for (const r of this.intentLog) {
      bySource[r.source] = (bySource[r.source] ?? 0) + 1;
      byClass[r.classification] = (byClass[r.classification] ?? 0) + 1;
      totalDuration += r.duration_ms;
    }
    return { total: this.intentLog.length, bySource, byClassification: byClass, avgDuration: this.intentLog.length > 0 ? Math.round(totalDuration / this.intentLog.length) : 0 };
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("intent-orchestrator", this.serialize());

  serialize(): Record<string, unknown> { return { intentLog: this.intentLog.slice(-200), counter: this.counter }; }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.intentLog) this.intentLog = state.intentLog as IntentReceipt[];
    if (state.counter) this.counter = state.counter as number;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("intent-orchestrator");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export type IntentMiddleware = (intent: IntentRequest) => Promise<{ block: boolean; reason?: string } | null>;

export const createIntentOrchestrator = () => new IntentOrchestratorService();
