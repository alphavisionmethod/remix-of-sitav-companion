// ═══════════════════════════════════════════════════════════════
// SITA OS — Dual Reality System (Public API)
// ═══════════════════════════════════════════════════════════════

export * from "./reality-mode-registry";
export * from "./reality-mode-resolver";
export { RealityModeProvider, useRealityMode, useRealityModeSafe } from "./reality-mode-context";
export * from "./mode-aware-provider";
export * from "./demo-policy-engine";
export * from "./demo-scenario-loader";
export * from "./demo-analytics-segregation";
export * from "./surface-class-registry";
export * from "./demo-interaction-policy";
export * from "./demo-scenario-packs";
export { getAllProviders, getProvidersByCategory, getProvidersForDomain, getProvider, domainHasActiveProvider, getDomainProviderHealth, getProviderSummary, persistProviderActivation, type ProviderCategory, type ActivationState, type RealProviderActivationRecord as RealProviderRecord } from "./real-provider-registry";
export { ADMIN_OS_CAPABILITIES, USER_APP_CAPABILITIES, ANALYTICS_SEGREGATION_POLICIES, type RealityModePolicyRecord, type RealityModeResolutionRecord, type DemoProviderRegistryRecord, type DemoScenarioPackRecord, type DemoScenarioEntityRecord, type DemoInteractionPolicyRecord, type SurfaceClassRegistryRecord, type SurfaceModeBindingRecord, type AdminOsCapabilityRecord, type UserAppCapabilityRecord, type LaunchHonestySurfaceRecord, type ModeSegregationAuditRecord, type AnalyticsSegregationPolicyRecord } from "./reality-resolution-records";
