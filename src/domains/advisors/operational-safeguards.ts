// ═══════════════════════════════════════════════════════════════
// SITA OS — Operational Safeguards & Premium Intelligence
// Feature flags, kill switches, shadow mode, strategic modes,
// safe personalization, council reputation, and incident response
// ═══════════════════════════════════════════════════════════════

// ── Feature Flags & Kill Switches ─────────────────────────

export type AdvisorFeatureFlag =
  | "enabled"
  | "shadow-mode"      // Runs but output not shown to user
  | "sandbox-mode"     // Runs with synthetic data only
  | "canary"           // Shown to small % of requests
  | "disabled"
  | "kill-switched";   // Emergency off

export interface AdvisorOperationalState {
  advisorId: string;
  featureFlag: AdvisorFeatureFlag;
  canaryPercentage: number; // 0-100, only used when canary
  shadowSinceTimestamp?: string;
  killSwitchReason?: string;
  killSwitchTriggeredBy?: string;
  killSwitchAt?: string;
  degradedReason?: string;
  lastHealthCheck: string;
  healthScore: number; // 0-1
}

export function isAdvisorActive(state: AdvisorOperationalState): boolean {
  return state.featureFlag === "enabled" || state.featureFlag === "canary";
}

export function shouldShowOutput(state: AdvisorOperationalState, requestRandom: number = Math.random()): boolean {
  if (state.featureFlag === "enabled") return true;
  if (state.featureFlag === "canary") return requestRandom * 100 < state.canaryPercentage;
  if (state.featureFlag === "shadow-mode") return false;
  return false;
}

// ── Model Fallback Chain ──────────────────────────────────

export interface ModelFallbackConfig {
  advisorId: string;
  primaryModel: string;
  fallbackChain: { model: string; condition: string; maxLatencyMs: number }[];
  currentModel: string;
  failoverReason?: string;
  failedAt?: string;
}

export function selectModel(config: ModelFallbackConfig, primaryAvailable: boolean): string {
  if (primaryAvailable) return config.primaryModel;
  return config.fallbackChain[0]?.model || config.primaryModel;
}

// ── Strategic Modes ───────────────────────────────────────

export type StrategicMode =
  | "conservative"       // Prioritize safety, caution, and risk avoidance
  | "balanced"           // Default mode
  | "growth"             // Prioritize opportunities and growth
  | "capital-preservation" // Minimize all financial risk
  | "crisis"             // Emergency mode — only critical recommendations
  | "family-safe"        // Extra safety boundaries for family/household
  | "owner-friendly"     // Simplified, high-confidence-only outputs
  | "exploration";       // More speculative, clearly labeled

export interface StrategicModeConfig {
  mode: StrategicMode;
  confidenceFloorAdjustment: number; // add to advisor's confidenceFloor
  maxRecommendationsAdjustment: number; // add/subtract from max
  simulationRequired: boolean; // override to require simulation
  riskToleranceMultiplier: number; // 0.5 = more conservative, 1.5 = more aggressive
  explanationVerbosity: "minimal" | "standard" | "detailed";
  unknownsAlwaysShown: boolean;
  disagreementsAlwaysShown: boolean;
}

