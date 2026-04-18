// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5 wave 1 re-export shim
// Canonical implementation now lives at:
//   @/admin/modules/verification/views/V01SurfaceInventoryBoard
// This file is preserved as a thin re-export so legacy imports and
// the route registry continue to work without churn. Safe to remove
// once all consumers import the canonical path directly.
// ═══════════════════════════════════════════════════════════════
export { default } from "@/admin/modules/verification/views/V01SurfaceInventoryBoard";
