// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Startup Order
// Importable TypeScript constant — replaces script-only version
// Mirrors scripts/generate-startup-order.ts data
// ═══════════════════════════════════════════════════════════════

export interface StartupServiceEntry {
  /** Startup phase (1 = first, higher = later) */
  phase: number;
  /** Service identifier */
  serviceId: string;
  /** Display name */
  displayName: string;
  /** Services this depends on (must start in earlier phases) */
  dependencies: string[];
  /** Whether boot fails if this service fails */
  critical: boolean;
  /** Estimated startup time in milliseconds */
  estimatedStartupMs: number;
}

/**
 * Canonical startup order — 6 phases, dependency-aware.
 * Phase N services may only depend on Phase 1..(N-1) services.
 */
export const STARTUP_ORDER: StartupServiceEntry[] = [
  // ── Phase 1: Core infrastructure ──
  { phase: 1, serviceId: "event-bus", displayName: "Core Event System", dependencies: [], critical: true, estimatedStartupMs: 50 },
  { phase: 1, serviceId: "memory-service", displayName: "User Memory & Context", dependencies: [], critical: true, estimatedStartupMs: 100 },

  // ── Phase 2: Trust & policy ──
  { phase: 2, serviceId: "policy-engine", displayName: "Policy Evaluation", dependencies: ["event-bus"], critical: true, estimatedStartupMs: 150 },
  { phase: 2, serviceId: "trust-state-service", displayName: "Trust State Management", dependencies: ["event-bus", "memory-service"], critical: true, estimatedStartupMs: 200 },

  // ── Phase 3: Execution core ──
  { phase: 3, serviceId: "receipt-service", displayName: "Proof & Receipt Generation", dependencies: ["event-bus", "policy-engine"], critical: true, estimatedStartupMs: 100 },
  { phase: 3, serviceId: "workflow-engine", displayName: "Workflow Orchestration", dependencies: ["event-bus", "policy-engine", "trust-state-service"], critical: true, estimatedStartupMs: 200 },
  { phase: 3, serviceId: "executor-service", displayName: "Action Execution", dependencies: ["event-bus", "policy-engine", "receipt-service"], critical: true, estimatedStartupMs: 150 },

  // ── Phase 4: Intelligence ──
  { phase: 4, serviceId: "search-fabric", displayName: "Cross-Domain Search", dependencies: ["event-bus", "memory-service"], critical: false, estimatedStartupMs: 300 },
  { phase: 4, serviceId: "fraud-sentinel", displayName: "Fraud Detection", dependencies: ["event-bus", "trust-state-service"], critical: false, estimatedStartupMs: 250 },
  { phase: 4, serviceId: "projection-service", displayName: "Financial Projections", dependencies: ["event-bus", "trust-state-service"], critical: false, estimatedStartupMs: 200 },

  // ── Phase 5: External ──
  { phase: 5, serviceId: "connector-control", displayName: "External Integrations", dependencies: ["event-bus", "policy-engine", "executor-service"], critical: false, estimatedStartupMs: 500 },
  { phase: 5, serviceId: "file-ingestion", displayName: "Document Processing", dependencies: ["event-bus", "memory-service"], critical: false, estimatedStartupMs: 300 },

  // ── Phase 6: AI orchestration ──
  { phase: 6, serviceId: "brain-core", displayName: "AI Orchestration", dependencies: ["event-bus", "policy-engine", "trust-state-service", "executor-service", "receipt-service"], critical: true, estimatedStartupMs: 400 },
];

export const TOTAL_PHASES = 6;

export function getPhaseServices(phase: number): StartupServiceEntry[] {
  return STARTUP_ORDER.filter((s) => s.phase === phase);
}

export function getCriticalServices(): StartupServiceEntry[] {
  return STARTUP_ORDER.filter((s) => s.critical);
}

export function getServiceDependencies(serviceId: string): string[] {
  return STARTUP_ORDER.find((s) => s.serviceId === serviceId)?.dependencies ?? [];
}

export function getEstimatedBootTimeMs(): number {
  let total = 0;
  for (let phase = 1; phase <= TOTAL_PHASES; phase++) {
    const phaseServices = getPhaseServices(phase);
    // Within a phase, services start in parallel — take the max
    const phaseMax = Math.max(...phaseServices.map((s) => s.estimatedStartupMs), 0);
    total += phaseMax;
  }
  return total;
}
