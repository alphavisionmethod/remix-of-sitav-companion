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
  // Components → Features
  "src/components/sita/",           // → src/runtimes/shell/ or src/features/
  "src/components/admin-ai/",       // → src/admin/modules/ai/
  "src/components/admin-os/",       // → src/admin/modules/runtime/
  "src/components/admin/",          // → src/admin/
  "src/components/cloud/",          // → src/features/cloud/
  "src/components/autopilot/",      // → src/features/business/autopilot/
  "src/components/simulation/",     // → src/features/simulation/
  "src/components/reality/",        // → src/runtimes/reality/
  "src/components/platform/",       // → src/platform/
  "src/components/user-app/",       // → src/features/home/
  "src/components/finance/",        // → src/features/money/
  "src/components/investment/",     // → src/features/investment-office/
  "src/components/mobile/",         // → src/runtimes/mobile/
  "src/components/notifications/",  // → src/features/notifications/
  "src/components/revenue-office/", // → src/features/revenue-office/
  "src/components/advisors/",       // → src/features/advisors/
  "src/components/business/",       // → src/features/business/
  "src/components/concierge/",      // → src/features/concierge/
  "src/components/files/",          // → src/features/files/
  "src/components/governance/",     // → src/platform/governance/
  "src/components/intelligence/",   // → src/features/intelligence/
  "src/components/money/",          // → src/features/money/
  "src/components/auth/",           // → src/features/auth/
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
