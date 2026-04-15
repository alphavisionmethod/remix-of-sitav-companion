// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Module Barrel: Operations
// Canonical import: @/admin/modules/operations
// ═══════════════════════════════════════════════════════════════

// Fleet
export { FleetHealthWidget } from "@/components/admin/FleetHealthWidget";

// Safety / Recovery / Authority
export { EmergencyAuthorityPanel } from "@/components/admin/shells/EmergencyAuthorityPanel";
export { NoSilentFailureAlerts } from "@/components/admin/shells/NoSilentFailureAlerts";
export { RemoteAuthoritySession } from "@/components/admin/shells/RemoteAuthoritySession";
export { RolloutStatusBanner } from "@/components/admin/shells/RolloutStatusBanner";
export { SafeModeBadge } from "@/components/admin/shells/SafeModeBadge";
export { SafeModeDrawer } from "@/components/admin/shells/SafeModeDrawer";
export { SafeModeProvider, useSafeMode } from "@/components/admin/shells/SafeModeProvider";
export { SafetyConfirmDialog } from "@/components/admin/shells/SafetyConfirmDialog";
export type { SafetyAction, RiskLevel } from "@/components/admin/shells/SafetyConfirmDialog";
export { SelfHealingStatusPanel } from "@/components/admin/shells/SelfHealingStatusPanel";
