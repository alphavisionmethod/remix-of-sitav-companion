// ═══════════════════════════════════════════════════════════════
// SITA OS — Information Architecture Governance
// Enforces canonical directory structure and route limits.
// ═══════════════════════════════════════════════════════════════

import { DIRECTORY_ORGANIZATION_MAP, type DirectoryMapping } from "./directory-organization-map";

// ── Hard Limits ──
export const MAX_USER_TOP_LEVEL = 12;
export const MAX_ADMIN_TOP_LEVEL = 12;

// ── Canonical Page Classifications ──
export type PageClassification =
  | "overview"
  | "board"
  | "dashboard"
  | "console"
  | "center"
  | "workspace"
  | "explorer"
  | "studio"
  | "settings"
  | "timeline"
  | "detail";

// ── Deprecated Path Prefixes ──
// New files should NOT be created under these paths.
// Use the canonical path from DIRECTORY_ORGANIZATION_MAP instead.
const DEPRECATED_NEW_FILE_PATHS = [
  "src/components/sita/",       // → src/runtimes/shell/ or src/features/
  "src/components/admin-ai/",   // → src/admin/modules/ai/
  "src/components/admin-os/",   // → src/admin/modules/runtime/
];

/**
 * Validate that a new file path follows canonical directory organization.
 * Returns warnings (not errors) — this is advisory for now.
 */
export function validateDirectoryOrganization(filePath: string): string[] {
  const warnings: string[] = [];

  for (const deprecated of DEPRECATED_NEW_FILE_PATHS) {
    if (filePath.startsWith(deprecated)) {
      const mapping = DIRECTORY_ORGANIZATION_MAP.find(m =>
        m.legacyPaths.some(lp => filePath.startsWith(lp.replace("*", "")))
      );
      const suggestion = mapping?.canonicalPath ?? "the appropriate canonical path";
      warnings.push(
        `New file "${filePath}" is in deprecated path "${deprecated}". ` +
        `Use "${suggestion}" instead.`
      );
    }
  }

  return warnings;
}

/**
 * Get all barrel mappings for audit purposes.
 */
export function getOrganizationAudit(): {
  total: number;
  barrelOnly: number;
  physicallyMoved: number;
  mappings: DirectoryMapping[];
} {
  const barrelOnly = DIRECTORY_ORGANIZATION_MAP.filter(m => m.status === "barrel-only").length;
  const physicallyMoved = DIRECTORY_ORGANIZATION_MAP.filter(m => m.status === "physically-moved").length;

  return {
    total: DIRECTORY_ORGANIZATION_MAP.length,
    barrelOnly,
    physicallyMoved,
    mappings: DIRECTORY_ORGANIZATION_MAP,
  };
}
