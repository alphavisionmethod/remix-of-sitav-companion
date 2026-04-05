// ═══════════════════════════════════════════════════════════════
// SITA OS — Plan Entitlement Engine
// Full pricing architecture: 5 tiers, upsells, fair-use,
// capability language, internal entitlement dimensions,
// enterprise custom economics.
// ═══════════════════════════════════════════════════════════════

export type PlanTier = "personal" | "pro" | "business" | "scale" | "enterprise";

export interface PlanDefinition {
  planId: string;
  name: string;
  tier: PlanTier;
  monthlyPriceCents: number;
  positioning: string;
  bestFor: string[];
  entitlements: PlanEntitlements;
  userFacingCapabilities: UserFacingCapabilities;
}

// ── User-Facing Capability Language ─────────────────────────
// What users see instead of tokens/compute

export interface UserFacingCapabilities {
  activeAdvisorCoverage: string;
  monitoringCapacity: string;
  connectedSystems: string;
  automationCapacity: string;
  strategicReviewDepth: string;
  aiEngineeringCapacity: string;
  environmentCoverage: string;
  selfHealingScope: string;
  priorityResponseTier: string;
  exportAndEvidenceDepth: string;
}

// ── Internal Entitlement Dimensions ─────────────────────────

export interface PlanEntitlements {
  // Capacity
  connectedSystems: number;           // max integrations (-1 = unlimited)
  activeMonitoringCapacity: number;    // concurrent monitors
  activeAutomationVolume: number;      // concurrent automations
  workspaces: number;
  seats: number;

  // Advisor depth
  standardAdvisorDepth: boolean;
  advancedMissionDepth: boolean;
  premiumStrategicReviews: number;     // per month
  boardroomSessions: number;           // per month

  // AI teams
  engineeringTeamAccess: boolean;
  selfHealingScope: "none" | "basic" | "advanced" | "full";
  selfHealingCategories: number;       // max categories
  aiTeamConcurrency: number;           // max concurrent agent missions

  // Compute governance
  deepReasoningMinutesPerMonth: number;
  maxCostClassAllowed: "A" | "B" | "C" | "D";
  contextCompressionRequired: boolean;
  cacheEnabled: boolean;
  cachePriorityClass: "standard" | "elevated" | "premium";
  routingTierPermissions: ("utility" | "standard" | "premium" | "exceptional")[];

  // Budget envelope (internal)
  monthlyComputeBudgetCents: number;
  dailyBurstAllowanceCents: number;
  premiumModelAccess: boolean;
  exceptionalModelAccess: boolean;
  maxPremiumEscalationsPerCycle: number;
  proactiveInferenceBudgetCents: number;
  maxAsyncHighComputeJobs: number;
  maxSimultaneousAgentMissions: number;

  // Environment
  environments: number;
  exportAndCompliance: boolean;
  exportComplexity: "basic" | "standard" | "advanced" | "enterprise";
  auditLogRetentionDays: number;

  // Autonomy
  autonomyMode: "draft-first" | "structured" | "full";
  customRoutingPolicies: boolean;
  customSafetyPolicies: boolean;
  customBudgetEnvelopes: boolean;
  reservedThroughput: boolean;
  byoModelProvider: boolean;
}

// ── 5-Tier Plan Definitions ─────────────────────────────────

