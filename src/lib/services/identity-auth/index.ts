// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Auth vs Connector Auth — Service Barrel
// ═══════════════════════════════════════════════════════════════

// Domain types
export * from "./types";

// Identity provider services (sign-in)
export {
  getIdentityProviderRegistry,
  getIdentityProviderByKey,
  getUserIdentityLinks,
  getPrimaryIdentity,
  getIdentityMethods,
  logSessionEvent,
  getSessionAuditLog,
} from "./identity-provider.service";

// Connector access services (external services)
export {
  getConnectedServices,
  getConnectedServicesByStatus,
  getConnectedAccountsCenter,
  logDisconnection,
  getDisconnectionHistory,
  requestPermissionUpgrade,
  getPendingUpgradeRequests,
} from "./connector-access.service";

// Consent ledger services
export {
  getConsentHistory,
  getActiveConsents,
  recordConsent,
  getConsentHistoryView,
} from "./consent.service";

// Unified account graph services
export {
  getAccountNodes,
  getAccountEdges,
  getAccountGraphSummary,
  getSeparationAudits,
} from "./account-graph.service";
