// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Budget Routing Policy Engine
// Exact budget governance for the AI engineering team
// ═══════════════════════════════════════════════════════════════

// ── Budget Classes ──

export type AdminBudgetClass =
  | "economy_admin"
  | "balanced_admin"
  | "premium_architecture"
  | "deep_audit"
  | "internal_diagnostics";

export interface BudgetClassSpec {
  key: AdminBudgetClass;
  label: string;
  costBandCents: [number, number]; // [min, max] per request
  maxTokens: number;
  temperature: number;
  allowedUseCases: string[];
}

export const BUDGET_CLASS_SPECS: Record<AdminBudgetClass, BudgetClassSpec> = {
  economy_admin: {
    key: "economy_admin",
    label: "Economy",
    costBandCents: [0.1, 1],
    maxTokens: 500,
    temperature: 0.1,
    allowedUseCases: [
      "tagging", "classifying", "summarizing short logs", "light triage",
      "repeated operational diagnostics", "low-risk recommendation drafting",
    ],
  },
  balanced_admin: {
    key: "balanced_admin",
    label: "Balanced",
    costBandCents: [1, 5],
    maxTokens: 800,
    temperature: 0.3,
    allowedUseCases: [
      "runtime truth summaries", "connector diagnostics", "launch-readiness summaries",
      "schema gap summaries", "moderate investigation tasks",
    ],
  },
  premium_architecture: {
    key: "premium_architecture",
    label: "Premium Architecture",
    costBandCents: [5, 30],
    maxTokens: 2000,
    temperature: 0.4,
    allowedUseCases: [
      "architecture review", "system-wide remediation planning", "founder synthesis",
      "complex tradeoff reasoning", "multi-domain analysis",
    ],
  },
  deep_audit: {
    key: "deep_audit",
    label: "Deep Audit",
    costBandCents: [10, 50],
    maxTokens: 3000,
    temperature: 0.3,
    allowedUseCases: [
      "comprehensive audit synthesis", "board/launch/operator reports",
      "contradiction mapping across systems",
    ],
  },
  internal_diagnostics: {
    key: "internal_diagnostics",
    label: "Internal Diagnostics",
    costBandCents: [0.5, 3],
    maxTokens: 600,
    temperature: 0.2,
    allowedUseCases: [
      "support engineering", "health analysis", "degradation triage", "fallback analysis",
    ],
  },
};

// ── Role Default Routing ──

export interface RoleBudgetPolicy {
  defaultClass: AdminBudgetClass;
  fallbackClass: AdminBudgetClass;
  premiumJustification: string;
  maxDailyPremiumRuns: number;
  maxDailySpendCents: number;
}

export const ROLE_BUDGET_POLICIES: Record<string, RoleBudgetPolicy> = {
  chief_architect: {
    defaultClass: "premium_architecture",
    fallbackClass: "balanced_admin",
    premiumJustification: "Synthesis, tradeoff analysis, or system-wide reasoning only",
    maxDailyPremiumRuns: 5,
    maxDailySpendCents: 200,
  },
  runtime_truth_analyst: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Cross-domain audit synthesis only",
    maxDailyPremiumRuns: 3,
    maxDailySpendCents: 100,
  },
  connector_ops_engineer: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "High-level strategic remediation only",
    maxDailyPremiumRuns: 2,
    maxDailySpendCents: 80,
  },
  ai_governance_engineer: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Provider/model architecture strategy only",
    maxDailyPremiumRuns: 2,
    maxDailySpendCents: 80,
  },
  quality_launch_engineer: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Rarely needed — only for complex gate analysis",
    maxDailyPremiumRuns: 2,
    maxDailySpendCents: 60,
  },
  data_schema_engineer: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Large-scale migration planning only",
    maxDailyPremiumRuns: 2,
    maxDailySpendCents: 60,
  },
  device_surface_engineer: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Cross-platform architecture analysis only",
    maxDailyPremiumRuns: 2,
    maxDailySpendCents: 60,
  },
  budget_efficiency_analyst: {
    defaultClass: "economy_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Almost never — economy is sufficient",
    maxDailyPremiumRuns: 1,
    maxDailySpendCents: 30,
  },
  incident_drift_analyst: {
    defaultClass: "economy_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "High-severity cross-system incidents only",
    maxDailyPremiumRuns: 3,
    maxDailySpendCents: 80,
  },
  remediation_planner: {
    defaultClass: "balanced_admin",
    fallbackClass: "economy_admin",
    premiumJustification: "Major program planning only — upgrade to premium_architecture",
    maxDailyPremiumRuns: 3,
    maxDailySpendCents: 150,
  },
};

// ── Budget Thresholds ──

export interface BudgetThresholds {
  dailyGlobalAdminSpendCents: number;
  dailyRoleSpendCents: number;
  dailyTaskFamilySpendCents: number;
  perRequestMaxCents: number;
  premiumPercentageCeiling: number; // 0–100
  rerunCeilingPerHour: number;
}

