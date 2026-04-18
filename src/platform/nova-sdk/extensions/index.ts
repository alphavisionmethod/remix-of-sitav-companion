// ═══════════════════════════════════════════════════════════════
// Nova SDK — Extensions Barrel Export
// ═══════════════════════════════════════════════════════════════

export { PluginRegistry } from "./plugin-registry";
export type { PluginManifest, ExtensionPoint, PluginLifecycle, ExtensionHandler, InstalledPlugin, TrustLevel } from "./plugin-registry";

export { WidgetRegistry } from "./widget-registry";
export type { WidgetManifest, WidgetProps, WidgetPlacement, WidgetSize, WidgetCategory } from "./widget-registry";

export { IntegrationRegistry } from "./integration-registry";
export type { IntegrationManifest, IntegrationInstance, IntegrationType, IntegrationStatus } from "./integration-registry";

export { auditAnimationConsistency, auditSoundCoverage, auditInteractionFeedback, getPolishScore } from "./polish-audit";
export type { AuditResult, PolishScore } from "./polish-audit";
