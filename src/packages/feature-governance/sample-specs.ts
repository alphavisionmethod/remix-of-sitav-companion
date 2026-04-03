// ═══════════════════════════════════════════════════════════════
// SITA OS — Sample Feature Specifications
// Canonical specs for 3 core domain features demonstrating the
// full Owner Boundary + Intake + Spec + Capability + Schema
// protocol in action
// ═══════════════════════════════════════════════════════════════

import type { FeatureSpec } from "./spec-template";
import type { FeatureIntake } from "./intake";
import type { OwnerBoundaryDeclaration } from "./ownership";
import type { CapabilityRegistration } from "./capability-protocol";
import type { FeatureSchemaRegistry } from "./contract-schema-protocol";

// ── Shared new-section helpers ──────────────────────────────

const CASH_PROJECTION_MEMORY_GRAPH = {
  memoryWrites: ["last-projection-timestamp", "projection-confidence-level"],
  memoryReads: ["account-balances-snapshot", "bill-schedule-snapshot", "receivables-snapshot"],
  graphMutations: [],
  visibilityBoundaries: ["user-scope-only"],
  correctionPaths: ["re-run-projection-with-corrected-inputs"],
  forgetPaths: ["clear-cached-projections"],
} as const;

const CASH_PROJECTION_OBSERVABILITY = {
  logs: ["projection-service.compute", "projection-service.cache-hit", "projection-service.stale-detected"],
  metrics: ["projection.compute.duration_ms", "projection.compute.count", "projection.stale.count"],
  traces: ["projection-computation-trace"],
  replayPath: "Re-run projection computation with same input snapshot via projection-run-id",
  incidentSummaryBehavior: "Show last successful projection age, current input staleness, and connector sync status",
  operatorRunbookLinks: ["runbooks/finance/projection-stale", "runbooks/finance/connector-sync-failure"],
} as const;

const CASH_PROJECTION_TESTING = {
  unitTests: ["projection-engine.test.ts", "cash-timing-calculator.test.ts"],
  contractTests: ["CashProjectionRequest-schema.test.ts", "CashProjectionResult-schema.test.ts"],
  integrationTests: ["projection-with-bank-feed.test.ts"],
  replayTests: ["projection-replay-determinism.test.ts"],
  degradedModeTests: ["projection-stale-connector.test.ts", "projection-partial-data.test.ts"],
  securityTests: ["projection-user-isolation.test.ts"],
  goldenTraceTests: ["projection-golden-trace.test.ts"],
} as const;

const CASH_PROJECTION_ROLLOUT_RECOVERY = {
  featureFlags: ["finance.cash-projection.enabled", "finance.cash-projection.v2-model"],
  rolloutRings: ["internal", "beta-users", "all-finance-users"],
  shadowSimProgression: ["shadow-compare-with-manual-calculations"],
  rollbackSteps: ["disable-feature-flag", "revert-to-last-good-projection-cache"],
  killSwitch: "finance.cash-projection.kill",
  launchCriteria: ["projection-accuracy-within-5-percent", "p99-latency-under-3s", "no-data-leakage-in-security-review"],
} as const;

const CASH_PROJECTION_GENERATED_TRUTH = {
  capabilityIndex: true,
  routeManifest: true,
  serviceManifest: true,
  eventSubjectManifest: true,
  connectorCatalog: true,
  boardroomTemplateIndex: true,
  featureIntegrationIndex: true,
  formulaRegistry: false,
  promptRegistry: false,
} as const;

const LEAD_SCORING_MEMORY_GRAPH = {
  memoryWrites: ["lead-last-scored-at", "lead-scoring-model-version"],
  memoryReads: ["lead-engagement-history", "customer-conversion-patterns"],
  graphMutations: [],
  visibilityBoundaries: ["user-scope-only"],
  correctionPaths: ["rescore-with-updated-model"],
  forgetPaths: ["clear-lead-score-cache"],
} as const;

const LEAD_SCORING_OBSERVABILITY = {
  logs: ["lead-scoring.score-computed", "lead-scoring.stale-detected", "lead-scoring.model-applied"],
  metrics: ["lead-scoring.score.duration_ms", "lead-scoring.score.count", "lead-scoring.stale-risk.count"],
  traces: ["lead-scoring-trace"],
  replayPath: "Re-run scoring model against stored lead snapshot via scoring-run-id",
  incidentSummaryBehavior: "Show last scoring run timestamp, model version, and connector freshness",
  operatorRunbookLinks: ["runbooks/business/lead-scoring-drift", "runbooks/business/crm-sync-failure"],
} as const;

const LEAD_SCORING_TESTING = {
  unitTests: ["lead-scoring-model.test.ts", "stale-lead-detection.test.ts"],
  contractTests: ["LeadScoreRequest-schema.test.ts", "LeadScoreResult-schema.test.ts"],
  integrationTests: ["lead-scoring-with-crm.test.ts"],
  replayTests: ["lead-scoring-replay-determinism.test.ts"],
  degradedModeTests: ["lead-scoring-no-engagement-data.test.ts"],
  securityTests: ["lead-scoring-user-isolation.test.ts"],
  goldenTraceTests: [],
} as const;

