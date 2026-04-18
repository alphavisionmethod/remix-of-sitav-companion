// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain System Barrel
// ═══════════════════════════════════════════════════════════════

export * from "./domain-manifest";
export * from "./domain-registry";
export * from "./domain-completeness";
export * from "./shell-command-provider";
export * from "./manifests/cross-domain-manifest";

// Re-export individual manifests for direct access
export { businessManifest } from "./manifests/business-manifest";
export { financeManifest } from "./manifests/finance-manifest";
export { conciergeManifest } from "./manifests/concierge-manifest";
export { platformManifest } from "./manifests/platform-manifest";
