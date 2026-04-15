// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Components Barrel
// Canonical import: @/admin/components
// ═══════════════════════════════════════════════════════════════

// Command / keyboard
export { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
export { AdminKeyboardShortcuts } from "@/components/admin/AdminKeyboardShortcuts";

// Panels
export { RevenueSummaryPanel } from "@/components/admin/panels/RevenueSummaryPanel";
export { RiskSummaryPanel } from "@/components/admin/panels/RiskSummaryPanel";
export { ConnectorSummaryPanel } from "@/components/admin/panels/ConnectorSummaryPanel";
export { IncidentSummaryPanel } from "@/components/admin/panels/IncidentSummaryPanel";
export { ReplaySummaryPanel } from "@/components/admin/panels/ReplaySummaryPanel";
export { ArchitectureHealthBadge } from "@/components/admin/panels/ArchitectureHealthBadge";

// Shell UX helpers
export { GlobalCommandBar } from "@/components/admin/shells/GlobalCommandBar";
export { StatusStrip } from "@/components/admin/shells/StatusStrip";
export { pushUndoAction, useUndoActions } from "@/components/admin/shells/UndoToastSystem";