const LEAD_SCORING_ROLLOUT_RECOVERY = {
  featureFlags: ["business.lead-scoring.enabled"],
  rolloutRings: ["internal", "beta-businesses", "all-businesses"],
  shadowSimProgression: [],
  rollbackSteps: ["disable-feature-flag", "revert-to-unsorted-leads"],
  killSwitch: "business.lead-scoring.kill",
  launchCriteria: ["scoring-model-validated", "no-false-high-scores-in-beta", "p99-latency-under-500ms"],
} as const;

const LEAD_SCORING_GENERATED_TRUTH = {
  capabilityIndex: true,
  routeManifest: true,
  serviceManifest: true,
  eventSubjectManifest: true,
  connectorCatalog: true,
  boardroomTemplateIndex: true,
  featureIntegrationIndex: true,
  formulaRegistry: false,
  promptRegistry: false,
} as const;

const HOUSEHOLD_TASKS_MEMORY_GRAPH = {
  memoryWrites: ["task-completion-history", "recurrence-patterns", "family-member-preferences"],
  memoryReads: ["household-member-list", "task-templates", "calendar-availability"],
  graphMutations: ["household-member-task-assignment-edge"],
  visibilityBoundaries: ["household-scope"],
  correctionPaths: ["undo-task-completion", "reassign-task"],
  forgetPaths: ["archive-completed-tasks-older-than-90-days"],
} as const;

const HOUSEHOLD_TASKS_OBSERVABILITY = {
  logs: ["household-ops.task-created", "household-ops.task-completed", "household-ops.recurrence-scheduled"],
  metrics: ["household.tasks.created.count", "household.tasks.completed.count", "household.tasks.overdue.count"],
  traces: ["task-lifecycle-trace"],
  replayPath: "Replay task CRUD operations from audit log via task-id",
  incidentSummaryBehavior: "Show task count, overdue count, calendar sync status, and last successful sync timestamp",
  operatorRunbookLinks: ["runbooks/concierge/calendar-sync-failure", "runbooks/concierge/task-recurrence-bug"],
} as const;

const HOUSEHOLD_TASKS_TESTING = {
  unitTests: ["task-recurrence-engine.test.ts", "task-assignment.test.ts", "smart-schedule.test.ts"],
  contractTests: ["CreateTaskRequest-schema.test.ts", "HouseholdTask-schema.test.ts"],
  integrationTests: ["task-with-calendar-sync.test.ts"],
  replayTests: ["task-crud-replay.test.ts"],
  degradedModeTests: ["task-without-calendar.test.ts"],
  securityTests: ["task-household-isolation.test.ts"],
  goldenTraceTests: [],
} as const;

const HOUSEHOLD_TASKS_ROLLOUT_RECOVERY = {
  featureFlags: ["concierge.household-tasks.enabled"],
  rolloutRings: ["internal", "beta-families", "all-concierge-users"],
  shadowSimProgression: [],
  rollbackSteps: ["disable-feature-flag", "pause-recurrence-engine"],
  killSwitch: "concierge.household-tasks.kill",
  launchCriteria: ["calendar-sync-stable", "recurrence-engine-validated", "no-duplicate-tasks-in-beta"],
} as const;

const HOUSEHOLD_TASKS_GENERATED_TRUTH = {
  capabilityIndex: true,
  routeManifest: true,
  serviceManifest: true,
  eventSubjectManifest: true,
  connectorCatalog: true,
  boardroomTemplateIndex: false,
  featureIntegrationIndex: true,
  formulaRegistry: false,
  promptRegistry: false,
} as const;

// ═══════════════════════════════════════════════════════════════
// 1. CASH PROJECTION (Finance Domain)
// ═══════════════════════════════════════════════════════════════

export const CASH_PROJECTION_OWNERSHIP: OwnerBoundaryDeclaration = {
  featureId: "finance.cash-projection",
  primaryOwner: "finance-os",
  boundaryType: "domain-module",
  justification: "Cash projection is a core finance domain capability that computes forward-looking cash positions from bills, receivables, and reserves.",
  whyNotElsewhere: "Not a surface concern (no UI logic), not shared (finance-specific semantics), not governance (no policy decisions), not a worker (synchronous computation).",
  ownerPreference: "extend-existing",
  secondaryOwners: ["projection-service"],
  touchesTrustBearing: false,
  extendsExisting: true,
  existingOwnerExtended: "finance-os",
};