export const PLANS: PlanDefinition[] = [
  // ─── Plan 1: Personal / Solo ──────────────────────────────
  {
    planId: "personal",
    name: "Personal",
    tier: "personal",
    monthlyPriceCents: 4900,
    positioning: "Your personal AI operating layer.",
    bestFor: ["Individual operators", "Solo founders", "Personal intelligence use", "Light always-on AI"],
    entitlements: {
      connectedSystems: 3, activeMonitoringCapacity: 5, activeAutomationVolume: 3,
      workspaces: 1, seats: 1,
      standardAdvisorDepth: true, advancedMissionDepth: false, premiumStrategicReviews: 0, boardroomSessions: 0,
      engineeringTeamAccess: false, selfHealingScope: "basic", selfHealingCategories: 2, aiTeamConcurrency: 2,
      deepReasoningMinutesPerMonth: 10, maxCostClassAllowed: "B",
      contextCompressionRequired: true, cacheEnabled: true, cachePriorityClass: "standard",
      routingTierPermissions: ["utility", "standard"],
      monthlyComputeBudgetCents: 500, dailyBurstAllowanceCents: 50,
      premiumModelAccess: false, exceptionalModelAccess: false,
      maxPremiumEscalationsPerCycle: 0, proactiveInferenceBudgetCents: 150,
      maxAsyncHighComputeJobs: 0, maxSimultaneousAgentMissions: 2,
      environments: 1, exportAndCompliance: false, exportComplexity: "basic", auditLogRetentionDays: 30,
      autonomyMode: "draft-first", customRoutingPolicies: false, customSafetyPolicies: false,
      customBudgetEnvelopes: false, reservedThroughput: false, byoModelProvider: false,
    },
    userFacingCapabilities: {
      activeAdvisorCoverage: "Standard advisor access",
      monitoringCapacity: "Always-on monitoring for up to 5 scopes",
      connectedSystems: "Up to 3 connected systems",
      automationCapacity: "3 active automations",
      strategicReviewDepth: "Daily & weekly summaries",
      aiEngineeringCapacity: "—",
      environmentCoverage: "Single environment",
      selfHealingScope: "Basic self-healing for low-risk tasks",
      priorityResponseTier: "Standard",
      exportAndEvidenceDepth: "Basic exports",
    },
  },

  // ─── Plan 2: Pro / Operator ───────────────────────────────
  {
    planId: "pro",
    name: "Pro",
    tier: "pro",
    monthlyPriceCents: 14900,
    positioning: "Always-on operational intelligence with premium control.",
    bestFor: ["Serious individuals", "Operators", "Small businesses", "Advanced admin/control use"],
    entitlements: {
      connectedSystems: 10, activeMonitoringCapacity: 20, activeAutomationVolume: 15,
      workspaces: 3, seats: 3,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: 4, boardroomSessions: 2,
      engineeringTeamAccess: true, selfHealingScope: "advanced", selfHealingCategories: 6, aiTeamConcurrency: 5,
      deepReasoningMinutesPerMonth: 60, maxCostClassAllowed: "C",
      contextCompressionRequired: false, cacheEnabled: true, cachePriorityClass: "elevated",
      routingTierPermissions: ["utility", "standard", "premium"],
      monthlyComputeBudgetCents: 3000, dailyBurstAllowanceCents: 200,
      premiumModelAccess: true, exceptionalModelAccess: false,
      maxPremiumEscalationsPerCycle: 8, proactiveInferenceBudgetCents: 900,
      maxAsyncHighComputeJobs: 3, maxSimultaneousAgentMissions: 5,
      environments: 2, exportAndCompliance: true, exportComplexity: "standard", auditLogRetentionDays: 90,
      autonomyMode: "structured", customRoutingPolicies: false, customSafetyPolicies: false,
      customBudgetEnvelopes: false, reservedThroughput: false, byoModelProvider: false,
    },
    userFacingCapabilities: {
      activeAdvisorCoverage: "Broader advisor access with mid-tier depth",
      monitoringCapacity: "Up to 20 concurrent monitors",
      connectedSystems: "Up to 10 connected systems",
      automationCapacity: "15 active business automations",
      strategicReviewDepth: "4 premium deep analyses/month",
      aiEngineeringCapacity: "AI engineering team access",
      environmentCoverage: "2 environments",
      selfHealingScope: "Structured self-healing for low-risk classes",
      priorityResponseTier: "Priority",
      exportAndEvidenceDepth: "Rich exports and proofs",
    },
  },

  // ─── Plan 3: Business / Team ──────────────────────────────
  {
    planId: "business",
    name: "Business",
    tier: "business",
    monthlyPriceCents: 39900,
    positioning: "AI-powered business operations and engineering capacity.",
    bestFor: ["Teams", "Agencies", "Serious business operations", "Multi-workspace usage"],
    entitlements: {
      connectedSystems: 50, activeMonitoringCapacity: 100, activeAutomationVolume: 50,
      workspaces: 10, seats: 10,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: 20, boardroomSessions: 10,
      engineeringTeamAccess: true, selfHealingScope: "full", selfHealingCategories: 15, aiTeamConcurrency: 15,
      deepReasoningMinutesPerMonth: 300, maxCostClassAllowed: "D",
      contextCompressionRequired: false, cacheEnabled: true, cachePriorityClass: "premium",
      routingTierPermissions: ["utility", "standard", "premium", "exceptional"],
      monthlyComputeBudgetCents: 15000, dailyBurstAllowanceCents: 1000,
      premiumModelAccess: true, exceptionalModelAccess: true,
      maxPremiumEscalationsPerCycle: 40, proactiveInferenceBudgetCents: 4500,
      maxAsyncHighComputeJobs: 10, maxSimultaneousAgentMissions: 15,
      environments: 5, exportAndCompliance: true, exportComplexity: "advanced", auditLogRetentionDays: 365,
      autonomyMode: "full", customRoutingPolicies: false, customSafetyPolicies: false,
      customBudgetEnvelopes: false, reservedThroughput: false, byoModelProvider: false,
    },
    userFacingCapabilities: {
      activeAdvisorCoverage: "Full advisor council with premium depth",
      monitoringCapacity: "Up to 100 concurrent monitors",
      connectedSystems: "Up to 50 connected systems",
      automationCapacity: "50 active automations incl. revenue workflows",
      strategicReviewDepth: "20 premium strategic reviews/month",
      aiEngineeringCapacity: "Full AI engineering + release/confidence systems",
      environmentCoverage: "5 environments with team governance",
      selfHealingScope: "Expanded self-healing across all risk classes",
      priorityResponseTier: "High Priority",
      exportAndEvidenceDepth: "Advanced evidence, compliance, and proof packs",
    },
  },

  // ─── Plan 4: Scale / Advanced Ops ─────────────────────────
  {
    planId: "scale",
    name: "Scale",
    tier: "scale",
    monthlyPriceCents: 79900,
    positioning: "High-capacity autonomous operations with governed scale.",
    bestFor: ["Larger operations", "Multi-environment orgs", "Deeper admin/engineering/business complexity"],
    entitlements: {
      connectedSystems: 150, activeMonitoringCapacity: 500, activeAutomationVolume: 200,
      workspaces: 25, seats: 25,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: 60, boardroomSessions: 30,
      engineeringTeamAccess: true, selfHealingScope: "full", selfHealingCategories: 30, aiTeamConcurrency: 30,
      deepReasoningMinutesPerMonth: 900, maxCostClassAllowed: "D",
      contextCompressionRequired: false, cacheEnabled: true, cachePriorityClass: "premium",
      routingTierPermissions: ["utility", "standard", "premium", "exceptional"],
      monthlyComputeBudgetCents: 50000, dailyBurstAllowanceCents: 5000,
      premiumModelAccess: true, exceptionalModelAccess: true,
      maxPremiumEscalationsPerCycle: 120, proactiveInferenceBudgetCents: 15000,
      maxAsyncHighComputeJobs: 30, maxSimultaneousAgentMissions: 30,
      environments: 10, exportAndCompliance: true, exportComplexity: "advanced", auditLogRetentionDays: 730,
      autonomyMode: "full", customRoutingPolicies: true, customSafetyPolicies: true,
      customBudgetEnvelopes: true, reservedThroughput: false, byoModelProvider: false,
    },
    userFacingCapabilities: {
      activeAdvisorCoverage: "Unlimited advisor council with custom routing",
      monitoringCapacity: "Up to 500 concurrent monitors",
      connectedSystems: "Up to 150 connected systems",
      automationCapacity: "200 active automations with custom policies",
      strategicReviewDepth: "60 premium strategic missions/month",
      aiEngineeringCapacity: "Deep engineering board with custom governance",
      environmentCoverage: "10 environments with environment-specific autonomy",
      selfHealingScope: "Full self-healing with custom routing policies",
      priorityResponseTier: "Premium",
      exportAndEvidenceDepth: "Advanced compliance, investor, and audit exports",
    },
  },

  // ─── Plan 5: Enterprise ───────────────────────────────────
  {
    planId: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    monthlyPriceCents: 0, // custom pricing
    positioning: "Governed sovereign AI operations at enterprise scale.",
    bestFor: ["Large organizations", "Regulated or high-control use cases", "High-volume AI operations"],
    entitlements: {
      connectedSystems: -1, activeMonitoringCapacity: -1, activeAutomationVolume: -1,
      workspaces: -1, seats: -1,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: -1, boardroomSessions: -1,
      engineeringTeamAccess: true, selfHealingScope: "full", selfHealingCategories: -1, aiTeamConcurrency: 100,
      deepReasoningMinutesPerMonth: -1, maxCostClassAllowed: "D",
      contextCompressionRequired: false, cacheEnabled: true, cachePriorityClass: "premium",
      routingTierPermissions: ["utility", "standard", "premium", "exceptional"],
      monthlyComputeBudgetCents: -1, dailyBurstAllowanceCents: -1,
      premiumModelAccess: true, exceptionalModelAccess: true,
      maxPremiumEscalationsPerCycle: -1, proactiveInferenceBudgetCents: -1,
      maxAsyncHighComputeJobs: -1, maxSimultaneousAgentMissions: 100,
      environments: -1, exportAndCompliance: true, exportComplexity: "enterprise", auditLogRetentionDays: 2555,
      autonomyMode: "full", customRoutingPolicies: true, customSafetyPolicies: true,
      customBudgetEnvelopes: true, reservedThroughput: true, byoModelProvider: true,
    },
    userFacingCapabilities: {
      activeAdvisorCoverage: "Unlimited — custom advisor routing & reserved throughput",
      monitoringCapacity: "Unlimited with dedicated compute options",
      connectedSystems: "Unlimited with BYO provider support",
      automationCapacity: "Unlimited with custom safety/autonomy policies",
      strategicReviewDepth: "Unlimited premium strategic missions",
      aiEngineeringCapacity: "Full AI engineering with reserved compute",
      environmentCoverage: "Unlimited environments with per-env autonomy controls",
      selfHealingScope: "Full self-healing with custom policies and SLA",
      priorityResponseTier: "Premium SLA + dedicated support",
      exportAndEvidenceDepth: "Enterprise compliance, investor, and regulatory exports",
    },
  },
];

