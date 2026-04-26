// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Business Domain: Contracts Barrel
//
// Single import surface for structural Business OS contracts.
// Re-exports the curated `@/packages/business-contracts` types so
// consumers (engines, services, modules) only need to import from
// `@/domains/business`.
//
// Rule: domain depends on nothing. This file MUST only re-export
// from the contracts package and never import runtime code.
// ═══════════════════════════════════════════════════════════════

export * from "@/packages/business-contracts";
