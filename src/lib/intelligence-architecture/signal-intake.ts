// ═══════════════════════════════════════════════════════════════
// SITA OS — Signal Intake Layer (3.2)
// Normalizes, classifies, and routes incoming signals to
// intelligence asset/pattern extraction pipelines.
// ═══════════════════════════════════════════════════════════════

export type SignalSource =
  | "incident" | "telemetry" | "business_event" | "deployment_event"
  | "approval" | "receipt" | "mission_outcome" | "design_change"
  | "customer_workflow" | "self_heal_outcome" | "release_outcome"
  | "user_feedback" | "override_event";

export interface RawSignal {
  signalId: string;
  source: SignalSource;
  tenantId: string;
  domain: string;
  scope?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface NormalizedSignal extends RawSignal {
  noveltyScore: number;        // 0-100: how novel is this signal?
  priority: "low" | "medium" | "high" | "critical";
  routeTo: SignalRoute[];
  correlationId?: string;
}

export type SignalRoute =
  | "asset_generation"
  | "pattern_extraction"
  | "differential_reasoning"
  | "efficiency_measurement"
  | "outcome_economics"
  | "feedback_loop";

// ── Novelty estimation ──────────────────────────────────────

const NOVELTY_WEIGHTS: Record<SignalSource, number> = {
  incident: 70, telemetry: 20, business_event: 50, deployment_event: 60,
  approval: 30, receipt: 10, mission_outcome: 65, design_change: 55,
  customer_workflow: 45, self_heal_outcome: 60, release_outcome: 55,
  user_feedback: 80, override_event: 85,
};

function estimateNovelty(signal: RawSignal): number {
  const base = NOVELTY_WEIGHTS[signal.source] || 50;
  // Higher novelty if payload is large/complex
  const payloadComplexity = Math.min(30, Object.keys(signal.payload).length * 3);
  return Math.min(100, base + payloadComplexity);
}

function classifyPriority(novelty: number, source: SignalSource): NormalizedSignal["priority"] {
  if (source === "incident" || source === "override_event") return novelty > 60 ? "critical" : "high";
  if (novelty > 75) return "high";
  if (novelty > 40) return "medium";
  return "low";
}

function determineRoutes(signal: RawSignal, novelty: number): SignalRoute[] {
  const routes: SignalRoute[] = [];

  // Always route high-novelty signals to asset generation
  if (novelty > 50) routes.push("asset_generation");

  // Pattern extraction for recurring signal types
  if (["incident", "self_heal_outcome", "deployment_event", "release_outcome", "customer_workflow"].includes(signal.source)) {
    routes.push("pattern_extraction");
  }

  // Differential reasoning for state-change signals
  if (["deployment_event", "design_change", "business_event", "release_outcome"].includes(signal.source)) {
    routes.push("differential_reasoning");
  }

  // Outcome economics for outcome signals
  if (["mission_outcome", "self_heal_outcome", "release_outcome", "customer_workflow"].includes(signal.source)) {
    routes.push("outcome_economics");
  }

  // Feedback loop for user signals
  if (["user_feedback", "override_event", "approval"].includes(signal.source)) {
    routes.push("feedback_loop");
  }

  // Everything gets efficiency measurement
  routes.push("efficiency_measurement");

  return [...new Set(routes)];
}

// ── Public API ──────────────────────────────────────────────

export function normalizeSignal(raw: RawSignal): NormalizedSignal {
  const noveltyScore = estimateNovelty(raw);
  return {
    ...raw,
    noveltyScore,
    priority: classifyPriority(noveltyScore, raw.source),
    routeTo: determineRoutes(raw, noveltyScore),
    correlationId: `cor-${raw.signalId}`,
  };
}

export function batchNormalize(signals: RawSignal[]): NormalizedSignal[] {
  return signals.map(normalizeSignal).sort((a, b) => {
    const prio = { critical: 0, high: 1, medium: 2, low: 3 };
    return prio[a.priority] - prio[b.priority];
  });
}

export function filterByRoute(signals: NormalizedSignal[], route: SignalRoute): NormalizedSignal[] {
  return signals.filter(s => s.routeTo.includes(route));
}