// ── Upsell Add-Ons ──────────────────────────────────────────

export interface UpsellAddon {
  addonId: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  applicableTiers: PlanTier[];
  entitlementOverrides: Partial<PlanEntitlements>;
}

export const UPSELL_ADDONS: UpsellAddon[] = [
  {
    addonId: "extra-connectors",
    name: "Additional Connected Systems",
    description: "+10 connected systems",
    monthlyPriceCents: 1900,
    applicableTiers: ["personal", "pro", "business", "scale"],
    entitlementOverrides: { connectedSystems: 10 }, // additive
  },
  {
    addonId: "extra-environments",
    name: "Extra Environments",
    description: "+2 active environments",
    monthlyPriceCents: 2900,
    applicableTiers: ["pro", "business", "scale"],
    entitlementOverrides: { environments: 2 },
  },
  {
    addonId: "strategic-review-pack",
    name: "Premium Strategic Review Pack",
    description: "+10 strategic reviews/month",
    monthlyPriceCents: 3900,
    applicableTiers: ["pro", "business", "scale"],
    entitlementOverrides: { premiumStrategicReviews: 10, deepReasoningMinutesPerMonth: 60 },
  },
  {
    addonId: "engineering-capacity",
    name: "Higher AI Engineering Capacity",
    description: "+5 concurrent AI team missions",
    monthlyPriceCents: 4900,
    applicableTiers: ["pro", "business", "scale"],
    entitlementOverrides: { aiTeamConcurrency: 5 },
  },
  {
    addonId: "self-healing-upgrade",
    name: "Expanded Self-Healing Scope",
    description: "Upgrade self-healing to next tier + more categories",
    monthlyPriceCents: 2900,
    applicableTiers: ["personal", "pro", "business"],
    entitlementOverrides: { selfHealingCategories: 8 },
  },
  {
    addonId: "compliance-bundle",
    name: "Advanced Compliance & Export Bundle",
    description: "Advanced evidence, investor, and compliance exports",
    monthlyPriceCents: 4900,
    applicableTiers: ["pro", "business"],
    entitlementOverrides: { exportAndCompliance: true, exportComplexity: "advanced", auditLogRetentionDays: 365 },
  },
  {
    addonId: "concurrency-boost",
    name: "Higher Concurrency",
    description: "+10 simultaneous agent missions",
    monthlyPriceCents: 3900,
    applicableTiers: ["business", "scale"],
    entitlementOverrides: { maxSimultaneousAgentMissions: 10 },
  },
  {
    addonId: "dedicated-compute",
    name: "Dedicated Compute Add-On",
    description: "Reserved compute throughput for high-priority workloads",
    monthlyPriceCents: 9900,
    applicableTiers: ["scale"],
    entitlementOverrides: { reservedThroughput: true, monthlyComputeBudgetCents: 25000 },
  },
  {
    addonId: "release-simulation",
    name: "Premium Release Simulation Pack",
    description: "Advanced release simulation, dry-run, and confidence projection",
    monthlyPriceCents: 2900,
    applicableTiers: ["pro", "business", "scale"],
    entitlementOverrides: { maxAsyncHighComputeJobs: 5 },
  },
];

