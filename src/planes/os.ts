// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Plane Public API
// Kernel, runtime, SDK, shell, security, recovery.
// Direct imports from @/lib/nova-sdk/ are forbidden outside this barrel.
// ═══════════════════════════════════════════════════════════════

// ── Nova SDK (full barrel) ──
export {
  validateManifest,
  AppRegistry,
  useAppRuntime,
  useNovaApp,
} from "@/lib/nova-sdk";

export type {
  AppManifest,
  NovaPermissionId,
  RegisteredApp,
  AppRuntimeState,
} from "@/lib/nova-sdk";

// ── Nova SDK UI Components ──
export {
  NovaText, NovaButton, NovaInput, NovaCard, NovaList, NovaModal,
  NovaSidebar, NovaSectionLabel, NovaToggle, NovaSlider, NovaTextArea,
  NovaToolbar, NovaBadge, NovaAvatar,
} from "@/lib/nova-sdk";

// ── Nova SDK Layout ──
export {
  VStack, HStack, Spacer, Divider, SplitView, AppLayout, NovaScrollArea,
} from "@/lib/nova-sdk";

// ── Nova SDK Services ──
export {
  ServiceManager, FileSystemService, WindowServer,
  InputService, NotificationService, SettingsService,
} from "@/lib/nova-sdk";

export type {
  SystemService, ServiceDescriptor, ServiceLogEntry, ServiceStatus, RestartPolicy,
  FSNode, FSPermissions, MountPoint, FSWatchCallback,
  WindowState, WindowRule, SnapZone,
  ModifierState, HotkeyBinding, GestureState, InputRecording, AccessibilityConfig,
  SystemNotification, NotificationAction, NotificationGroup, DNDConfig,
  SettingsSchema, SettingsLayer,
} from "@/lib/nova-sdk";

// ── Nova SDK System ──
export { createWindowAPI } from "@/lib/nova-sdk/system/window-api";
export type { NovaWindowOptions, NovaWindowHandle } from "@/lib/nova-sdk/system/window-api";
export { NovaBridge } from "@/lib/nova-sdk/system/bridge";

// ── Kernel subsystems ──
export { NovaKernel } from "@/lib/nova-sdk/kernel/boot";
export { Compositor } from "@/lib/nova-sdk/kernel/compositor";
export { Scheduler } from "@/lib/nova-sdk/kernel/scheduler";
export { Syscall, ERRNO } from "@/lib/nova-sdk/kernel/syscall";
export { MemoryManager } from "@/lib/nova-sdk/kernel/memory-manager";

// ── Nova SDK Extensions ──
export {
  PluginRegistry, WidgetRegistry, IntegrationRegistry,
  auditAnimationConsistency, auditSoundCoverage, auditInteractionFeedback, getPolishScore,
} from "@/lib/nova-sdk/extensions";
export type {
  PluginManifest, ExtensionPoint, PluginLifecycle, ExtensionHandler,
  InstalledPlugin, TrustLevel,
  WidgetManifest, WidgetProps, WidgetPlacement, WidgetSize, WidgetCategory,
  IntegrationManifest, IntegrationInstance, IntegrationType, IntegrationStatus,
  AuditResult, PolishScore,
} from "@/lib/nova-sdk/extensions";

// ── OS Security Subsystem ──
export {
  bootOSSecurity, isOSSecurityBooted,
  AuthDaemon, getAuthDaemon,
  PolicyDaemon, getPolicyDaemon, registerService, getServiceIdentity,
  SecretsDaemon, getSecretsDaemon,
  SessionDaemon, getSessionDaemon,
  AuditDaemon, getAuditDaemon,
  ControlCenterDaemon, getControlCenterDaemon,
  PolicyBundleManager, getPolicyBundleManager, DEVICE_MODES,
  ContextualDecisionEngine, getContextualDecisionEngine,
  UpdateDaemon, getUpdateDaemon,
  OnboardingDaemon, getOnboardingDaemon,
  ElevationEngine, getElevationEngine,
  NotifyDaemon, getNotifyDaemon,
} from "@/lib/os-security";

export type {
  EnvironmentalContext, PolicyDecision,
  SessionEvent, LockedScreenCapabilities,
  CommandResult,
  DeviceMode, PolicyBundle, FullPolicyContent, PolicyBundleSource, DeviceModeDefinition,
  EnhancedPolicyContext, EnhancedPolicyDecision, EnhancedDecisionType,
  UpdateState, UpdateChannel, UpdateCatalogEntry, UpdatePreflightResult, UpdateProgress,
  HealthValidationResult, RollbackEvent, SystemSlot,
  OnboardingSession, OnboardingStep, ProtectionDefaults,
  ElevationResult,
  SecurityNotification, SecurityEventType,
} from "@/lib/os-security";

// ── OS Services (Platform Daemons) ──
export { getAccessibilityDaemon } from "@/lib/os-services/accessibilityd";
export { getAudioDaemon } from "@/lib/os-services/audiod";
export { getAutomationDaemon } from "@/lib/os-services/automationd";
export { getBluetoothDaemon } from "@/lib/os-services/btd";
export { getCrashDaemon } from "@/lib/os-services/crashd";
export { getDeviceDaemon } from "@/lib/os-services/deviced";
export { getHealthDaemon } from "@/lib/os-services/healthd";
export { getHelpEngine } from "@/lib/os-services/help-engine";
export { getPowerDaemon } from "@/lib/os-services/powerd";
export { getSettingsDaemon } from "@/lib/os-services/settingsd";
export { getTimeDaemon } from "@/lib/os-services/timed";
export { getWifiDaemon } from "@/lib/os-services/wifid";

// ── OS Services (Infrastructure) ──
export { capabilityCatalog } from "@/lib/os-services/capability-catalog";
export { diagnosticBundle } from "@/lib/os-services/diagnostic-bundle";
export { entityIdentity } from "@/lib/os-services/entity-identity";
export { healthGraph } from "@/lib/os-services/health-graph";
export { localizationInfra } from "@/lib/os-services/localization-infra";
export { migrationEngine } from "@/lib/os-services/migration-engine";
export { networkPolicyMatrix } from "@/lib/os-services/network-policy-matrix";
export { notificationClassifier } from "@/lib/os-services/notification-classifier";
export { osEventSystem } from "@/lib/os-services/os-event-system";
export { platformIpcBus } from "@/lib/os-services/platform-ipc-bus";
export { policyResolver } from "@/lib/os-services/policy-resolver";
export { quotaGovernor } from "@/lib/os-services/quota-governor";
export { recommendationRanker } from "@/lib/os-services/recommendation-ranker";
export { recoveryLevels } from "@/lib/os-services/recovery-levels";
export { releaseLifecycle } from "@/lib/os-services/release-lifecycle";
export { searchIndexer } from "@/lib/os-services/search-indexer";
export { signingTrustChain } from "@/lib/os-services/signing-trust-chain";
export { sloTargets } from "@/lib/os-services/slo-targets";
export { storageStrategy } from "@/lib/os-services/storage-strategy";
export { appLifecycle } from "@/lib/os-services/app-lifecycle";
export { abiVersioning } from "@/lib/os-services/abi-versioning";

// ── Sync Engine ──
export * from "@/lib/sync-engine";
