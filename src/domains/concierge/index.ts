// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/domains/concierge
//
// This is the trusted domain layer for Concierge OS. It owns
// shared concierge entity contracts (re-exported from
// `@/packages/concierge-contracts`) and derived service-output
// view types consumed by services
// (src/lib/services/concierge-os/), engines, and the Concierge
// UI (src/modules/concierge/, src/pages/ConciergeCenter.tsx).
//
// It MUST NOT import from those layers — domain depends on
// nothing.
//
// Import conventions:
//   import type { HouseholdTask } from "@/domains/concierge";
//   import type { HouseholdOverview } from "@/domains/concierge";
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./contracts";