export const CASH_PROJECTION_INTAKE: FeatureIntake = {
  featureId: "finance.cash-projection",
  featureName: "Cash Flow Projection Engine",
  riskTier: "R0",
  outcome: {
    userOutcome: "Owner sees a 30/60/90-day cash flow forecast so they can plan spending and avoid shortfalls.",
    problemSolved: "No visibility into future cash position across bills, receivables, and reserve contributions.",
    criticalityClass: "wedge-critical",
    breakIfNotBuilt: "Users cannot anticipate cash crunches, leading to missed payments and emergency borrowing.",
  },
  architecture: {
    primaryOwner: "finance-os",
    extendsExistingService: true,
    existingServiceExtended: "projection-service",
    touchesTrustBearing: false,
    requiresNewContracts: true,
    newContractDescriptions: ["CashProjectionRequest", "CashProjectionResult"],
    requiresNewWorkflowStates: false,
    requiresConnectors: true,
    connectorIds: ["bank-feed", "accounting-sync"],
    requiresGeneratedTruth: true,
    generatedTruthEntries: ["projection-models"],
  },
  governance: {
    policyApplied: "read-only-projection",
    approvalBehavior: "none",
    simulationRequired: false,
    refusalSemanticsRequired: false,
    autonomyTierAtLaunch: "observe",
  },
  supportability: {
    diagnosisPath: "Projection service logs + projection-event trace via correlation ID. Check stale connector data if projections look wrong.",
    correlationIds: ["projection-run-id", "connector-sync-id"],
    replayable: true,
    replayMechanism: "Re-run projection computation with same input snapshot.",
    rollbackPath: "Projections are read-only computations — no rollback needed. Re-run with fresh data.",
    partialFailureUX: "Show last-known-good projection with staleness badge if connector data is stale.",
  },
  rollout: {
    environmentProgression: "staging-canary-production",
    requiresFeatureFlags: true,
    featureFlagIds: ["finance.cash-projection.enabled"],
    requiresShadowMode: true,
    shadowModeDescription: "Run projection engine in shadow against live data, compare with manual calculations.",
    killSwitchId: "finance.cash-projection.kill",
    productionMonitorOwner: "finance-os",
  },
  submittedAt: Date.now(),
  submittedBy: "eng-finance",
};

export const CASH_PROJECTION_SPEC: FeatureSpec = {
  header: {
    featureId: "finance.cash-projection",
    title: "Cash Flow Projection Engine",
    status: "beta",
    owner: "finance-os",
    productOwner: "product-finance",
    engineeringOwner: "eng-finance",
    supportOwner: "support-money",
    rolloutStage: "canary",
    wedgePriority: 2,
  },
  outcome: {
    userProblem: "Business owners cannot see future cash positions, leading to surprise shortfalls and reactive financial management.",
    expectedValue: "30/60/90-day forward cash visibility with confidence bands, enabling proactive cash management.",
    whyNow: "Core wedge differentiator — users expect cash forecasting from day one of a financial OS.",
    nonGoals: ["Tax projection", "Investment return forecasting", "Multi-currency arbitrage"],
  },
  capabilityMap: {
    readOnly: ["finance.bills.list", "finance.receivables.list", "finance.reserves.list", "finance.accounts.balances"],
    sideEffecting: [],
    supporting: ["finance.projections.compute", "finance.projections.cache"],
    advisorInvolvement: "recommend",
  },
  ownerMap: {
    primary: "finance-os",
    secondary: ["projection-service"],
    integrations: ["bank-feed-connector", "accounting-sync-connector"],
    packages: ["finance-contracts", "proof-model"],
    generatedTruth: ["projection-models"],
  },
  surfaceMap: {
    web: ["MoneyOverview", "CashTiming"],
    mobile: ["money-summary-widget"],
    admin: ["projection-diagnostics"],
    notifications: ["cash-shortfall-alert", "projection-stale-warning"],
    boardroomVisibility: true,
  },
  contracts: {
    requestSchemas: ["CashProjectionRequest"],
    responseSchemas: ["CashProjectionResult", "CashProjectionTimeSeries"],
    eventSchemas: ["projection.computed.v1", "projection.stale.v1"],
    receiptSchemas: ["projection-computation-receipt"],
    diagnosticSchemas: ["projection-diagnostic-bundle"],
    featureFlagSchemas: ["finance.cash-projection.enabled"],
  },
  workflowModel: {
    family: "projection",
    states: ["idle", "computing", "computed", "stale", "error"],
    transitions: [
      { from: "idle", to: "computing", trigger: "projection-requested" },
      { from: "computing", to: "computed", trigger: "computation-complete" },
      { from: "computed", to: "stale", trigger: "data-source-updated" },
      { from: "stale", to: "computing", trigger: "recompute-triggered" },
      { from: "computing", to: "error", trigger: "computation-failed" },
      { from: "error", to: "computing", trigger: "retry-triggered" },
    ],
    timeoutRules: [{ state: "computing", maxDurationMs: 30_000, escalation: "timeout-alert" }],
    retryRules: [{ state: "computing", maxRetries: 3, backoffMs: 2_000 }],
    compensation: [{ step: "computation", rollbackAction: "revert-to-last-good-projection" }],
    replayBehavior: "full",
  },
  policyModel: {
    riskTier: "R0",
    autonomyTier: "observe",
    policyRules: ["read-only-projection"],
    approvalRequirements: [],
    refusalConditions: ["all-data-sources-expired"],
    downgradeConditions: [],
    simulationRequirements: [],
  },
  executionModel: {
    canonicalPath: ["gather-sources", "validate-freshness", "compute-projection", "cache-result", "emit-event"],
    connectors: ["bank-feed", "accounting-sync"],
    idempotencyStrategy: "natural-key",
    postconditionVerification: ["projection-has-30-day-minimum", "no-negative-confidence"],
    receiptEmission: ["projection-computation-receipt"],
    eventEmission: ["projection.computed.v1"],
  },
  memoryGraphEffects: CASH_PROJECTION_MEMORY_GRAPH,
  observabilityModel: CASH_PROJECTION_OBSERVABILITY,
  testingModel: CASH_PROJECTION_TESTING,
  rolloutRecoveryModel: CASH_PROJECTION_ROLLOUT_RECOVERY,
  generatedTruthUpdates: CASH_PROJECTION_GENERATED_TRUTH,
};

