// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Support Diagnostics
// Diagnostic data collection for advisor troubleshooting.
// ═══════════════════════════════════════════════════════════════

export interface AdvisorDiagnosticSnapshot {
  readonly advisorId: string;
  readonly timestamp: string;
  readonly status: "active" | "paused" | "disabled" | "degraded" | "error";
  readonly currentAutonomyLevel: string;
  readonly confidenceBaseline: number;
  readonly recentActions: number;        // last 24h
  readonly recentEscalations: number;    // last 24h
  readonly recentRejections: number;     // last 7d
  readonly memoryUtilization: { working: number; shortTerm: number; longTerm: number };
  readonly lastInvocationAt: string | null;
  readonly lastErrorAt: string | null;
  readonly lastError: string | null;
  readonly tokensUsedToday: number;
  readonly budgetRemainingPct: number;
  readonly trustScore: number;
  readonly killSwitchActive: boolean;
}

export interface AdvisorSupportBundle {
  readonly generatedAt: string;
  readonly advisorId: string;
  readonly snapshot: AdvisorDiagnosticSnapshot;
  readonly recentReflections: Array<{ outcomeQuality: number; ownerAction: string; lesson: string }>;
  readonly policyAdjustments: Array<{ type: string; delta: number; reason: string }>;
  readonly escalationHistory: Array<{ ruleId: string; timestamp: string; resolution: string }>;
}

export function createEmptyDiagnosticSnapshot(advisorId: string): AdvisorDiagnosticSnapshot {
  return {
    advisorId,
    timestamp: new Date().toISOString(),
    status: "active",
    currentAutonomyLevel: "L0-observe",
    confidenceBaseline: 0.5,
    recentActions: 0,
    recentEscalations: 0,
    recentRejections: 0,
    memoryUtilization: { working: 0, shortTerm: 0, longTerm: 0 },
    lastInvocationAt: null,
    lastErrorAt: null,
    lastError: null,
    tokensUsedToday: 0,
    budgetRemainingPct: 100,
    trustScore: 0.5,
    killSwitchActive: false,
  };
}