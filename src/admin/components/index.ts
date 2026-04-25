// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Components Barrel
// Canonical import: @/admin/components
// ═══════════════════════════════════════════════════════════════

// Command / keyboard
export { AdminCommandPalette } from "@/platform/admin/components/admin/AdminCommandPalette";
export { AdminKeyboardShortcuts } from "@/platform/admin/components/admin/AdminKeyboardShortcuts";

// Panels
export { RevenueSummaryPanel } from "@/platform/admin/components/admin/panels/RevenueSummaryPanel";
export { RiskSummaryPanel } from "@/platform/admin/components/admin/panels/RiskSummaryPanel";
export { ConnectorSummaryPanel } from "@/platform/admin/components/admin/panels/ConnectorSummaryPanel";
export { IncidentSummaryPanel } from "@/platform/admin/components/admin/panels/IncidentSummaryPanel";
export { ReplaySummaryPanel } from "@/platform/admin/components/admin/panels/ReplaySummaryPanel";
export { ArchitectureHealthBadge } from "@/platform/admin/components/admin/panels/ArchitectureHealthBadge";

// Shell UX helpers
export { GlobalCommandBar } from "@/platform/admin/components/admin/shells/GlobalCommandBar";
export { StatusStrip } from "@/platform/admin/components/admin/shells/StatusStrip";
export { pushUndoAction, useUndoActions } from "@/platform/admin/components/admin/shells/UndoToastSystem";
