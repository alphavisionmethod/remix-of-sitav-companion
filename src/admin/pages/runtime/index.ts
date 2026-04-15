// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Runtime / Device / Surface Control
// Canonical import: @/admin/pages/runtime
// ═══════════════════════════════════════════════════════════════

// ── Android ──
export { default as AND01AndroidEcosystemCenter } from "@/pages/admin/AND01AndroidEcosystemCenter";
export { default as AND02WearOSExperience } from "@/pages/admin/AND02WearOSExperience";
export { default as AND03AndroidTrustApprovals } from "@/pages/admin/AND03AndroidTrustApprovals";
export { default as AND04AndroidHealthConsent } from "@/pages/admin/AND04AndroidHealthConsent";
export { default as AND05AndroidLaunchReadiness } from "@/pages/admin/AND05AndroidLaunchReadiness";

// ── Apple ──
export { default as APL01AppleEcosystemCenter } from "@/pages/admin/APL01AppleEcosystemCenter";
export { default as APL02AppleDevicesTrust } from "@/pages/admin/APL02AppleDevicesTrust";
export { default as APL03AppleWatchExperience } from "@/pages/admin/APL03AppleWatchExperience";
export { default as APL04AppleIdentityAccounts } from "@/pages/admin/APL04AppleIdentityAccounts";
export { default as APL05AppleHealthConsent } from "@/pages/admin/APL05AppleHealthConsent";
export { default as APL06AppleLaunchReadiness } from "@/pages/admin/APL06AppleLaunchReadiness";

// ── DWE (Device/Wearable Ecosystem) ──
export { default as DWE01ConnectedDevicesCenter } from "@/pages/admin/DWE01ConnectedDevicesCenter";
export { default as DWE02PresenceContinuityCenter } from "@/pages/admin/DWE02PresenceContinuityCenter";
export { default as DWE03WearableSignalsCenter } from "@/pages/admin/DWE03WearableSignalsCenter";
export { default as DWE04NotificationRoutingStudio } from "@/pages/admin/DWE04NotificationRoutingStudio";
export { default as DWE05DeviceTrustApprovalsCenter } from "@/pages/admin/DWE05DeviceTrustApprovalsCenter";
export { default as DWE06AmbientAssistantCenter } from "@/pages/admin/DWE06AmbientAssistantCenter";
export { default as DWE07DeviceLaunchHonestyBoard } from "@/pages/admin/DWE07DeviceLaunchHonestyBoard";

// ── UAO (Unified Ambient Operations) ──
export { default as UAO01PresenceContinuity } from "@/pages/admin/UAO01PresenceContinuity";
export { default as UAO02ConnectedDevices } from "@/pages/admin/UAO02ConnectedDevices";
export { default as UAO03AmbientTeamControl } from "@/pages/admin/UAO03AmbientTeamControl";
export { default as UAO04NotificationRouter } from "@/pages/admin/UAO04NotificationRouter";
export { default as UAO05HealthReadiness } from "@/pages/admin/UAO05HealthReadiness";
export { default as UAO06DeviceTrust } from "@/pages/admin/UAO06DeviceTrust";
export { default as UAO07CrossSurfaceJourney } from "@/pages/admin/UAO07CrossSurfaceJourney";
export { default as UAO08AmbientLaunchReadiness } from "@/pages/admin/UAO08AmbientLaunchReadiness";

// ── MSA (Multi-Surface Architecture) ──
export { default as MSA01MultiSurfaceOverview } from "@/pages/admin/MSA01MultiSurfaceOverview";
export { default as MSA02CoreSurfaceBoundary } from "@/pages/admin/MSA02CoreSurfaceBoundary";
export { default as MSA03CapabilityPortability } from "@/pages/admin/MSA03CapabilityPortability";
export { default as MSA04SurfaceAdapterRegistry } from "@/pages/admin/MSA04SurfaceAdapterRegistry";
export { default as MSA05CompatibilityRadar } from "@/pages/admin/MSA05CompatibilityRadar";