export const STRATEGIC_MODE_CONFIGS: Record<StrategicMode, StrategicModeConfig> = {
  conservative: {
    mode: "conservative",
    confidenceFloorAdjustment: 0.1,
    maxRecommendationsAdjustment: -2,
    simulationRequired: true,
    riskToleranceMultiplier: 0.5,
    explanationVerbosity: "detailed",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: true,
  },
  balanced: {
    mode: "balanced",
    confidenceFloorAdjustment: 0,
    maxRecommendationsAdjustment: 0,
    simulationRequired: false,
    riskToleranceMultiplier: 1.0,
    explanationVerbosity: "standard",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: false,
  },
  growth: {
    mode: "growth",
    confidenceFloorAdjustment: -0.05,
    maxRecommendationsAdjustment: 2,
    simulationRequired: false,
    riskToleranceMultiplier: 1.3,
    explanationVerbosity: "standard",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: false,
  },
  "capital-preservation": {
    mode: "capital-preservation",
    confidenceFloorAdjustment: 0.15,
    maxRecommendationsAdjustment: -3,
    simulationRequired: true,
    riskToleranceMultiplier: 0.3,
    explanationVerbosity: "detailed",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: true,
  },
  crisis: {
    mode: "crisis",
    confidenceFloorAdjustment: 0.2,
    maxRecommendationsAdjustment: -4,
    simulationRequired: true,
    riskToleranceMultiplier: 0.2,
    explanationVerbosity: "detailed",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: true,
  },
  "family-safe": {
    mode: "family-safe",
    confidenceFloorAdjustment: 0.1,
    maxRecommendationsAdjustment: -1,
    simulationRequired: false,
    riskToleranceMultiplier: 0.6,
    explanationVerbosity: "standard",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: true,
  },
  "owner-friendly": {
    mode: "owner-friendly",
    confidenceFloorAdjustment: 0.1,
    maxRecommendationsAdjustment: -2,
    simulationRequired: false,
    riskToleranceMultiplier: 0.8,
    explanationVerbosity: "minimal",
    unknownsAlwaysShown: false,
    disagreementsAlwaysShown: false,
  },
  exploration: {
    mode: "exploration",
    confidenceFloorAdjustment: -0.1,
    maxRecommendationsAdjustment: 3,
    simulationRequired: false,
    riskToleranceMultiplier: 1.5,
    explanationVerbosity: "detailed",
    unknownsAlwaysShown: true,
    disagreementsAlwaysShown: true,
  },
};

// ── Safe Personalization ──────────────────────────────────

export type PreferenceConfidence = "confirmed" | "high" | "inferred" | "guessed";

export interface UserPreference {
  id: string;
  key: string;
  value: string;
  confidence: PreferenceConfidence;
  source: "explicit" | "behavioral" | "correction" | "pack-default";
  domain: string;
  sensitive: boolean;
  lastConfirmedAt?: string;
  expiresAt?: string;
}

export interface PersonalizationPolicy {
  // Only use confirmed/high preferences for financial domain
  financeDomainMinConfidence: PreferenceConfidence;
  // Always confirm sensitive preferences before use
  sensitiveRequiresReconfirmation: boolean;
  // Stale preference threshold in days
  stalePreferenceDays: number;
  // User override always wins
  userOverrideAlwaysWins: boolean;
  // Pack defaults can be overridden
  packDefaultsOverridable: boolean;
}

export const DEFAULT_PERSONALIZATION_POLICY: PersonalizationPolicy = {
  financeDomainMinConfidence: "confirmed",
  sensitiveRequiresReconfirmation: true,
  stalePreferenceDays: 90,
  userOverrideAlwaysWins: true,
  packDefaultsOverridable: true,
};

export function isPreferenceUsable(
  pref: UserPreference,
  domain: string,
  policy: PersonalizationPolicy = DEFAULT_PERSONALIZATION_POLICY,
): boolean {
  // Check staleness
  if (pref.expiresAt && Date.now() > new Date(pref.expiresAt).getTime()) return false;

  // Financial domain requires confirmed
  const confidenceOrder: PreferenceConfidence[] = ["guessed", "inferred", "high", "confirmed"];
  if (domain === "finance") {
    const minIdx = confidenceOrder.indexOf(policy.financeDomainMinConfidence);
    const prefIdx = confidenceOrder.indexOf(pref.confidence);
    if (prefIdx < minIdx) return false;
  }

  // Sensitive preferences need reconfirmation
  if (pref.sensitive && policy.sensitiveRequiresReconfirmation) {
    if (!pref.lastConfirmedAt) return false;
    const daysSinceConfirm = (Date.now() - new Date(pref.lastConfirmedAt).getTime()) / 86400000;
    if (daysSinceConfirm > policy.stalePreferenceDays) return false;
  }

  return true;
}

// ── Council Reputation System ─────────────────────────────

