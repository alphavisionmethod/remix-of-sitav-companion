// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Module Barrel: Operations
// Canonical import: @/admin/modules/operations
// ═══════════════════════════════════════════════════════════════

// Fleet
export { default as FleetHealthWidget } from "@/platform/admin/components/admin/FleetHealthWidget";

// Safety / Recovery / Authority
export { EmergencyAuthorityPanel } from "@/platform/admin/components/admin/shells/EmergencyAuthorityPanel";
export { NoSilentFailureAlerts } from "@/platform/admin/components/admin/shells/NoSilentFailureAlerts";
export { RemoteAuthoritySession } from "@/platform/admin/components/admin/shells/RemoteAuthoritySession";
export { RolloutStatusBanner } from "@/platform/admin/components/admin/shells/RolloutStatusBanner";
export { SafeModeProvider, useSafeMode } from "@/platform/admin/components/admin/shells/SafeModeProvider";
export { SafetyConfirmDialog } from "@/platform/admin/components/admin/shells/SafetyConfirmDialog";
export type { SafetyAction, RiskLevel } from "@/platform/admin/components/admin/shells/SafetyConfirmDialog";
export { SelfHealingStatusPanel } from "@/platform/admin/components/admin/shells/SelfHealingStatusPanel";
