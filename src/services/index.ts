// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Services Façade
// Single navigable root for the 5-layer service constitution.
// Replaces the "scattered across src/lib/* and src/packages/*"
// finding from PROJECT_TREE_AUDIT.md Section A item #2.
//
// Layering (per memory/architecture/service-constitution):
//   Layer 1 — Core Platform     → src/packages/*
//   Layer 2 — Domain Services   → src/lib/core-services/
//   Layer 3 — Integration       → src/integrations/*
//   Layer 4 — Read Models       → src/lib/data-services/
//   Layer 5 — UI Clients        → src/lib/os-services/
// ═══════════════════════════════════════════════════════════════

// Layer 2 — Domain Services (canonical authority)
export * from "@/lib/core-services";

// Layer 4 — Read Models / Projections
export * from "@/lib/data-services";

// Layer 5 — OS-bound service clients
export * from "@/lib/os-services";

// Layer 1 — Core Platform packages, namespaced to avoid name collision
export * as Platform from "@/packages";
