// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Runtime Consequence Map
// Failure impact classification per function
// ═══════════════════════════════════════════════════════════════

export type ImpactSeverity = "critical" | "high" | "medium" | "low";
export type BlastRadius = "system-wide" | "domain" | "feature" | "isolated";

export interface RuntimeConsequence {
  readonly severity: ImpactSeverity;
  readonly blastRadius: BlastRadius;
  readonly userFacing: boolean;
  readonly dataLossRisk: boolean;
  readonly fallbackAvailable: boolean;
  readonly description: string;
}

export const EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP: Record<string, RuntimeConsequence> = {
  "ai-gateway": { severity: "critical", blastRadius: "system-wide", userFacing: true, dataLossRisk: false, fallbackAvailable: true, description: "All AI features degrade" },
  "api-gateway": { severity: "critical", blastRadius: "system-wide", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "External API access blocked" },
  "main": { severity: "high", blastRadius: "system-wide", userFacing: false, dataLossRisk: false, fallbackAvailable: true, description: "Health check fails" },
  "admin-gateway": { severity: "high", blastRadius: "domain", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "Admin plane inaccessible" },
  "admin-bff-gateway": { severity: "high", blastRadius: "domain", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "Admin UI data unavailable" },
  "user-bff-gateway": { severity: "high", blastRadius: "domain", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "User dashboard data blocked" },
  "payment-process": { severity: "critical", blastRadius: "feature", userFacing: true, dataLossRisk: true, fallbackAvailable: false, description: "Payments cannot process" },
  "connector-oauth": { severity: "high", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "Connector auth flows break" },
  "push-dispatch": { severity: "medium", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: true, description: "Push notifications delayed" },
  "gdpr-delete": { severity: "critical", blastRadius: "feature", userFacing: false, dataLossRisk: false, fallbackAvailable: false, description: "GDPR deletion compliance risk" },
  "gdpr-export": { severity: "high", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "GDPR export compliance risk" },
  "self-healing": { severity: "high", blastRadius: "system-wide", userFacing: false, dataLossRisk: false, fallbackAvailable: false, description: "Auto-recovery disabled" },
  "brain-core": { severity: "high", blastRadius: "domain", userFacing: true, dataLossRisk: false, fallbackAvailable: true, description: "Core intelligence offline" },
  "advisor-conversation": { severity: "medium", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: true, description: "Advisor chat unavailable" },
  "cashflow-calculate": { severity: "medium", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "Cash flow projections fail" },
  "invoice-generate": { severity: "medium", blastRadius: "feature", userFacing: true, dataLossRisk: false, fallbackAvailable: false, description: "Invoice generation blocked" },
  "runtime-probes": { severity: "low", blastRadius: "isolated", userFacing: false, dataLossRisk: false, fallbackAvailable: true, description: "Observability gap" },
  "get-weather": { severity: "low", blastRadius: "isolated", userFacing: true, dataLossRisk: false, fallbackAvailable: true, description: "Weather widget shows stale" },
  "vapid-public-key": { severity: "low", blastRadius: "isolated", userFacing: false, dataLossRisk: false, fallbackAvailable: true, description: "Push subscription setup fails" },
  "seed-user-data": { severity: "low", blastRadius: "isolated", userFacing: false, dataLossRisk: false, fallbackAvailable: true, description: "Demo seeding unavailable" },
  "verification-recorder": { severity: "medium", blastRadius: "feature", userFacing: false, dataLossRisk: true, fallbackAvailable: false, description: "Verification proofs lost" },
  "cost-alert": { severity: "medium", blastRadius: "feature", userFacing: false, dataLossRisk: false, fallbackAvailable: false, description: "Cost alerts not triggered" },
  "event-processor": { severity: "high", blastRadius: "domain", userFacing: false, dataLossRisk: true, fallbackAvailable: false, description: "Event pipeline stalls" },
  "scheduler-dispatch": { severity: "high", blastRadius: "domain", userFacing: false, dataLossRisk: false, fallbackAvailable: false, description: "Scheduled tasks not dispatched" },
} as const;

export function getConsequenceForFunction(name: string): RuntimeConsequence | undefined {
  return EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP[name];
}

export function getCriticalFunctions(): string[] {
  return Object.entries(EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP)
    .filter(([, c]) => c.severity === "critical")
    .map(([name]) => name);
}

export function getDataLossRiskFunctions(): string[] {
  return Object.entries(EDGE_FUNCTION_RUNTIME_CONSEQUENCE_MAP)
    .filter(([, c]) => c.dataLossRisk)
    .map(([name]) => name);
}
