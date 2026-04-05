// ═══════════════════════════════════════════════════════════════
// SITA OS — Plan Entitlement Engine
// Maps subscription plans to capacity, depth, and AI coverage.
// Users buy abundance; platform meters internally.
// ═══════════════════════════════════════════════════════════════

export interface PlanDefinition {
  planId: string;
  name: string;
  tier: "starter" | "professional" | "business" | "enterprise";
  monthlyPriceCents: number;
  entitlements: PlanEntitlements;
}

export interface PlanEntitlements {
  // Capacity
  connectedSystems: number;           // max integrations
  activeMonitoringCapacity: number;    // concurrent monitors
  activeAutomationVolume: number;      // concurrent automations
  workspaces: number;

  // Advisor depth
  standardAdvisorDepth: boolean;
  advancedMissionDepth: boolean;
  premiumStrategicReviews: number;     // per month
  boardroomSessions: number;           // per month

  // AI teams
  engineeringTeamAccess: boolean;
  selfHealingScope: "basic" | "advanced" | "full";
  aiTeamConcurrency: number;           // max concurrent agents

  // Compute governance
  deepReasoningMinutesPerMonth: number;
  maxCostClassAllowed: "A" | "B" | "C" | "D";
  contextCompressionRequired: boolean;
  cacheEnabled: boolean;

  // Budget envelope (internal)
  monthlyComputeBudgetCents: number;
  dailyBurstAllowanceCents: number;
  premiumModelAccess: boolean;
  exceptionalModelAccess: boolean;

  // Environment
  environments: number;
  exportAndCompliance: boolean;
  auditLogRetentionDays: number;
}

// ── Default Plans ───────────────────────────────────────────

export const PLANS: PlanDefinition[] = [
  {
    planId: "starter",
    name: "Starter",
    tier: "starter",
    monthlyPriceCents: 4900,
    entitlements: {
      connectedSystems: 3, activeMonitoringCapacity: 5, activeAutomationVolume: 3, workspaces: 1,
      standardAdvisorDepth: true, advancedMissionDepth: false, premiumStrategicReviews: 0, boardroomSessions: 0,
      engineeringTeamAccess: false, selfHealingScope: "basic", aiTeamConcurrency: 2,
      deepReasoningMinutesPerMonth: 10, maxCostClassAllowed: "B", contextCompressionRequired: true, cacheEnabled: true,
      monthlyComputeBudgetCents: 500, dailyBurstAllowanceCents: 50, premiumModelAccess: false, exceptionalModelAccess: false,
      environments: 1, exportAndCompliance: false, auditLogRetentionDays: 30,
    },
  },
  {
    planId: "professional",
    name: "Professional",
    tier: "professional",
    monthlyPriceCents: 14900,
    entitlements: {
      connectedSystems: 10, activeMonitoringCapacity: 20, activeAutomationVolume: 15, workspaces: 3,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: 4, boardroomSessions: 2,
      engineeringTeamAccess: true, selfHealingScope: "advanced", aiTeamConcurrency: 5,
      deepReasoningMinutesPerMonth: 60, maxCostClassAllowed: "C", contextCompressionRequired: false, cacheEnabled: true,
      monthlyComputeBudgetCents: 3000, dailyBurstAllowanceCents: 200, premiumModelAccess: true, exceptionalModelAccess: false,
      environments: 2, exportAndCompliance: true, auditLogRetentionDays: 90,
    },
  },
  {
    planId: "business",
    name: "Business",
    tier: "business",
    monthlyPriceCents: 39900,
    entitlements: {
      connectedSystems: 50, activeMonitoringCapacity: 100, activeAutomationVolume: 50, workspaces: 10,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: 20, boardroomSessions: 10,
      engineeringTeamAccess: true, selfHealingScope: "full", aiTeamConcurrency: 15,
      deepReasoningMinutesPerMonth: 300, maxCostClassAllowed: "D", contextCompressionRequired: false, cacheEnabled: true,
      monthlyComputeBudgetCents: 15000, dailyBurstAllowanceCents: 1000, premiumModelAccess: true, exceptionalModelAccess: true,
      environments: 5, exportAndCompliance: true, auditLogRetentionDays: 365,
    },
  },
  {
    planId: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    monthlyPriceCents: 99900,
    entitlements: {
      connectedSystems: -1, activeMonitoringCapacity: -1, activeAutomationVolume: -1, workspaces: -1,
      standardAdvisorDepth: true, advancedMissionDepth: true, premiumStrategicReviews: -1, boardroomSessions: -1,
      engineeringTeamAccess: true, selfHealingScope: "full", aiTeamConcurrency: 50,
      deepReasoningMinutesPerMonth: -1, maxCostClassAllowed: "D", contextCompressionRequired: false, cacheEnabled: true,
      monthlyComputeBudgetCents: 100000, dailyBurstAllowanceCents: 10000, premiumModelAccess: true, exceptionalModelAccess: true,
      environments: -1, exportAndCompliance: true, auditLogRetentionDays: 730,
    },
  },
];

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

  switch (capability) {
    case "deep-reasoning":
      if (e.deepReasoningMinutesPerMonth === -1) return { allowed: true, reason: "Unlimited deep reasoning" };
      if (currentUsage !== undefined && currentUsage >= e.deepReasoningMinutesPerMonth)
        return { allowed: false, reason: "Deep reasoning limit reached", suggestion: "Wait for next period or upgrade", upgradeRequired: "professional" };
      return { allowed: true, reason: "Within deep reasoning allowance" };

    case "premium-model":
      return e.premiumModelAccess
        ? { allowed: true, reason: "Premium model access included" }
        : { allowed: false, reason: "Premium models not in plan", upgradeRequired: "professional" };

    case "exceptional-model":
      return e.exceptionalModelAccess
        ? { allowed: true, reason: "Exceptional compute available" }
        : { allowed: false, reason: "Exceptional compute requires Business+", upgradeRequired: "business" };

    case "boardroom":
      if (e.boardroomSessions === -1) return { allowed: true, reason: "Unlimited boardroom" };
      if (currentUsage !== undefined && currentUsage >= e.boardroomSessions)
        return { allowed: false, reason: "Boardroom sessions exhausted", upgradeRequired: "business" };
      return { allowed: true, reason: "Boardroom sessions available" };

    case "engineering-team":
      return e.engineeringTeamAccess
        ? { allowed: true, reason: "AI engineering team included" }
        : { allowed: false, reason: "Engineering team requires Professional+", upgradeRequired: "professional" };

    case "self-healing":
      return { allowed: true, reason: `Self-healing scope: ${e.selfHealingScope}` };

    default:
      return { allowed: true, reason: "No specific entitlement check" };
  }
}

export function getComputeBudget(plan: PlanDefinition): { monthlyCents: number; dailyBurstCents: number; isUnlimited: boolean } {
  const e = plan.entitlements;
  return {
    monthlyCents: e.monthlyComputeBudgetCents,
    dailyBurstCents: e.dailyBurstAllowanceCents,
    isUnlimited: e.monthlyComputeBudgetCents >= 100000,
  };
}