// ═══════════════════════════════════════════════════════════════
// 2. LEAD SCORING (Business Domain)
// ═══════════════════════════════════════════════════════════════

export const LEAD_SCORING_OWNERSHIP: OwnerBoundaryDeclaration = {
  featureId: "business.lead-scoring",
  primaryOwner: "business-os",
  boundaryType: "domain-module",
  justification: "Lead scoring is a core business domain capability that ranks and prioritizes inbound leads based on engagement signals.",
  whyNotElsewhere: "Not a surface concern (scoring logic, not UI). Not shared (business-specific semantics). Not concierge or finance domain.",
  ownerPreference: "extend-existing",
  secondaryOwners: ["lead-scoring.service"],
  touchesTrustBearing: false,
  extendsExisting: true,
  existingOwnerExtended: "business-os",
};

export const LEAD_SCORING_INTAKE: FeatureIntake = {
  featureId: "business.lead-scoring",
  featureName: "AI Lead Scoring Engine",
  riskTier: "R1",
  outcome: {
    userOutcome: "Business owner sees leads ranked by opportunity score so they focus on highest-value prospects first.",
    problemSolved: "Leads arrive unranked, causing owners to waste time on low-probability prospects.",
    criticalityClass: "revenue-critical",
    breakIfNotBuilt: "Owners treat all leads equally, missing high-value opportunities and losing revenue.",
  },
  architecture: {
    primaryOwner: "business-os",
    extendsExistingService: true,
    existingServiceExtended: "lead-scoring.service",
    touchesTrustBearing: false,
    requiresNewContracts: true,
    newContractDescriptions: ["LeadScoreRequest", "LeadScoreResult", "StaleLeadState"],
    requiresNewWorkflowStates: false,
    requiresConnectors: true,
    connectorIds: ["crm-sync", "email-tracker"],
    requiresGeneratedTruth: false,
  },
  governance: {
    policyApplied: "advisor-recommend-only",
    approvalBehavior: "none",
    simulationRequired: false,
    refusalSemanticsRequired: false,
    autonomyTierAtLaunch: "recommend",
  },
  supportability: {
    diagnosisPath: "Lead scoring service logs. Check lead record + scoring factors via lead ID. Verify connector freshness.",
    correlationIds: ["lead-id", "scoring-run-id"],
    replayable: true,
    replayMechanism: "Re-run scoring model against stored lead snapshot.",
    rollbackPath: "Scores are computed values — re-score with updated model. No side effects to roll back.",
    partialFailureUX: "Show lead without score, with 'scoring pending' indicator.",
  },
  rollout: {
    environmentProgression: "local-staging-production",
    requiresFeatureFlags: true,
    featureFlagIds: ["business.lead-scoring.enabled"],
    requiresShadowMode: false,
    killSwitchId: "business.lead-scoring.kill",
    productionMonitorOwner: "business-os",
  },
  submittedAt: Date.now(),
  submittedBy: "eng-business",
};

export const LEAD_SCORING_SPEC: FeatureSpec = {
  header: {
    featureId: "business.lead-scoring",
    title: "AI Lead Scoring Engine",
    status: "ga",
    owner: "business-os",
    productOwner: "product-business",
    engineeringOwner: "eng-business",
    supportOwner: "support-business",
    rolloutStage: "full",
    wedgePriority: 3,
  },
  outcome: {
    userProblem: "Business owners receive leads with no prioritization, wasting time on low-probability prospects.",
    expectedValue: "Automatic lead ranking by opportunity score, stale-risk detection, and next-action recommendations.",
    whyNow: "Revenue-critical — directly impacts conversion rates and is a core differentiator for business OS.",
    nonGoals: ["Automated outreach", "Lead generation", "Marketing automation"],
  },
  capabilityMap: {
    readOnly: ["business.leads.list", "business.leads.get", "business.customers.list"],
    sideEffecting: ["business.leads.update-score"],
    supporting: ["business.leads.score", "business.leads.stale-check"],
    advisorInvolvement: "recommend",
  },
  ownerMap: {
    primary: "business-os",
    secondary: ["lead-scoring.service"],
    integrations: ["crm-sync-connector", "email-tracker-connector"],
    packages: ["business-contracts"],
    generatedTruth: [],
  },
  surfaceMap: {
    web: ["LeadsInbox", "OpportunitiesCenter", "BusinessOverview"],
    mobile: ["leads-priority-widget"],
    admin: ["lead-scoring-diagnostics"],
    notifications: ["high-value-lead-alert", "stale-lead-warning"],
    boardroomVisibility: true,
  },
  contracts: {
    requestSchemas: ["LeadScoreRequest"],
    responseSchemas: ["LeadScoreResult", "OpportunityRankResult"],
    eventSchemas: ["lead.scored.v1", "lead.stale-risk.v1"],
    receiptSchemas: ["lead-scoring-receipt"],
    diagnosticSchemas: ["lead-scoring-diagnostic-bundle"],
    featureFlagSchemas: ["business.lead-scoring.enabled"],
  },
  workflowModel: {
    family: "scoring",
    states: ["unscored", "scoring", "scored", "stale"],
    transitions: [
      { from: "unscored", to: "scoring", trigger: "score-requested" },
      { from: "scoring", to: "scored", trigger: "score-computed" },
      { from: "scored", to: "stale", trigger: "engagement-data-changed" },
      { from: "stale", to: "scoring", trigger: "rescore-triggered" },
    ],
    timeoutRules: [{ state: "scoring", maxDurationMs: 10_000, escalation: "scoring-timeout-alert" }],
    retryRules: [{ state: "scoring", maxRetries: 2, backoffMs: 1_000 }],
    compensation: [],
    replayBehavior: "full",
  },
  policyModel: {
    riskTier: "R1",
    autonomyTier: "recommend",
    policyRules: ["advisor-recommend-only"],
    approvalRequirements: [],
    refusalConditions: [],
    downgradeConditions: ["scoring-model-degraded"],
    simulationRequirements: [],
  },
  executionModel: {
    canonicalPath: ["fetch-lead-data", "compute-engagement-signals", "apply-scoring-model", "persist-score", "emit-event"],
    connectors: ["crm-sync", "email-tracker"],
    idempotencyStrategy: "natural-key",
    postconditionVerification: ["score-in-valid-range"],
    receiptEmission: ["lead-scoring-receipt"],
    eventEmission: ["lead.scored.v1"],
  },
  memoryGraphEffects: LEAD_SCORING_MEMORY_GRAPH,
  observabilityModel: LEAD_SCORING_OBSERVABILITY,
  testingModel: LEAD_SCORING_TESTING,
  rolloutRecoveryModel: LEAD_SCORING_ROLLOUT_RECOVERY,
  generatedTruthUpdates: LEAD_SCORING_GENERATED_TRUTH,
};

