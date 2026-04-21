// ═══════════════════════════════════════════════════════════════
// SITA OS — Archive Retention Policy (Workstream B)
// Formal policy governing lifecycle of archived/deprecated files
// ═══════════════════════════════════════════════════════════════

export type RetentionCategory =
  | "active-wrapper"        // Wrapper still consumed — do not delete
  | "deprecated-pending"    // Marked deprecated, awaiting consumer migration
  | "historical-reference"  // Kept for documentation/learning value
  | "compliance-hold"       // Legal/compliance requirement to retain
  | "migration-artifact"    // Temporary migration file — delete after validation
  | "experiment"            // Experiment/spike — delete after review period
  | "dead-code";            // No references — eligible for immediate deletion

export interface RetentionRule {
  category: RetentionCategory;
  maxRetentionDays: number | null; // null = indefinite
  requiresApproval: boolean;
  approverRole: string;
  preDeleteChecks: string[];
  description: string;
}

export const RETENTION_RULES: readonly RetentionRule[] = [
  {
    category: "active-wrapper",
    maxRetentionDays: null,
    requiresApproval: true,
    approverRole: "architect",
    preDeleteChecks: [
      "Verify zero importers via code search",
      "Verify build succeeds without file",
      "Verify no dynamic imports reference path",
    ],
    description: "Wrapper still consumed by other modules. Must migrate all consumers before deletion.",
  },
  {
    category: "deprecated-pending",
    maxRetentionDays: 90,
    requiresApproval: true,
    approverRole: "architect",
    preDeleteChecks: [
      "Verify zero importers via code search",
      "Verify replacement service exists and is tested",
      "Verify no edge function references",
      "Verify build succeeds without file",
    ],
    description: "Service marked deprecated. Must be deleted within 90 days or converted to active-wrapper.",
  },
  {
    category: "historical-reference",
    maxRetentionDays: null,
    requiresApproval: false,
    approverRole: "team-lead",
    preDeleteChecks: [
      "Confirm useful content migrated to docs/",
      "Verify no operational dependency",
    ],
    description: "Retained for learning value. May be moved to docs/ at any time.",
  },
  {
    category: "compliance-hold",
    maxRetentionDays: null,
    requiresApproval: true,
    approverRole: "legal",
    preDeleteChecks: [
      "Confirm compliance requirement has expired",
      "Legal sign-off obtained",
    ],
    description: "Retained for legal/compliance reasons. Do not delete without legal approval.",
  },
  {
    category: "migration-artifact",
    maxRetentionDays: 30,
    requiresApproval: false,
    approverRole: "engineer",
    preDeleteChecks: [
      "Verify migration is complete",
      "Verify build succeeds without file",
    ],
    description: "Temporary file created during migration. Delete after validation window.",
  },
  {
    category: "experiment",
    maxRetentionDays: 14,
    requiresApproval: false,
    approverRole: "engineer",
    preDeleteChecks: [
      "Confirm experiment concluded",
      "Confirm no production dependency",
    ],
    description: "Experimental/spike code. Delete after review period.",
  },
  {
    category: "dead-code",
    maxRetentionDays: 0,
    requiresApproval: false,
    approverRole: "engineer",
    preDeleteChecks: [
      "Verify zero importers via code search",
      "Verify not referenced in config files",
      "Verify build succeeds without file",
    ],
    description: "No references found anywhere. Eligible for immediate deletion.",
  },
] as const;

// ── Policy helpers ──

export function getRuleForCategory(category: RetentionCategory): RetentionRule {
  const rule = RETENTION_RULES.find(r => r.category === category);
  if (!rule) throw new Error(`No retention rule for category: ${category}`);
  return rule;
}

export function isOverdue(retentionDeadline: string | null): boolean {
  if (!retentionDeadline) return false;
  return new Date(retentionDeadline) < new Date();
}

/**
 * Archive naming convention:
 * - Wrappers: Keep original name, add `@lovable:migrated-wrapper` comment
 * - Deprecated: Keep original name, add `@deprecated` JSDoc
 * - Legacy scripts: Move to scripts/legacy/ with original name
 * - Historical: Move to docs/archive/ with descriptive name
 *
 * Archive location convention:
 * - Active code wrappers: stay in-place (src/)
 * - Legacy scripts: scripts/legacy/
 * - Historical docs: docs/archive/
 * - Compliance: docs/compliance-archive/
 */
export const ARCHIVE_CONVENTIONS = {
  wrapperMarker: "@lovable:migrated-wrapper",
  deprecatedMarker: "@deprecated",
  legacyScriptDir: "scripts/legacy/",
  historicalDocDir: "docs/archive/",
  complianceDir: "docs/compliance-archive/",
} as const;