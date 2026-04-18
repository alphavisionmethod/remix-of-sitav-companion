// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecation Map
// Tracks the lifecycle of every wrapper / shim that exists for
// backward compatibility. Each row records the canonical target,
// removal eligibility, and known dependent count.
// ═══════════════════════════════════════════════════════════════

export type DeprecationStatus =
  | "ACTIVE"               // wrapper still in use; do not remove
  | "MIGRATING"            // dependents being rewired
  | "READY_TO_REMOVE"      // zero dependents — safe to delete
  | "REMOVED";             // already gone

export interface DeprecationEntry {
  /** Path of the legacy/wrapper file (relative to repo root). */
  legacyPath: string;
  /** Canonical replacement import. */
  canonicalImport: string;
  /** Lifecycle status. */
  status: DeprecationStatus;
  /** Number of source files still importing from the legacy path. */
  knownDependents: number;
  /** Brief deprecation reason. */
  reason: string;
}

export const DEPRECATION_MAP: DeprecationEntry[] = [
  { legacyPath: "src/lib/services/approval-engine/index.ts",       canonicalImport: "@/lib/core-services/approval-engine",       status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat with services/ barrel" },
  { legacyPath: "src/lib/services/brain-core/index.ts",            canonicalImport: "@/lib/core-services/brain-core",            status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/conscience-gate/index.ts",       canonicalImport: "@/lib/core-services/conscience-gate",       status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/constitution-compiler/index.ts", canonicalImport: "@/lib/core-services/constitution-compiler", status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/immune-controller/index.ts",     canonicalImport: "@/lib/core-services/self-healing",          status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — points into self-healing cluster" },
  { legacyPath: "src/lib/services/inference-gateway/index.ts",     canonicalImport: "@/lib/core-services/inference-gateway",     status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/lease-manager/index.ts",         canonicalImport: "@/lib/core-services/lease-manager",         status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/mnemosyne/index.ts",             canonicalImport: "@/lib/core-services/mnemosyne",             status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/model-router/index.ts",          canonicalImport: "@/lib/core-services/model-router",          status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
  { legacyPath: "src/lib/services/trust-governor/index.ts",        canonicalImport: "@/lib/core-services/trust-governor",        status: "ACTIVE", knownDependents: -1, reason: "Re-export shim — kept for compat" },
];

export const DEPRECATION_SUMMARY = {
  total: DEPRECATION_MAP.length,
  active: DEPRECATION_MAP.filter(d => d.status === "ACTIVE").length,
  migrating: DEPRECATION_MAP.filter(d => d.status === "MIGRATING").length,
  readyToRemove: DEPRECATION_MAP.filter(d => d.status === "READY_TO_REMOVE").length,
  removed: DEPRECATION_MAP.filter(d => d.status === "REMOVED").length,
};
