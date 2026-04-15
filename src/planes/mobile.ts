// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Plane Public API
// Control, visibility, approvals, trust authority.
// May depend on: shared. Must NOT import from os/admin/founder.
// ═══════════════════════════════════════════════════════════════

// ── User BFF ──
export { userBFF } from "@/lib/platform-plane/user-bff";
export type { UserDashboard, DeviceSummary, NotificationSummary, CaseSummary } from "@/lib/platform-plane/user-bff";

// ── Biometric Auth ──
export * from "@/lib/core-services/biometric-auth";

// ── Device Presence ──
export * from "@/lib/core-services/device-presence-service";
