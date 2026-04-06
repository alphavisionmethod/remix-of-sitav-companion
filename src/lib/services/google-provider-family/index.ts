// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family (Barrel Export)
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export {
  getGoogleProviderFamilyState,
  getGoogleConsentHistory,
  doesIdentityImplyConnector,
  resolveOAuthClient,
  isScopeUpgradeSafe,
} from "./google-provider-family.service";
export { getGoogleDemoState } from "./google-demo-provider";
