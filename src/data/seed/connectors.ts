// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Facade: Connector Health
// Pages import from here instead of core-services directly
// ═══════════════════════════════════════════════════════════════

export {
  fetchConnectorHealth,
} from "@/lib/core-services/connector-health-service";

export type {
  ConnectorHealthResult,
} from "@/lib/core-services/connector-health-service";
