// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Plane Public API (Complete)
// Operations, policy, support, security, rollout control.
// May depend on: shared. Must NOT import from os/founder/mobile.
// ═══════════════════════════════════════════════════════════════

// ── Admin RBAC ──
export { adminRbacEngine, PERMISSION_CATEGORIES } from "@/lib/platform-plane/admin-rbac-engine";
export type { AdminPermission, PermissionCategory } from "@/lib/platform-plane/admin-rbac-engine";

// ── Admin Safety ──
export { adminSafety } from "@/lib/platform-plane/admin-safety";
export type { SafetyRequirements, DryRunResult, ConfirmationRequest } from "@/lib/platform-plane/admin-safety";

// ── Admin BFF ──
export { adminBFF } from "@/lib/platform-plane/admin-bff";
export type { SystemOverview, User360View, DeviceFleetSummary } from "@/lib/platform-plane/admin-bff";

// ── Support Workflow ──
export { supportWorkflow } from "@/lib/platform-plane/support-workflow";
export type { SupportCase, SupportCaseEvent, DiagnosticPackage } from "@/lib/platform-plane/support-workflow";

// ── Notification Router ──
export { notificationRouter } from "@/lib/platform-plane/notification-router";

// ── Admin AI Workforce Client ──
export * from "@/lib/admin-ai";

// ── Admin Route Truth ──
export { loadManifest, validateRouteTruth, getRouteMismatches, getManifestStaleness, saveSnapshot } from "@/lib/services/admin-route-truth-service";

// ── Compute Governance (admin visibility) ──
export * from "@/lib/compute-governance";