// ── DRS (Dual Reality System) ──
export { default as DRS01RealityModeOverview } from "@/pages/admin/DRS01RealityModeOverview";
export { default as DRS02ModeRegistryConsole } from "@/pages/admin/DRS02ModeRegistryConsole";
export { default as DRS03ScenarioLibrary } from "@/pages/admin/DRS03ScenarioLibrary";
export { default as DRS04ScenarioEntityGraph } from "@/pages/admin/DRS04ScenarioEntityGraph";
export { default as DRS05ProviderConsole } from "@/pages/admin/DRS05ProviderConsole";
export { default as DRS06DemoPolicySafety } from "@/pages/admin/DRS06DemoPolicySafety";
export { default as DRS07DemoAIControl } from "@/pages/admin/DRS07DemoAIControl";
export { default as DRS08AnalyticsSegregation } from "@/pages/admin/DRS08AnalyticsSegregation";
export { default as DRS09TruthLabeling } from "@/pages/admin/DRS09TruthLabeling";
export { default as DRS10DualRealityLaunchGate } from "@/pages/admin/DRS10DualRealityLaunchGate";

// ── MC Authority/Control pages (from modules/) ──
export { default as MCAIControl } from "@/pages/admin/modules/MCAIControl";
export { default as MCApprovalFlow } from "@/pages/admin/modules/MCApprovalFlow";
export { default as MCAuthorityMatrix } from "@/pages/admin/modules/MCAuthorityMatrix";
export { default as MCCommandRouting } from "@/pages/admin/modules/MCCommandRouting";
export { default as MCControlReceipts } from "@/pages/admin/modules/MCControlReceipts";
export { default as MCEmergencyAuthority } from "@/pages/admin/modules/MCEmergencyAuthority";
export { default as MCEventRouting } from "@/pages/admin/modules/MCEventRouting";
export { default as MCFailureRecovery } from "@/pages/admin/modules/MCFailureRecovery";
export { default as MCFeatureOwnership } from "@/pages/admin/modules/MCFeatureOwnership";
export { default as MCStateAuthority } from "@/pages/admin/modules/MCStateAuthority";
export { default as MCTrustSecurity } from "@/pages/admin/modules/MCTrustSecurity";

// ── HRS (Health Readiness System) ──
export { default as HRS01HealthConsentCenter } from "@/pages/admin/HRS01HealthConsentCenter";
export { default as HRS02SignalSourcesBoard } from "@/pages/admin/HRS02SignalSourcesBoard";
export { default as HRS03ReadinessExplanation } from "@/pages/admin/HRS03ReadinessExplanation";
export { default as HRS04NotificationInfluence } from "@/pages/admin/HRS04NotificationInfluence";
export { default as HRS05AssistantTimingBoard } from "@/pages/admin/HRS05AssistantTimingBoard";
export { default as HRS06SignalLaunchHonesty } from "@/pages/admin/HRS06SignalLaunchHonesty";

// ── NOT (Notification Runtime) ──
export { default as NOT01NotificationRuntimeVerification } from "@/pages/admin/NOT01NotificationRuntimeVerification";
export { default as NOT02NotificationRoutingBoard } from "@/pages/admin/NOT02NotificationRoutingBoard";
export { default as NOT03DeliveryReceiptsExplorer } from "@/pages/admin/NOT03DeliveryReceiptsExplorer";
export { default as NOT04CalmPolicyBoard } from "@/pages/admin/NOT04CalmPolicyBoard";
export { default as NOT05NotificationPreferencesBoard } from "@/pages/admin/NOT05NotificationPreferencesBoard";

// ── NRC (Notification Routing Control) ──
export { default as NRC01RoutingStudio } from "@/pages/admin/NRC01RoutingStudio";
export { default as NRC02CalmnessCenter } from "@/pages/admin/NRC02CalmnessCenter";
export { default as NRC03FatigueBoard } from "@/pages/admin/NRC03FatigueBoard";
export { default as NRC04QueueInterruptMatrix } from "@/pages/admin/NRC04QueueInterruptMatrix";
export { default as NRC05CrossDeviceDelivery } from "@/pages/admin/NRC05CrossDeviceDelivery";
export { default as NRC06NotificationLaunchHonesty } from "@/pages/admin/NRC06NotificationLaunchHonesty";

// ── NSS (Native Surface Strategy) ──
export { default as NSS01StrategyBoard } from "@/pages/admin/NSS01StrategyBoard";
export { default as NSS02CapabilityMatrix } from "@/pages/admin/NSS02CapabilityMatrix";
export { default as NSS03TrustContinuity } from "@/pages/admin/NSS03TrustContinuity";
export { default as NSS04MobileLaunchHonesty } from "@/pages/admin/NSS04MobileLaunchHonesty";

// ── Environment ──
export { default as EnvironmentAppliancePage } from "@/pages/admin/EnvironmentAppliancePage";
export { default as ConciergeRuntimeBoard } from "@/pages/admin/ConciergeRuntimeBoard";
