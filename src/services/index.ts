// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Services Façade (4 layers, complete)
// Single navigable root for the service constitution.
// ═══════════════════════════════════════════════════════════════

// Layer 2 — Domain Services (canonical authority)
export * from "@/lib/core-services";

// Layer 4 — Read Models / Projections
export * from "@/lib/data-services";

// Layer 3 — OS Daemons (namespaced to avoid name collisions across ~33 daemons)
export * as OS from "@/lib/core-services/os-services";

// Layer 1 — Core Platform packages, namespaced to avoid name collision
export * as Platform from "@/packages";
