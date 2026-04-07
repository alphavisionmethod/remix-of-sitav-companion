// ═══════════════════════════════════════════════════════════════
// SITA OS — Package Barrel Export
// Single entry point for all contract packages
//
// COLLISION NOTE: Several sibling packages define types with names
// that overlap with @sita-os/contracts. Those packages are imported
// directly by consumers (e.g., import from "@/packages/finance-contracts")
// rather than through this barrel to avoid ambiguity.
// ═══════════════════════════════════════════════════════════════

// Core contracts — canonical shared contract layer
export * from "./contracts";

// Non-colliding sibling packages
export * from "./shell-grammar";
export * from "./design-tokens";
export * from "./database-schemas";
export * from "./workflow-primitives";
export * from "./auth";
export * from "./feature-flags";
export * from "./entitlements";
export * from "./client-sdk";
export * from "./pack-manifests";
export * from "./store-metadata";
export * from "./template-registry";
export * from "./microinteraction-engine";

// Colliding sibling packages — import directly from their paths:
//   @/packages/advisor-config
//   @/packages/business-contracts
//   @/packages/finance-contracts
//   @/packages/concierge-contracts
//   @/packages/policy-contracts
//   @/packages/event-types
//   @/packages/proof-model
//   @/packages/telemetry
//   @/packages/feature-governance
//   @/packages/moat-contracts
//   @/packages/enterprise-contracts
//   @/packages/reality-contracts
//   @/packages/audit-contracts
//   @/packages/boardroom-contracts
