// ════════════════════════════════════════════════════════════
// SITA OS — SHARED_LAYER canonical constant
// Canonical home for the platform-wide "shared" layer descriptor.
// Migrated from src/modules/_shared/index.ts (Wave 9 shim removal).
// ════════════════════════════════════════════════════════════

export const SHARED_LAYER = {
  id: "shared",
  label: "Shared Platform",
  description:
    "Shell · Identity · AI runtime · Voice · Memory · Notifications · Files · Connectors",
} as const;

export type SharedLayer = typeof SHARED_LAYER;