// ── Fair Use Engine ─────────────────────────────────────────

export type FairUseAction =
  | "reduce-deep-frequency"
  | "switch-to-async"
  | "lower-model-tier"
  | "increase-caching"
  | "narrow-context"
  | "require-intentional-deep"
  | "suggest-upgrade"
  | "digest-mode";

export interface FairUsePolicy {
  /** When deep reasoning usage exceeds this % of allocation, begin graceful adaptation */
  deepReasoningThresholdPct: number;
  /** When proactive inference budget exceeds this %, adapt */
  proactiveInferenceThresholdPct: number;
  /** Max premium escalations per hour before throttle */
  maxEscalationsPerHour: number;
  /** Minimum cache hit rate before forcing digest mode */
  minCacheHitRatePct: number;
  /** Ordered response actions — least intrusive first */
  escalationChain: FairUseAction[];
}

export const FAIR_USE_POLICY: FairUsePolicy = {
  deepReasoningThresholdPct: 80,
  proactiveInferenceThresholdPct: 85,
  maxEscalationsPerHour: 5,
  minCacheHitRatePct: 20,
  escalationChain: [
    "increase-caching",
    "narrow-context",
    "switch-to-async",
    "lower-model-tier",
    "reduce-deep-frequency",
    "require-intentional-deep",
    "digest-mode",
    "suggest-upgrade",
  ],
};