// ═══════════════════════════════════════════════════════════════
// 3. HOUSEHOLD TASKS (Concierge Domain)
// ═══════════════════════════════════════════════════════════════

export const HOUSEHOLD_TASKS_OWNERSHIP: OwnerBoundaryDeclaration = {
  featureId: "concierge.household-tasks",
  primaryOwner: "concierge-os",
  boundaryType: "domain-module",
  justification: "Household task management is a core concierge capability: scheduling, tracking, and delegating recurring home maintenance and family tasks.",
  whyNotElsewhere: "Not finance (no monetary transactions). Not business (personal/family context). Not shared (concierge-specific lifecycle).",
  ownerPreference: "extend-existing",
  secondaryOwners: ["household-ops.service"],
  touchesTrustBearing: false,
  extendsExisting: true,
  existingOwnerExtended: "concierge-os",
};

export const HOUSEHOLD_TASKS_INTAKE: FeatureIntake = {
  featureId: "concierge.household-tasks",
  featureName: "Household Task Management",
  riskTier: "R1",
  outcome: {
    userOutcome: "Family members see a unified task board for household maintenance, chores, and errands with smart scheduling.",
    problemSolved: "Household tasks are scattered across notes, texts, and memory — nothing is tracked or recurring.",
    criticalityClass: "retention-critical",
    breakIfNotBuilt: "Users fall back to generic to-do apps, reducing stickiness of the concierge OS.",
  },
  architecture: {
    primaryOwner: "concierge-os",
    extendsExistingService: true,
    existingServiceExtended: "household-ops.service",
    touchesTrustBearing: false,
    requiresNewContracts: true,
    newContractDescriptions: ["HouseholdTask", "TaskRecurrence", "TaskAssignment"],
    requiresNewWorkflowStates: false,
    requiresConnectors: true,
    connectorIds: ["calendar-sync", "reminder-service"],
    requiresGeneratedTruth: false,
  },
  governance: {
    policyApplied: "low-risk-concierge",
    approvalBehavior: "none",
    simulationRequired: false,
    refusalSemanticsRequired: false,
    autonomyTierAtLaunch: "draft",
  },
  supportability: {
    diagnosisPath: "Task service logs. Check task record via task ID. Verify calendar connector sync status.",
    correlationIds: ["task-id", "household-id"],
    replayable: true,
    replayMechanism: "Replay task CRUD operations from audit log.",
    rollbackPath: "Tasks are CRUD — undo by restoring previous task state from audit log.",
    partialFailureUX: "Show task list with sync-pending badge if calendar connector is down.",
  },
  rollout: {
    environmentProgression: "local-staging-production",
    requiresFeatureFlags: true,
    featureFlagIds: ["concierge.household-tasks.enabled"],
    requiresShadowMode: false,
    killSwitchId: "concierge.household-tasks.kill",
    productionMonitorOwner: "concierge-os",
  },
  submittedAt: Date.now(),
  submittedBy: "eng-concierge",
};

