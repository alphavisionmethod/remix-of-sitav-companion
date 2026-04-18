// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Router (Execution Layer)
// Routes execution to correct service/connector
// ═══════════════════════════════════════════════════════════════

export type ExecutionTarget =
  | "agent" | "connector" | "workflow" | "internal"
  | "notification" | "approval" | "checkpoint";

export interface ExecutionRoute {
  target: ExecutionTarget;
  serviceId: string;
  adapterRequired: boolean;
  estimatedLatencyMs: number;
}

const ROUTE_PATTERNS: Record<string, ExecutionRoute> = {
  "agent-": { target: "agent", serviceId: "agent-execution-adapter", adapterRequired: true, estimatedLatencyMs: 2000 },
  "connector-": { target: "connector", serviceId: "connector-executor", adapterRequired: true, estimatedLatencyMs: 1000 },
  "workflow-": { target: "workflow", serviceId: "workflow-step-runner", adapterRequired: false, estimatedLatencyMs: 500 },
  "notification-": { target: "notification", serviceId: "notification-router", adapterRequired: false, estimatedLatencyMs: 100 },
  "approval-": { target: "approval", serviceId: "approval-service", adapterRequired: false, estimatedLatencyMs: 50 },
  "precondition-": { target: "checkpoint", serviceId: "postcondition-checker", adapterRequired: false, estimatedLatencyMs: 50 },
};

export function resolveExecutionRoute(targetId: string): ExecutionRoute {
  for (const [prefix, route] of Object.entries(ROUTE_PATTERNS)) {
    if (targetId.startsWith(prefix)) return route;
  }
  return {
    target: "internal",
    serviceId: "default-executor",
    adapterRequired: false,
    estimatedLatencyMs: 200,
  };
}
