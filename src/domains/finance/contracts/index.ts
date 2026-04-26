// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Finance Domain: Contracts Barrel
//
// Single import surface for structural Finance OS contracts.
// Re-exports the curated `@/packages/finance-contracts` types so
// consumers (services, modules, UI) only need to import from
// `@/domains/finance`.
//
// Rule: domain depends on nothing. This file MUST only re-export
// from the contracts package and never import runtime code.
// ═══════════════════════════════════════════════════════════════

export * from "@/packages/finance-contracts";