export const DEFAULT_THRESHOLDS: BudgetThresholds = {
  dailyGlobalAdminSpendCents: 500,    // $5/day total admin AI
  dailyRoleSpendCents: 200,           // $2/day per role
  dailyTaskFamilySpendCents: 100,     // $1/day per task family
  perRequestMaxCents: 50,             // 50¢ per single request
  premiumPercentageCeiling: 30,       // Max 30% of tasks should be premium
  rerunCeilingPerHour: 5,             // Same scope rerun warning
};

// ── Pre-Flight Budget Check ──

export type BudgetCheckSeverity = "ok" | "info" | "warning" | "block";

export interface BudgetPreFlightResult {
  severity: BudgetCheckSeverity;
  allowed: boolean;
  effectiveBudgetClass: AdminBudgetClass;
  downgraded: boolean;
  warnings: string[];
  estimatedCostBand: string;
  justificationRequired: boolean;
}

export interface InvocationHistory {
  roleDailySpendCents: number;
  roleDailyPremiumRuns: number;
  globalDailySpendCents: number;
  taskFamilyDailySpendCents: number;
  sameTaskRerunsThisHour: number;
  globalDailyPremiumPercent: number;
}

/**
 * Pre-flight budget check before executing a workforce task.
 * Returns routing decision with potential downgrade + warnings.
 */
export function checkBudgetPreFlight(
  roleKey: string,
  requestedClass: AdminBudgetClass,
  taskType: string,
  history: InvocationHistory,
  thresholds: BudgetThresholds = DEFAULT_THRESHOLDS,
): BudgetPreFlightResult {
  const policy = ROLE_BUDGET_POLICIES[roleKey];
  const warnings: string[] = [];
  let effectiveClass = requestedClass;
  let downgraded = false;
  let severity: BudgetCheckSeverity = "ok";
  let justificationRequired = false;

  // Rule A — Default to cheapest sufficient model
  if (!policy) {
    effectiveClass = "economy_admin";
    warnings.push("Unknown role — defaulting to economy class");
  }

  // Rule B — Premium must be justified
  const isPremium = effectiveClass === "premium_architecture" || effectiveClass === "deep_audit";
  if (isPremium) {
    justificationRequired = true;

    // Check daily premium run limit per role
    if (policy && history.roleDailyPremiumRuns >= policy.maxDailyPremiumRuns) {
      effectiveClass = policy.fallbackClass;
      downgraded = true;
      warnings.push(
        `Premium run limit reached for ${roleKey} (${policy.maxDailyPremiumRuns}/day). Downgraded to ${effectiveClass}.`
      );
    }

    // Check premium percentage ceiling
    if (history.globalDailyPremiumPercent > thresholds.premiumPercentageCeiling) {
      if (!downgraded) {
        effectiveClass = policy?.fallbackClass ?? "balanced_admin";
        downgraded = true;
      }
      warnings.push(
        `Premium share is ${history.globalDailyPremiumPercent.toFixed(0)}% (ceiling: ${thresholds.premiumPercentageCeiling}%). Downgrading.`
      );
    }
  }

  // Rule C — Repeated tasks should bias cheaper
  const isRecurring = ["summarize", "generate_digest", "classify"].includes(taskType);
  if (isRecurring && effectiveClass !== "economy_admin") {
    warnings.push("Recurring task type — consider economy class or cached output.");
    severity = "info";
  }

  // Rule D — Large-scope tasks should warn before premium
  if (isPremium && !downgraded) {
    severity = "warning";
    warnings.push("Premium model selected — verify scope is focused to avoid unnecessary cost.");
  }

  // Rule E — Fallback on budget thresholds
  // Per-role daily spend
  if (policy && history.roleDailySpendCents >= policy.maxDailySpendCents) {
    effectiveClass = policy.fallbackClass;
    downgraded = true;
    severity = "warning";
    warnings.push(`Role daily spend limit reached (${(policy.maxDailySpendCents / 100).toFixed(2)}). Downgraded.`);
  }

  // Global daily admin AI spend
  if (history.globalDailySpendCents >= thresholds.dailyGlobalAdminSpendCents) {
    effectiveClass = "economy_admin";
    downgraded = true;
    severity = "block";
    warnings.push(`Global admin AI daily budget exhausted ($${(thresholds.dailyGlobalAdminSpendCents / 100).toFixed(2)}).`);
  }

  // Task family daily spend
  if (history.taskFamilyDailySpendCents >= thresholds.dailyTaskFamilySpendCents) {
    if (effectiveClass !== "economy_admin") {
      effectiveClass = "economy_admin";
      downgraded = true;
    }
    warnings.push(`Task family daily budget reached. Forcing economy.`);
  }

  // Per-request max cost check
  const spec = BUDGET_CLASS_SPECS[effectiveClass];
  if (spec.costBandCents[1] > thresholds.perRequestMaxCents) {
    severity = "warning";
    warnings.push(`Max single-request cost (${thresholds.perRequestMaxCents}¢) may be exceeded.`);
  }

  // Rule F — Deep audit rerun limit
  if (effectiveClass === "deep_audit" && history.sameTaskRerunsThisHour >= 2) {
    effectiveClass = "balanced_admin";
    downgraded = true;
    severity = "warning";
    warnings.push("Deep audit rerun detected — downgrading to balanced to control cost.");
  }

  // Rerun ceiling
  if (history.sameTaskRerunsThisHour >= thresholds.rerunCeilingPerHour) {
    severity = "block";
    warnings.push(
      `Same task re-run ${history.sameTaskRerunsThisHour}× this hour (limit: ${thresholds.rerunCeilingPerHour}). Consider caching.`
    );
  }

  const allowed = severity !== "block";
  const finalSpec = BUDGET_CLASS_SPECS[effectiveClass];
  const estimatedCostBand = `$${(finalSpec.costBandCents[0] / 100).toFixed(3)}–$${(finalSpec.costBandCents[1] / 100).toFixed(2)}`;

  return {
    severity,
    allowed,
    effectiveBudgetClass: effectiveClass,
    downgraded,
    warnings,
    estimatedCostBand,
    justificationRequired,
  };
}

