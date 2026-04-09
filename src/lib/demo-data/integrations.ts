// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Facade: Integrations
// Pages import from here instead of core-services directly
// ═══════════════════════════════════════════════════════════════

export {
  DEMO_CONNECTIONS,
  DEMO_AUDIT_LOG,
  DEMO_ACTION_REQUESTS,
} from "@/lib/core-services/integration-hub/demo-connections";

export type {
  DemoConnection,
  DemoAuditEntry,
  DemoActionRequest,
} from "@/lib/core-services/integration-hub/demo-connections";

export {
  INTEGRATION_PROVIDERS,
  PROVIDER_CATEGORIES,
  getProviderById,
} from "@/lib/core-services/integration-hub/providers";

export type {
  IntegrationProvider,
} from "@/lib/core-services/integration-hub/providers";
