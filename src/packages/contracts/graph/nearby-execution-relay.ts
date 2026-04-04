// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Nearby Execution Relay
// Trusted device / local relay for degraded connectivity
// ═══════════════════════════════════════════════════════════════

export type RelayStatus = "available" | "busy" | "offline" | "degraded";

export interface NearbyExecutionRelay {
  relayId: string;
  deviceId: string;
  userId: string;
  status: RelayStatus;
  capabilities: string[];
  latencyMs: number;
  lastHeartbeat: string;
  queuedActions: number;
  maxQueueSize: number;
  encryptionEnabled: boolean;
}