export interface FairUseEvaluation {
  healthy: boolean;
  pressureLevel: "none" | "low" | "medium" | "high";
  activeAdaptations: FairUseAction[];
  reason: string;
}

export function evaluateFairUse(
  plan: PlanDefinition,
  deepReasoningUsedMin: number,
  proactiveSpentCents: number,
  escalationsThisHour: number,
  cacheHitRatePct: number,
): FairUseEvaluation {
  const e = plan.entitlements;
  const adaptations: FairUseAction[] = [];
  let pressure: "none" | "low" | "medium" | "high" = "none";
  const reasons: string[] = [];

  // Deep reasoning pressure
  if (e.deepReasoningMinutesPerMonth > 0) {
    const drPct = (deepReasoningUsedMin / e.deepReasoningMinutesPerMonth) * 100;
    if (drPct >= 95) {
      adaptations.push("require-intentional-deep", "suggest-upgrade");
      pressure = "high";
      reasons.push(`Deep reasoning at ${drPct.toFixed(0)}%`);
    } else if (drPct >= FAIR_USE_POLICY.deepReasoningThresholdPct) {
      adaptations.push("reduce-deep-frequency", "switch-to-async");
      pressure = pressure === "none" ? "medium" : pressure;
      reasons.push(`Deep reasoning at ${drPct.toFixed(0)}%`);
    }
  }

  // Proactive inference pressure
  if (e.proactiveInferenceBudgetCents > 0) {
    const piPct = (proactiveSpentCents / e.proactiveInferenceBudgetCents) * 100;
    if (piPct >= FAIR_USE_POLICY.proactiveInferenceThresholdPct) {
      adaptations.push("increase-caching", "digest-mode");
      pressure = pressure === "none" ? "medium" : pressure;
      reasons.push(`Proactive inference at ${piPct.toFixed(0)}%`);
    }
  }

  // Escalation rate
  if (escalationsThisHour > FAIR_USE_POLICY.maxEscalationsPerHour) {
    adaptations.push("lower-model-tier", "narrow-context");
    pressure = pressure === "none" ? "low" : pressure;
    reasons.push(`${escalationsThisHour} escalations this hour`);
  }

  // Cache efficiency
  if (cacheHitRatePct < FAIR_USE_POLICY.minCacheHitRatePct) {
    adaptations.push("increase-caching");
    pressure = pressure === "none" ? "low" : pressure;
    reasons.push(`Cache hit rate only ${cacheHitRatePct}%`);
  }

  return {
    healthy: adaptations.length === 0,
    pressureLevel: pressure,
    activeAdaptations: [...new Set(adaptations)],
    reason: reasons.length ? reasons.join("; ") : "Within fair use bounds",
  };
}

