// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Plane Public API (Complete)
// Operations, policy, support, security, rollout control.
//
// Authority: Constitution Rules 29–32 (Admin Plane Law).
// Model:     docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md
// Boundary:  Admin may import from platform; admin must NOT import from modules.
//            platform/ and modules/ MUST NOT import from this file.
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

// ── Canonical admin UI barrels (Wave 0.6 — Rule 29) ──
// These re-exports align src/planes/admin.ts with the canonical
// src/admin/** home. Additive only — does not remove any prior export.
export * as AdminPages from "@/admin/pages";
export * as AdminComponents from "@/admin/components";