/**
 * Get execution parameters from the effective budget class.
 */
export function getBudgetExecutionParams(budgetClass: AdminBudgetClass) {
  const spec = BUDGET_CLASS_SPECS[budgetClass];
  return {
    maxTokens: spec.maxTokens,
    temperature: spec.temperature,
    taskClass: budgetClass === "premium_architecture" || budgetClass === "deep_audit"
      ? "premium_synthesis" as const
      : budgetClass === "economy_admin" || budgetClass === "internal_diagnostics"
        ? "cheap_utility" as const
        : "balanced_assistant" as const,
  };
}

/**
 * Derive cost-saving suggestions from invocation history.
 */
export function getCostSavingSuggestions(
  history: InvocationHistory,
  roleKey: string,
): string[] {
  const suggestions: string[] = [];
  const policy = ROLE_BUDGET_POLICIES[roleKey];

  if (history.sameTaskRerunsThisHour > 2) {
    suggestions.push("Consider enabling output caching for this task — re-runs detected.");
  }
  if (history.globalDailyPremiumPercent > 20) {
    suggestions.push("Premium usage trending high — use two-step routing: cheap classifier → premium only if needed.");
  }
  if (policy && history.roleDailySpendCents > policy.maxDailySpendCents * 0.7) {
    suggestions.push(`${roleKey} is at ${Math.round((history.roleDailySpendCents / policy.maxDailySpendCents) * 100)}% of daily limit — consider narrowing scope.`);
  }
  if (history.sameTaskRerunsThisHour > 0) {
    suggestions.push("Try diff-based summaries instead of full re-analysis for repeated scopes.");
  }

  return suggestions;
}

/**
 * Collect invocation history from recent invocations data for budget checking.
 */
export function buildInvocationHistory(
  invocations: Array<{
    role_key: string;
    task_type: string;
    cost_cents: number;
    budget_class: string;
    created_at: string;
    input_summary?: string;
  }>,
  currentRoleKey: string,
  currentTaskType: string,
): InvocationHistory {
  const now = new Date();
  const todayStr = now.toDateString();
  const oneHourAgo = new Date(now.getTime() - 3600_000);

  const todayInvocations = invocations.filter(
    i => new Date(i.created_at).toDateString() === todayStr
  );

  const roleDailySpendCents = todayInvocations
    .filter(i => i.role_key === currentRoleKey)
    .reduce((s, i) => s + (i.cost_cents ?? 0), 0);

  const roleDailyPremiumRuns = todayInvocations
    .filter(i => i.role_key === currentRoleKey && (i.budget_class === "premium_architecture" || i.budget_class === "deep_audit"))
    .length;

  const globalDailySpendCents = todayInvocations.reduce((s, i) => s + (i.cost_cents ?? 0), 0);

  const taskFamilyDailySpendCents = todayInvocations
    .filter(i => i.task_type === currentTaskType)
    .reduce((s, i) => s + (i.cost_cents ?? 0), 0);

  const sameTaskRerunsThisHour = invocations
    .filter(i =>
      i.role_key === currentRoleKey &&
      i.task_type === currentTaskType &&
      new Date(i.created_at) > oneHourAgo
    ).length;

  const premiumCount = todayInvocations.filter(
    i => i.budget_class === "premium_architecture" || i.budget_class === "deep_audit"
  ).length;
  const globalDailyPremiumPercent = todayInvocations.length > 0
    ? (premiumCount / todayInvocations.length) * 100
    : 0;

  return {
    roleDailySpendCents,
    roleDailyPremiumRuns,
    globalDailySpendCents,
    taskFamilyDailySpendCents,
    sameTaskRerunsThisHour,
    globalDailyPremiumPercent,
  };
}

