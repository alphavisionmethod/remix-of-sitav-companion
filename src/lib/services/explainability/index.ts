// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Explainability Engine
// "Why?" layer for decisions, trust, automations, and blocks
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/data/persistence/universal-service-persistence";

const SERVICE_KEY = "explainability-engine";

// ── Types ────────────────────────────────────────────────────────

export type ExplanationType = "decision" | "trust_score" | "automation" | "block" | "recommendation" | "mode_change" | "safety_gate";

export interface ExplanationSource {
  system: string;          // e.g. "decision-intelligence", "trust-actions"
  component: string;       // e.g. "risk_evaluator", "timing_gate"
  confidence: number;
  data: Record<string, unknown>;
}

export interface Explanation {
  id: string;
  type: ExplanationType;
  entityId: string;
  title: string;
  summary: string;                        // human-readable "Why" answer
  reasoningChain: string[];               // step-by-step reasoning
  sources: ExplanationSource[];
  confidence: number;
  alternatives: string[];                 // what else could have happened
  timestamp: string;
  feedbackGiven?: "helpful" | "not_helpful" | null;
  tradeoffs?: Array<{ option: string; pros: string[]; cons: string[]; confidence: number }>;
  invalidators?: string[];                // conditions that would change this
  receiptId?: string;                     // link to trust receipt
}

export interface ExplainabilityService {
  explainDecision(decisionId: string, context?: Record<string, unknown>): Explanation;
  explainTrustScore(entityId: string, score: number, factors?: Record<string, number>): Explanation;
  explainAutomation(automationId: string, trigger?: string, actions?: string[]): Explanation;
  explainBlock(blockId: string, reason: string, policy?: string): Explanation;
  explainRecommendation(recId: string, title: string, confidence: number, basis?: string[]): Explanation;
  explainModeChange(from: string, to: string, trigger: string): Explanation;
  explainSafetyGate(actionId: string, classification: string, requirements: string[]): Explanation;
  getExplanation(id: string): Explanation | null;
  getExplanationHistory(): Explanation[];
  getRecentExplanations(limit?: number): Explanation[];
  giveFeedback(explanationId: string, feedback: "helpful" | "not_helpful"): void;
  clearHistory(): void;
  loadPersistedState(): Promise<void>;
  explainSimulation(scenarioId: string, scenarioLabel: string, result: { mean: number; stdDev: number; var95: number }, variables: Array<{ label: string; mean: number }>): Explanation;
}

// ── Implementation ───────────────────────────────────────────────

