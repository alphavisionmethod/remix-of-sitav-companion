// ═══════════════════════════════════════════════════════════════
// SITA OS — Execute Connector Action Service
// Executes connector-specific actions with health validation
// ═══════════════════════════════════════════════════════════════

export type ConnectorActionType = "sync" | "send" | "fetch" | "create" | "update" | "delete";

export interface ConnectorActionRequest {
  connectorId: string;
  actionType: ConnectorActionType;
  payload: Record<string, unknown>;
  timeoutMs?: number;
}

export interface ConnectorActionResult {
  success: boolean;
  connectorId: string;
  actionType: ConnectorActionType;
  data?: Record<string, unknown>;
  error?: string;
  durationMs: number;
  fromCache: boolean;
}

export interface ConnectorHealthState {
  connectorId: string;
  healthy: boolean;
  lastChecked: string;
  latencyMs: number;
  errorRate: number;
}

const healthStates = new Map<string, ConnectorHealthState>();

// Initialize mock health states
["gmail", "calendar", "crm", "accounting", "banking", "travel", "cloud-drive", "signature", "forex-broker", "crypto-exchange", "wallet"].forEach((id) => {
  healthStates.set(id, {
    connectorId: id,
    healthy: true,
    lastChecked: new Date().toISOString(),
    latencyMs: Math.floor(Math.random() * 200) + 50,
    errorRate: Math.random() * 0.05,
  });
});

export function executeConnectorAction(request: ConnectorActionRequest): ConnectorActionResult {
  const start = performance.now();

  const health = healthStates.get(request.connectorId);
  if (!health || !health.healthy) {
    return {
      success: false,
      connectorId: request.connectorId,
      actionType: request.actionType,
      error: `Connector "${request.connectorId}" is unhealthy or not registered`,
      durationMs: performance.now() - start,
      fromCache: false,
    };
  }

  // Simulate execution
  const duration = performance.now() - start + health.latencyMs;

  return {
    success: true,
    connectorId: request.connectorId,
    actionType: request.actionType,
    data: { simulated: true, action: request.actionType, connector: request.connectorId, recordCount: Math.floor(Math.random() * 50) + 1 },
    durationMs: duration,
    fromCache: false,
  };
}

export function getConnectorHealth(connectorId: string): ConnectorHealthState | undefined {
  return healthStates.get(connectorId);
}

export function getAllConnectorHealth(): ConnectorHealthState[] {
  return Array.from(healthStates.values());
}

export function setConnectorHealth(connectorId: string, healthy: boolean): void {
  const state = healthStates.get(connectorId);
  if (state) {
    state.healthy = healthy;
    state.lastChecked = new Date().toISOString();
  }
}

