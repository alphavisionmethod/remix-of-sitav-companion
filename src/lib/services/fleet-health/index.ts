// ═══════════════════════════════════════════════════════════════
// SITA OS — Fleet Health (Re-export from core-services)
// Wire to the advanced 305-line fleet health service
// ═══════════════════════════════════════════════════════════════

export {
  FleetHealthService,
  createFleetHealthService,
} from "@/lib/core-services/self-healing/fleet-health";

export type {
  ServiceHealthRecord, ServiceHealthStatus, ServiceMetrics,
  DegradedService, RecoverySequence,
} from "@/lib/core-services/self-healing/types";

// Convenience alias for old consumers
export { createFleetHealthService as createFleetHealth } from "@/lib/core-services/self-healing/fleet-health";