export interface AdvisorReputation {
  advisorId: string;
  overallScore: number; // 0-100
  accuracyScore: number;
  calibrationScore: number;
  hallucinationScore: number; // higher = fewer hallucinations
  reliabilityScore: number;
  acceptanceScore: number;
  outcomeScore: number;
  trend: "improving" | "stable" | "declining";
  lastUpdated: string;
}

export function computeReputation(
  advisorId: string,
  metrics: {
    accuracy: number;
    calibrationError: number;
    hallucinationRate: number;
    acceptanceRate: number;
    executionSuccessRate: number;
    rollbackRate: number;
  },
): AdvisorReputation {
  const accuracyScore = Math.round(metrics.accuracy * 100);
  const calibrationScore = Math.round(Math.max(0, 1 - metrics.calibrationError * 2) * 100);
  const hallucinationScore = Math.round(Math.max(0, 1 - metrics.hallucinationRate / 10) * 100);
  const acceptanceScore = Math.round(metrics.acceptanceRate * 100);
  const outcomeScore = Math.round(metrics.executionSuccessRate * (1 - metrics.rollbackRate) * 100);
  const reliabilityScore = Math.round((accuracyScore + calibrationScore + hallucinationScore) / 3);

  const overallScore = Math.round(
    accuracyScore * 0.25 + calibrationScore * 0.15 + hallucinationScore * 0.20 +
    acceptanceScore * 0.15 + outcomeScore * 0.15 + reliabilityScore * 0.10
  );

  return {
    advisorId,
    overallScore,
    accuracyScore,
    calibrationScore,
    hallucinationScore,
    reliabilityScore,
    acceptanceScore,
    outcomeScore,
    trend: "stable",
    lastUpdated: new Date().toISOString(),
  };
}

// ── Incident Response for Bad Recommendations ─────────────

export type IncidentSeverity = "p0-critical" | "p1-high" | "p2-medium" | "p3-low";

export interface RecommendationIncident {
  id: string;
  advisorId: string;
  recommendationId: string;
  severity: IncidentSeverity;
  type: "hallucination" | "wrong-recommendation" | "policy-violation" | "scope-breach" | "trust-violation" | "data-misuse";
  description: string;
  impactAssessment: string;
  rootCause?: string;
  remediation: {
    immediateAction: string;
    preventionRule: string;
    advisorImpact: "none" | "retrain" | "downgrade" | "kill-switch";
  };
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  status: "open" | "investigating" | "mitigated" | "resolved" | "accepted-risk";
}

export function classifyIncidentSeverity(
  type: RecommendationIncident["type"],
  domain: string,
  wasExecuted: boolean,
  financialImpact: boolean,
): IncidentSeverity {
  if (wasExecuted && financialImpact) return "p0-critical";
  if (type === "trust-violation" || type === "data-misuse") return "p0-critical";
  if (type === "hallucination" && domain === "finance") return "p1-high";
  if (wasExecuted) return "p1-high";
  if (type === "hallucination" || type === "policy-violation") return "p2-medium";
  return "p3-low";
}

// ── Degraded Mode ─────────────────────────────────────────

export interface DegradedModeState {
  advisorId: string;
  isDegraded: boolean;
  reason: string;
  missingDependencies: string[];
  reducedCapabilities: string[];
  fallbackBehavior: string;
  degradedSince: string;
  estimatedRecovery?: string;
}

export function evaluateDegradedMode(
  advisorId: string,
  availableSystems: string[],
  requiredSystems: string[],
): DegradedModeState {
  const missing = requiredSystems.filter(s => !availableSystems.includes(s));
  const isDegraded = missing.length > 0;

  return {
    advisorId,
    isDegraded,
    reason: isDegraded ? `Missing: ${missing.join(", ")}` : "All systems operational",
    missingDependencies: missing,
    reducedCapabilities: missing.map(m => `Cannot access ${m}`),
    fallbackBehavior: isDegraded ? "Reduced confidence, expanded unknowns section" : "Normal operation",
    degradedSince: isDegraded ? new Date().toISOString() : "",
  };
}