export function createExplainability(): ExplainabilityService {
  const history: Explanation[] = [];
  const MAX_HISTORY = 200;

  function addExplanation(e: Explanation): Explanation {
    history.unshift(e);
    if (history.length > MAX_HISTORY) history.pop();
    debouncedSaveServiceState(SERVICE_KEY, { history: history.slice(0, 50) });
    return e;
  }

  function makeId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function explainDecision(decisionId: string, context?: Record<string, unknown>): Explanation {
    const reasoning = [
      "Analyzed current context signals (time, workspace, cognitive load)",
      "Evaluated relevance against your historical patterns",
      "Scored confidence based on data freshness and completeness",
      "Cross-referenced with active mode preferences",
      "Applied decision thresholds from your personal policy",
    ];

    return addExplanation({
      id: makeId(), type: "decision", entityId: decisionId,
      title: "Decision Explanation",
      summary: `This suggestion was generated because your context signals indicated a relevant opportunity. Confidence was determined by pattern matching against ${context?.patternCount ?? "multiple"} historical data points.`,
      reasoningChain: reasoning,
      sources: [
        { system: "decision-intelligence", component: "pattern_analyzer", confidence: 0.85, data: context ?? {} },
        { system: "context-graph", component: "signal_aggregator", confidence: 0.9, data: {} },
      ],
      confidence: 0.85,
      alternatives: ["Defer to next review cycle", "Escalate to manual review"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainTrustScore(entityId: string, score: number, factors?: Record<string, number>): Explanation {
    const factorEntries = Object.entries(factors ?? {});
    const reasoning = [
      `Base trust score: ${(score * 100).toFixed(0)}%`,
      ...factorEntries.map(([k, v]) => `${k}: ${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`),
      "Final score computed as weighted average of all factors",
    ];

    return addExplanation({
      id: makeId(), type: "trust_score", entityId,
      title: "Trust Score Breakdown",
      summary: `Trust score of ${(score * 100).toFixed(0)}% was calculated from ${factorEntries.length || "standard"} factors including device trust, behavioral history, and policy compliance.`,
      reasoningChain: reasoning,
      sources: [
        { system: "trust-actions", component: "trust_evaluator", confidence: score, data: factors ?? {} },
      ],
      confidence: score,
      alternatives: ["Request manual verification", "Elevate trust via biometric"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainAutomation(automationId: string, trigger?: string, actions?: string[]): Explanation {
    return addExplanation({
      id: makeId(), type: "automation", entityId: automationId,
      title: "Automation Execution",
      summary: `This automation ran because the trigger "${trigger ?? "scheduled"}" was activated. ${(actions ?? []).length} actions were executed in sequence.`,
      reasoningChain: [
        `Trigger detected: ${trigger ?? "periodic schedule"}`,
        "Conditions evaluated: all passed",
        ...(actions ?? []).map((a, i) => `Step ${i + 1}: ${a}`),
        "All actions completed successfully",
      ],
      sources: [
        { system: "automation-engine", component: "rule_executor", confidence: 1.0, data: { trigger, actions } },
      ],
      confidence: 1.0,
      alternatives: ["Disable this automation", "Modify trigger conditions"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainBlock(blockId: string, reason: string, policy?: string): Explanation {
    return addExplanation({
      id: makeId(), type: "block", entityId: blockId,
      title: "Action Blocked",
      summary: `This action was blocked: ${reason}. ${policy ? `Policy: ${policy}` : ""}`,
      reasoningChain: [
        "Action evaluated against safety policies",
        `Violation detected: ${reason}`,
        policy ? `Governing policy: ${policy}` : "Default safety policy applied",
        "Action prevented to protect system integrity",
      ],
      sources: [
        { system: "conscience-gate", component: "policy_enforcer", confidence: 1.0, data: { reason, policy } },
      ],
      confidence: 1.0,
      alternatives: ["Request policy override", "Modify action scope"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainRecommendation(recId: string, title: string, confidence: number, basis?: string[]): Explanation {
    return addExplanation({
      id: makeId(), type: "recommendation", entityId: recId,
      title: `Recommendation: ${title}`,
      summary: `This recommendation has ${(confidence * 100).toFixed(0)}% confidence, based on ${(basis ?? []).length || "multiple"} evidence sources.`,
      reasoningChain: [
        "Recommendation generated from cross-domain analysis",
        ...(basis ?? []).map(b => `Evidence: ${b}`),
        `Confidence score: ${(confidence * 100).toFixed(0)}%`,
      ],
      sources: [
        { system: "recommendation-execution", component: "loop_service", confidence, data: { basis } },
      ],
      confidence,
      alternatives: ["Dismiss", "Defer to next cycle", "Escalate to Boardroom"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainModeChange(from: string, to: string, trigger: string): Explanation {
    return addExplanation({
      id: makeId(), type: "mode_change", entityId: `mode_${from}_${to}`,
      title: `Mode: ${from} → ${to}`,
      summary: `Mode changed from ${from} to ${to} triggered by: ${trigger}.`,
      reasoningChain: [
        `Previous mode: ${from}`,
        `Trigger: ${trigger}`,
        `New mode: ${to}`,
        "Notification and AI policies updated accordingly",
      ],
      sources: [
        { system: "sita-modes", component: "mode_manager", confidence: 1.0, data: { from, to, trigger } },
      ],
      confidence: 1.0,
      alternatives: ["Revert to previous mode", "Customize mode settings"],
      timestamp: new Date().toISOString(),
    });
  }

  function explainSafetyGate(actionId: string, classification: string, requirements: string[]): Explanation {
    return addExplanation({
      id: makeId(), type: "safety_gate", entityId: actionId,
      title: `Safety: ${classification}`,
      summary: `Action classified as "${classification}". Requirements: ${requirements.join(", ") || "none"}.`,
      reasoningChain: [
        `Action evaluated by safety classifier`,
        `Classification: ${classification}`,
        ...requirements.map(r => `Requirement: ${r}`),
      ],
      sources: [
        { system: "action-safety", component: "classifier", confidence: 1.0, data: { classification, requirements } },
      ],
      confidence: 1.0,
      alternatives: [],
      timestamp: new Date().toISOString(),
    });
  }

  function explainSimulation(
    scenarioId: string,
    scenarioLabel: string,
    result: { mean: number; stdDev: number; var95: number },
    variables: Array<{ label: string; mean: number }>,
  ): Explanation {
    const isPositive = result.mean > 0;
    const confidence = Math.min(1, Math.max(0.1, 1 - (result.stdDev / (Math.abs(result.mean) || 1))));
    return addExplanation({
      id: makeId(),
      type: "recommendation",
      entityId: scenarioId,
      title: `Simulation: ${scenarioLabel}`,
      summary: `Monte Carlo simulation produced a mean outcome of ${result.mean >= 0 ? "+" : ""}${result.mean.toFixed(0)} with ${(confidence * 100).toFixed(0)}% confidence. VaR-95: ${result.var95.toFixed(0)}.`,
      reasoningChain: [
        `Scenario "${scenarioLabel}" executed with ${variables.length} variable(s)`,
        ...variables.map(v => `${v.label}: mean ${v.mean.toFixed(1)}`),
        `Mean outcome: ${result.mean.toFixed(0)}`,
        `Standard deviation: ${result.stdDev.toFixed(0)}`,
        `Value at Risk (95%): ${result.var95.toFixed(0)}`,
        isPositive ? "Outcome skews positive — proceed with monitoring" : "Outcome skews negative — review assumptions",
      ],
      sources: [
        { system: "simulation-engine", component: "monte_carlo", confidence, data: { scenarioId, mean: result.mean } },
      ],
      confidence,
      alternatives: ["Adjust variables and re-run", "Consult Boardroom advisors", "Save for later review"],
      timestamp: new Date().toISOString(),
      tradeoffs: [
        {
          option: "Proceed as modeled",
          pros: isPositive ? ["Positive expected outcome", "Aligned with scenario assumptions"] : ["Quick resolution"],
          cons: isPositive ? ["Tail risk exposure at VaR-95"] : ["Negative expected outcome", "High uncertainty"],
          confidence,
        },
        {
          option: "Defer and gather more data",
          pros: ["Reduces uncertainty", "More informed decision"],
          cons: ["Delays action", "Opportunity cost"],
          confidence: 0.7,
        },
      ],
      invalidators: [
        "If key variable assumptions change significantly",
        "If market conditions shift beyond modeled ranges",
        "If new constraints or obligations emerge",
      ],
    });
  }

  function getExplanation(id: string): Explanation | null {
    return history.find(e => e.id === id) ?? null;
  }

  function getExplanationHistory(): Explanation[] {
    return [...history];
  }

  function getRecentExplanations(limit = 20): Explanation[] {
    return history.slice(0, limit);
  }

  function giveFeedback(explanationId: string, feedback: "helpful" | "not_helpful") {
    const exp = history.find(e => e.id === explanationId);
    if (exp) {
      exp.feedbackGiven = feedback;
      debouncedSaveServiceState(SERVICE_KEY, { history: history.slice(0, 50) });
    }
  }

  function clearHistory() {
    history.length = 0;
    debouncedSaveServiceState(SERVICE_KEY, { history: [] });
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.history) {
      history.push(...(saved.history as Explanation[]));
    }
  }

  return {
    explainDecision, explainTrustScore, explainAutomation, explainBlock,
    explainRecommendation, explainModeChange, explainSafetyGate,
    getExplanation, getExplanationHistory, getRecentExplanations,
    giveFeedback, clearHistory, loadPersistedState,
    explainSimulation,
  };
}
