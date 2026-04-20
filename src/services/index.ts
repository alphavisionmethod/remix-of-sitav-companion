// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Services Façade
// Single navigable root for the 5-layer service constitution.
// Replaces the "scattered across src/lib/* and src/packages/*"
// finding from PROJECT_TREE_AUDIT.md Section A item #2.
// ═══════════════════════════════════════════════════════════════

// Layer 2 — Domain Services (canonical authority)
export * from "@/lib/core-services";

// Layer 4 — Read Models / Projections
export * from "@/lib/data-services";

// Layer 1 — Core Platform packages, namespaced to avoid name collision
export * as Platform from "@/packages";
