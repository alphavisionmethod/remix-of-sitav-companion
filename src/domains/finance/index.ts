// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Barrel: src/domains/finance
//
// This is the trusted domain layer for Finance OS / Money. It owns
// shared finance entity contracts (re-exported from
// `@/packages/finance-contracts`) and derived service-output view
// types consumed by services (src/lib/services/finance-os/),
// engines, and the Finance UI (src/modules/finance/, MoneyCenter,
// investment-office pages).
//
// It MUST NOT import from those layers — domain depends on
// nothing.
//
// Import conventions:
//   import type { FinancialAccount } from "@/domains/finance";
//   import type { WasteReport } from "@/domains/finance";
// ═══════════════════════════════════════════════════════════════

export * from "./types";
export * from "./contracts";
