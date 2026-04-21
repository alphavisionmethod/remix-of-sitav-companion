// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Simulation Policy (Wave 21)
// Canonical simulation scenario registry for recovery drills.
// ═══════════════════════════════════════════════════════════════

export interface SimulationScenario {
  readonly scenarioId: string;
  readonly label: string;
  readonly description: string;
  readonly runbookIds: readonly string[];
  readonly systemsExercised: readonly string[];
  readonly requiredAssertions: readonly string[];
  readonly frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
}

export const SIMULATION_SCENARIOS: readonly SimulationScenario[] = [
  {
    scenarioId: "SIM-001", label: "AI Provider Total Outage",
    description: "All AI providers simultaneously unavailable",
    runbookIds: ["RB-002", "RB-010"], systemsExercised: ["ai-providers", "ai-degradation"],
    requiredAssertions: ["Fallback chain activates", "Kill-switch arms gracefully", "Cached outputs served"],
    frequency: "weekly",
  },
  {
    scenarioId: "SIM-002", label: "Database Degradation",
    description: "Primary DB read/write latency exceeds 5s",
    runbookIds: ["RB-014"], systemsExercised: ["db"],
    requiredAssertions: ["Read replicas absorb load", "Write queue buffers", "Restore procedure documented"],
    frequency: "biweekly",
  },
  {
    scenarioId: "SIM-003", label: "Kill-Switch Cascade",
    description: "Multiple kill-switches activated simultaneously",
    runbookIds: ["RB-002", "RB-004", "RB-009"], systemsExercised: ["ai-providers", "workflow", "release"],
    requiredAssertions: ["Kill-switches arm independently", "No cascading failures", "Operator notified"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-004", label: "Shell/Runtime Failure",
    description: "Electron shell crash loop on desktop",
    runbookIds: ["RB-008", "RB-016"], systemsExercised: ["desktop-host"],
    requiredAssertions: ["Recovery shell activates", "Safe-mode available", "Support bundle generatable"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-005", label: "Stuck Workflow Recovery",
    description: "Critical workflow stuck in executing state for 30+ min",
    runbookIds: ["RB-004"], systemsExercised: ["workflow"],
    requiredAssertions: ["Workflow identified", "Replay available", "Kill-switch arms if needed"],
    frequency: "biweekly",
  },
  {
    scenarioId: "SIM-006", label: "Connector Token Expiry",
    description: "All OAuth tokens for a major provider expire simultaneously",
    runbookIds: ["RB-011"], systemsExercised: ["connectors", "sync"],
    requiredAssertions: ["Token refresh attempted", "Sync paused gracefully", "User notified"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-007", label: "Release Rollback",
    description: "Bad deploy requires immediate rollback to previous version",
    runbookIds: ["RB-009"], systemsExercised: ["release"],
    requiredAssertions: ["Rollback completes under 5 min", "No data loss", "Users seamless"],
    frequency: "biweekly",
  },
  {
    scenarioId: "SIM-008", label: "Config Corruption Recovery",
    description: "Critical configuration file corrupted after deploy",
    runbookIds: ["RB-012"], systemsExercised: ["setup"],
    requiredAssertions: ["Checkpoint restored", "Setup wizard re-enters correctly", "No user data loss"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-009", label: "Support Pipeline Degradation",
    description: "Support bundle generation and escalation path degraded",
    runbookIds: ["RB-019"], systemsExercised: ["support-escalation"],
    requiredAssertions: ["Fallback escalation available", "Manual bundle possible", "Operator alerted"],
    frequency: "quarterly",
  },
  {
    scenarioId: "SIM-010", label: "Auth Outage",
    description: "Complete authentication service outage",
    runbookIds: ["RB-001"], systemsExercised: ["auth"],
    requiredAssertions: ["Cached sessions continue", "Offline mode activates", "Restoration monitored"],
    frequency: "weekly",
  },
  {
    scenarioId: "SIM-011", label: "RLS Policy Breach",
    description: "Row-level security misconfiguration detected",
    runbookIds: ["RB-015"], systemsExercised: ["rls"],
    requiredAssertions: ["Breach contained", "Affected queries identified", "Policy corrected"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-012", label: "Ingress Failure",
    description: "Edge/ingress routing completely unavailable",
    runbookIds: ["RB-001"], systemsExercised: ["ingress", "auth"],
    requiredAssertions: ["Failover ingress activates", "Health check detects", "Traffic re-routes"],
    frequency: "monthly",
  },
  {
    scenarioId: "SIM-013", label: "Payment Auth Gateway Failure",
    description: "Payment gateway 3DS/SCA flow failing",
    runbookIds: ["RB-005"], systemsExercised: ["payments-auth", "proof"],
    requiredAssertions: ["Transactions queued", "Kill-switch available", "Retry after restore"],
    frequency: "biweekly",
  },
];

export function getScenarioById(id: string): SimulationScenario | undefined {
  return SIMULATION_SCENARIOS.find((s) => s.scenarioId === id);
}

export function getScenariosForSubsystem(subsystem: string): readonly SimulationScenario[] {
  return SIMULATION_SCENARIOS.filter((s) => s.systemsExercised.includes(subsystem));
}