// ── Enterprise Custom Economics ──────────────────────────────

export interface EnterpriseCustomEconomics {
  tenantId: string;
  customBudgetEnvelopeCents: number;
  reservedComputeThroughput: boolean;
  customRoutingPolicyId?: string;
  customSafetyPolicyId?: string;
  hybridInferenceEnabled: boolean;
  byoModelProviderEnabled: boolean;
  byoProviderConfig?: { provider: string; apiKeyRef: string; models: string[] };
  premiumSla: { responseTimeMs: number; uptimePct: number; supportTier: string };
  dedicatedCompute: boolean;
  customRetentionDays: number;
}

// ── Entitlement Checks ──────────────────────────────────────

export interface EntitlementCheckResult {
  allowed: boolean;
  reason: string;
  suggestion?: string;
  upgradeRequired?: string;
}

export function checkEntitlement(
  plan: PlanDefinition,
  capability: string,
  currentUsage?: number,
): EntitlementCheckResult {
  const e = plan.entitlements;
  const unlimited = (v: number) => v === -1;

  switch (capability) {
    case "deep-reasoning":
      if (unlimited(e.deepReasoningMinutesPerMonth)) return { allowed: true, reason: "Unlimited deep reasoning" };
      if (currentUsage !== undefined && currentUsage >= e.deepReasoningMinutesPerMonth)
        return { allowed: false, reason: "Deep reasoning limit reached", suggestion: "Wait for next period or upgrade", upgradeRequired: "pro" };
      return { allowed: true, reason: "Within deep reasoning allowance" };

    case "premium-model":
      return e.premiumModelAccess
        ? { allowed: true, reason: "Premium model access included" }
        : { allowed: false, reason: "Premium models not in plan", upgradeRequired: "pro" };

    case "exceptional-model":
      return e.exceptionalModelAccess
        ? { allowed: true, reason: "Exceptional compute available" }
        : { allowed: false, reason: "Exceptional compute requires Business+", upgradeRequired: "business" };

    case "boardroom":
      if (unlimited(e.boardroomSessions)) return { allowed: true, reason: "Unlimited boardroom" };
      if (currentUsage !== undefined && currentUsage >= e.boardroomSessions)
        return { allowed: false, reason: "Boardroom sessions exhausted", upgradeRequired: "business" };
      return { allowed: true, reason: "Boardroom sessions available" };

    case "engineering-team":
      return e.engineeringTeamAccess
        ? { allowed: true, reason: "AI engineering team included" }
        : { allowed: false, reason: "Engineering team requires Pro+", upgradeRequired: "pro" };

    case "self-healing":
      return { allowed: e.selfHealingScope !== "none", reason: `Self-healing scope: ${e.selfHealingScope}` };

    case "connected-systems":
      if (unlimited(e.connectedSystems)) return { allowed: true, reason: "Unlimited connected systems" };
      if (currentUsage !== undefined && currentUsage >= e.connectedSystems)
        return { allowed: false, reason: `Connected systems limit reached (${e.connectedSystems})`, suggestion: "Purchase additional connector add-on", upgradeRequired: "pro" };
      return { allowed: true, reason: `${e.connectedSystems - (currentUsage ?? 0)} connector slots available` };

    case "environments":
      if (unlimited(e.environments)) return { allowed: true, reason: "Unlimited environments" };
      if (currentUsage !== undefined && currentUsage >= e.environments)
        return { allowed: false, reason: `Environment limit reached (${e.environments})`, upgradeRequired: "scale" };
      return { allowed: true, reason: `${e.environments - (currentUsage ?? 0)} environment slots available` };

    case "async-compute":
      if (unlimited(e.maxAsyncHighComputeJobs)) return { allowed: true, reason: "Unlimited async jobs" };
      if (currentUsage !== undefined && currentUsage >= e.maxAsyncHighComputeJobs)
        return { allowed: false, reason: "Async compute job limit reached", upgradeRequired: "business" };
      return { allowed: true, reason: "Async compute available" };

    case "custom-routing":
      return e.customRoutingPolicies
        ? { allowed: true, reason: "Custom routing policies enabled" }
        : { allowed: false, reason: "Custom routing requires Scale+", upgradeRequired: "scale" };

    case "reserved-throughput":
      return e.reservedThroughput
        ? { allowed: true, reason: "Reserved throughput active" }
        : { allowed: false, reason: "Reserved throughput requires Enterprise", upgradeRequired: "enterprise" };

    case "byo-model":
      return e.byoModelProvider
        ? { allowed: true, reason: "BYO model/provider enabled" }
        : { allowed: false, reason: "BYO model/provider requires Enterprise", upgradeRequired: "enterprise" };

    default:
      return { allowed: true, reason: "No specific entitlement check" };
  }
}

export function getComputeBudget(plan: PlanDefinition): { monthlyCents: number; dailyBurstCents: number; isUnlimited: boolean } {
  const e = plan.entitlements;
  return {
    monthlyCents: e.monthlyComputeBudgetCents,
    dailyBurstCents: e.dailyBurstAllowanceCents,
    isUnlimited: e.monthlyComputeBudgetCents === -1,
  };
}

export function getApplicableAddons(tier: PlanTier): UpsellAddon[] {
  return UPSELL_ADDONS.filter(a => a.applicableTiers.includes(tier));
}

export function getPlanByTier(tier: PlanTier): PlanDefinition | undefined {
  return PLANS.find(p => p.tier === tier);
}