export const HOUSEHOLD_TASKS_SPEC: FeatureSpec = {
  header: {
    featureId: "concierge.household-tasks",
    title: "Household Task Management",
    status: "ga",
    owner: "concierge-os",
    productOwner: "product-concierge",
    engineeringOwner: "eng-concierge",
    supportOwner: "support-concierge",
    rolloutStage: "full",
    wedgePriority: 4,
  },
  outcome: {
    userProblem: "Household tasks are untracked, leading to missed maintenance, forgotten chores, and family friction.",
    expectedValue: "Unified task board with recurring schedules, family assignment, and smart reminders.",
    whyNow: "Retention-critical — household management is the daily-use hook that keeps families on the platform.",
    nonGoals: ["Home renovation project management", "Smart home device control", "Inventory tracking"],
  },
  capabilityMap: {
    readOnly: ["concierge.tasks.list", "concierge.tasks.get", "concierge.household.members"],
    sideEffecting: ["concierge.tasks.create", "concierge.tasks.update", "concierge.tasks.complete", "concierge.tasks.assign"],
    supporting: ["concierge.tasks.recurrence-engine", "concierge.tasks.smart-schedule"],
    advisorInvolvement: "draft",
  },
  ownerMap: {
    primary: "concierge-os",
    secondary: ["household-ops.service"],
    integrations: ["calendar-sync-connector", "reminder-service-connector"],
    packages: ["concierge-contracts"],
    generatedTruth: [],
  },
  surfaceMap: {
    web: ["HouseholdTasks", "ConciergeOverview", "FamilyCalendar"],
    mobile: ["household-tasks-widget", "daily-chores-card"],
    admin: ["task-diagnostics"],
    notifications: ["task-due-reminder", "task-overdue-alert", "task-assigned-notification"],
    boardroomVisibility: false,
  },
  contracts: {
    requestSchemas: ["CreateTaskRequest", "UpdateTaskRequest", "AssignTaskRequest"],
    responseSchemas: ["HouseholdTask", "TaskList"],
    eventSchemas: ["task.created.v1", "task.completed.v1", "task.overdue.v1"],
    receiptSchemas: ["task-action-receipt"],
    diagnosticSchemas: ["task-diagnostic-bundle"],
    featureFlagSchemas: ["concierge.household-tasks.enabled"],
  },
  workflowModel: {
    family: "task-lifecycle",
    states: ["created", "assigned", "in-progress", "completed", "overdue", "cancelled"],
    transitions: [
      { from: "created", to: "assigned", trigger: "task-assigned" },
      { from: "assigned", to: "in-progress", trigger: "task-started" },
      { from: "in-progress", to: "completed", trigger: "task-completed" },
      { from: "created", to: "overdue", trigger: "due-date-passed" },
      { from: "assigned", to: "overdue", trigger: "due-date-passed" },
      { from: "in-progress", to: "overdue", trigger: "due-date-passed" },
      { from: "created", to: "cancelled", trigger: "task-cancelled" },
      { from: "assigned", to: "cancelled", trigger: "task-cancelled" },
    ],
    timeoutRules: [{ state: "assigned", maxDurationMs: 86_400_000, escalation: "task-unstarted-reminder" }],
    retryRules: [],
    compensation: [{ step: "task-completion", rollbackAction: "reopen-task" }],
    replayBehavior: "partial",
  },
  policyModel: {
    riskTier: "R1",
    autonomyTier: "draft",
    policyRules: ["low-risk-concierge"],
    approvalRequirements: [],
    refusalConditions: [],
    downgradeConditions: [],
    simulationRequirements: [],
  },
  executionModel: {
    canonicalPath: ["validate-task", "persist-task", "schedule-recurrence", "sync-calendar", "emit-event"],
    connectors: ["calendar-sync", "reminder-service"],
    idempotencyStrategy: "idempotency-key",
    postconditionVerification: ["task-persisted", "calendar-event-created"],
    receiptEmission: ["task-action-receipt"],
    eventEmission: ["task.created.v1", "task.completed.v1"],
  },
  memoryGraphEffects: HOUSEHOLD_TASKS_MEMORY_GRAPH,
  observabilityModel: HOUSEHOLD_TASKS_OBSERVABILITY,
  testingModel: HOUSEHOLD_TASKS_TESTING,
  rolloutRecoveryModel: HOUSEHOLD_TASKS_ROLLOUT_RECOVERY,
  generatedTruthUpdates: HOUSEHOLD_TASKS_GENERATED_TRUTH,
};

// ═══════════════════════════════════════════════════════════════
// CAPABILITY REGISTRATIONS (Section 7)
// ═══════════════════════════════════════════════════════════════

// ── Cash Projection Capabilities ────────────────────────────

