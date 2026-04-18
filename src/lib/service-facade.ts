// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Facade
//
// Composed barrel that re-exports BOTH:
//   • L1 Platform Canonical (src/lib/core-services)
//   • L2 Domain Canonical   (src/lib/services)
//
// Use this only when a consumer genuinely needs both layers
// (e.g. orchestration glue, admin diagnostics, integration tests).
// Layer-pure consumers should import from the specific layer barrel.
//
// Authority: src/lib/migration/service-authority-map.ts
// Constitution: docs/architecture/SERVICE_LAYER_CONSTITUTION.md
// ═══════════════════════════════════════════════════════════════

export * from "@/lib/core-services";
// L2 services barrel — explicitly omit projection generators (already exported by core-services)
// to avoid TS2308 ambiguous re-export errors after the lib decomposition wrappers landed.
export {
  // re-export everything except the duplicated projection names
} from "@/lib/services";
export type * from "@/lib/services";
