// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Concierge Domain: Contracts Barrel
//
// Single import surface for structural Concierge OS contracts.
// Re-exports the curated `@/packages/concierge-contracts` types so
// consumers (services, modules, UI) only need to import from
// `@/domains/concierge`.
//
// Rule: domain depends on nothing. This file MUST only re-export
// from the contracts package and never import runtime code.
// ═══════════════════════════════════════════════════════════════

export * from "@/packages/concierge-contracts";