export const CASH_PROJECTION_CAPABILITIES: CapabilityRegistration[] = [
  {
    capabilityId: "finance.cash-projection.observe",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "observe",
    requiredScopes: ["finance.accounts.read", "finance.bills.read", "finance.receivables.read"],
    requiredPolicyFamilies: ["read-only-projection"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: ["projection.observed.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "finance.cash-projection.compute",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "projection-build",
    requiredScopes: ["finance.accounts.read", "finance.bills.read", "finance.receivables.read", "finance.reserves.read"],
    requiredPolicyFamilies: ["read-only-projection", "deterministic-computation"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["projection.computed.v1", "projection.stale.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox", "sim"],
    entitlementDependency: "finance.projections",
  },
  {
    capabilityId: "finance.cash-projection.summarize",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "summarize",
    requiredScopes: ["finance.projections.read"],
    requiredPolicyFamilies: ["read-only-projection"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: [],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "finance.cash-projection.boardroom-compose",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "boardroom-compose",
    requiredScopes: ["finance.projections.read", "boardroom.packets.write"],
    requiredPolicyFamilies: ["read-only-projection", "boardroom-assembly"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["boardroom.packet.assembled.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: "boardroom.access",
  },
  {
    capabilityId: "finance.cash-projection.diagnose",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "support-diagnose",
    requiredScopes: ["finance.projections.read", "finance.connectors.status"],
    requiredPolicyFamilies: ["diagnostics-safe"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: ["diagnostics.bundle.generated.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake"],
    entitlementDependency: null,
  },
];

// ── Lead Scoring Capabilities ───────────────────────────────

export const LEAD_SCORING_CAPABILITIES: CapabilityRegistration[] = [
  {
    capabilityId: "business.lead-scoring.observe",
    ownerService: "business-os",
    featureId: "business.lead-scoring",
    riskTier: "R1",
    autonomyTier: "observe",
    capabilityClass: "observe",
    requiredScopes: ["business.leads.read", "business.customers.read"],
    requiredPolicyFamilies: ["advisor-recommend-only"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: [],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "business.lead-scoring.classify",
    ownerService: "business-os",
    featureId: "business.lead-scoring",
    riskTier: "R1",
    autonomyTier: "recommend",
    capabilityClass: "classify",
    requiredScopes: ["business.leads.read", "business.engagement.read"],
    requiredPolicyFamilies: ["advisor-recommend-only", "scoring-model-validation"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["lead.scored.v1", "lead.stale-risk.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox", "sim"],
    entitlementDependency: "business.lead-scoring",
  },
  {
    capabilityId: "business.lead-scoring.recommend",
    ownerService: "business-os",
    featureId: "business.lead-scoring",
    riskTier: "R1",
    autonomyTier: "recommend",
    capabilityClass: "recommend",
    requiredScopes: ["business.leads.read", "business.leads.update-score"],
    requiredPolicyFamilies: ["advisor-recommend-only"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["lead.recommendation.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "business.lead-scoring.notify",
    ownerService: "business-os",
    featureId: "business.lead-scoring",
    riskTier: "R1",
    autonomyTier: "recommend",
    capabilityClass: "notify",
    requiredScopes: ["business.leads.read", "notifications.send"],
    requiredPolicyFamilies: ["notification-policy"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["notification.sent.v1"],
    replayabilityClass: "partial",
    sandboxSupport: ["fake"],
    entitlementDependency: null,
  },
  {
    capabilityId: "business.lead-scoring.diagnose",
    ownerService: "business-os",
    featureId: "business.lead-scoring",
    riskTier: "R1",
    autonomyTier: "observe",
    capabilityClass: "support-diagnose",
    requiredScopes: ["business.leads.read", "business.scoring.logs"],
    requiredPolicyFamilies: ["diagnostics-safe"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: [],
    replayabilityClass: "full",
    sandboxSupport: ["fake"],
    entitlementDependency: null,
  },
];

// ── Household Tasks Capabilities ────────────────────────────

export const HOUSEHOLD_TASKS_CAPABILITIES: CapabilityRegistration[] = [
  {
    capabilityId: "concierge.household-tasks.observe",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "observe",
    capabilityClass: "observe",
    requiredScopes: ["concierge.tasks.read", "concierge.household.read"],
    requiredPolicyFamilies: ["low-risk-concierge"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: [],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "concierge.household-tasks.draft",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "draft",
    capabilityClass: "draft",
    requiredScopes: ["concierge.tasks.read", "concierge.tasks.write", "concierge.household.read"],
    requiredPolicyFamilies: ["low-risk-concierge", "task-lifecycle"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["task.created.v1", "task.assigned.v1"],
    replayabilityClass: "partial",
    sandboxSupport: ["fake", "sandbox", "sim"],
    entitlementDependency: "concierge.household",
  },
  {
    capabilityId: "concierge.household-tasks.execute",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "draft",
    capabilityClass: "execute",
    requiredScopes: ["concierge.tasks.write", "concierge.calendar.sync"],
    requiredPolicyFamilies: ["low-risk-concierge", "task-lifecycle", "calendar-sync"],
    requiredApprovalType: "none",
    receiptRequirement: "always",
    eventSubjectsEmitted: ["task.completed.v1", "task.overdue.v1"],
    replayabilityClass: "partial",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: "concierge.household",
  },
  {
    capabilityId: "concierge.household-tasks.verify",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "observe",
    capabilityClass: "verify",
    requiredScopes: ["concierge.tasks.read", "concierge.calendar.read"],
    requiredPolicyFamilies: ["low-risk-concierge"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["task.verification.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox"],
    entitlementDependency: null,
  },
  {
    capabilityId: "concierge.household-tasks.notify",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "draft",
    capabilityClass: "notify",
    requiredScopes: ["concierge.tasks.read", "notifications.send"],
    requiredPolicyFamilies: ["notification-policy"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["notification.sent.v1"],
    replayabilityClass: "partial",
    sandboxSupport: ["fake"],
    entitlementDependency: null,
  },
  {
    capabilityId: "concierge.household-tasks.diagnose",
    ownerService: "concierge-os",
    featureId: "concierge.household-tasks",
    riskTier: "R1",
    autonomyTier: "observe",
    capabilityClass: "support-diagnose",
    requiredScopes: ["concierge.tasks.read", "concierge.calendar.status"],
    requiredPolicyFamilies: ["diagnostics-safe"],
    requiredApprovalType: "none",
    receiptRequirement: "never",
    eventSubjectsEmitted: [],
    replayabilityClass: "full",
    sandboxSupport: ["fake"],
    entitlementDependency: null,
  },
];

// ═══════════════════════════════════════════════════════════════
// SCHEMA REGISTRATIONS (Section 8)
// ═══════════════════════════════════════════════════════════════

const v1Additive = {
  version: "1.0.0",
  compatibility: "additive" as const,
  migrationWindow: null,
  deprecationWarning: null,
  replayCompatible: true,
  projectionRebuildCompatible: true,
};

// ── Cash Projection Schema Registry ─────────────────────────

export const CASH_PROJECTION_SCHEMA_REGISTRY: FeatureSchemaRegistry = {
  featureId: "finance.cash-projection",
  schemas: [
    { family: "input", schemaId: "CashProjectionRequest", versions: [v1Additive] },
    { family: "output", schemaId: "CashProjectionResult", versions: [v1Additive] },
    {
      family: "output",
      schemaId: "CashProjectionTimeSeries",
      versions: [v1Additive, {
        version: "2.0.0",
        compatibility: "breaking",
        migrationWindow: "30 days",
        deprecationWarning: "v1 time series format deprecated — switch to bucketed format",
        replayCompatible: true,
        projectionRebuildCompatible: true,
      }],
    },
    { family: "event", schemaId: "projection.computed.v1", versions: [v1Additive] },
    { family: "event", schemaId: "projection.stale.v1", versions: [v1Additive] },
    { family: "receipt", schemaId: "projection-computation-receipt", versions: [v1Additive] },
    { family: "diagnostic", schemaId: "projection-diagnostic-bundle", versions: [v1Additive] },
    { family: "feature-flag", schemaId: "finance.cash-projection.enabled", versions: [v1Additive] },
  ],
};

// ── Lead Scoring Schema Registry ────────────────────────────

export const LEAD_SCORING_SCHEMA_REGISTRY: FeatureSchemaRegistry = {
  featureId: "business.lead-scoring",
  schemas: [
    { family: "input", schemaId: "LeadScoreRequest", versions: [v1Additive] },
    { family: "output", schemaId: "LeadScoreResult", versions: [v1Additive] },
    { family: "output", schemaId: "OpportunityRankResult", versions: [v1Additive] },
    { family: "output", schemaId: "StaleLeadState", versions: [v1Additive] },
    { family: "event", schemaId: "lead.scored.v1", versions: [v1Additive] },
    { family: "event", schemaId: "lead.stale-risk.v1", versions: [v1Additive] },
    { family: "receipt", schemaId: "lead-scoring-receipt", versions: [v1Additive] },
    { family: "diagnostic", schemaId: "lead-scoring-diagnostic-bundle", versions: [v1Additive] },
    { family: "feature-flag", schemaId: "business.lead-scoring.enabled", versions: [v1Additive] },
  ],
};

// ── Household Tasks Schema Registry ─────────────────────────

export const HOUSEHOLD_TASKS_SCHEMA_REGISTRY: FeatureSchemaRegistry = {
  featureId: "concierge.household-tasks",
  schemas: [
    { family: "input", schemaId: "CreateTaskRequest", versions: [v1Additive] },
    { family: "input", schemaId: "UpdateTaskRequest", versions: [v1Additive] },
    { family: "input", schemaId: "AssignTaskRequest", versions: [v1Additive] },
    { family: "output", schemaId: "HouseholdTask", versions: [v1Additive] },
    { family: "output", schemaId: "TaskList", versions: [v1Additive] },
    { family: "event", schemaId: "task.created.v1", versions: [v1Additive] },
    { family: "event", schemaId: "task.completed.v1", versions: [v1Additive] },
    { family: "event", schemaId: "task.overdue.v1", versions: [v1Additive] },
    { family: "receipt", schemaId: "task-action-receipt", versions: [v1Additive] },
    { family: "diagnostic", schemaId: "task-diagnostic-bundle", versions: [v1Additive] },
    { family: "feature-flag", schemaId: "concierge.household-tasks.enabled", versions: [v1Additive] },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Registry of all sample specs, capabilities, and schemas
// ═══════════════════════════════════════════════════════════════

export const SAMPLE_SPECS = [CASH_PROJECTION_SPEC, LEAD_SCORING_SPEC, HOUSEHOLD_TASKS_SPEC] as const;
export const SAMPLE_OWNERSHIP_DECLARATIONS = [CASH_PROJECTION_OWNERSHIP, LEAD_SCORING_OWNERSHIP, HOUSEHOLD_TASKS_OWNERSHIP] as const;
export const SAMPLE_INTAKES = [CASH_PROJECTION_INTAKE, LEAD_SCORING_INTAKE, HOUSEHOLD_TASKS_INTAKE] as const;
export const SAMPLE_CAPABILITIES = [
  ...CASH_PROJECTION_CAPABILITIES,
  ...LEAD_SCORING_CAPABILITIES,
  ...HOUSEHOLD_TASKS_CAPABILITIES,
] as const;
export const SAMPLE_SCHEMA_REGISTRIES = [
  CASH_PROJECTION_SCHEMA_REGISTRY,
  LEAD_SCORING_SCHEMA_REGISTRY,
  HOUSEHOLD_TASKS_SCHEMA_REGISTRY,
] as const;
