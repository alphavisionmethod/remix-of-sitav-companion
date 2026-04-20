// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Canonical Map
// Single source of truth for all component families.
// ═══════════════════════════════════════════════════════════════

export type MigrationStatus = "canonical" | "migrating" | "deprecated" | "removed";
export type GrammarRole = "display" | "status" | "feedback" | "action" | "overlay" | "layout" | "navigation" | "data" | "trust";

export interface ComponentFamilyEntry {
  readonly familyId: string;
  readonly canonicalPaths: readonly string[];
  readonly deprecatedPaths: readonly string[];
  readonly purpose: string;
  readonly grammarRole: GrammarRole;
  readonly trustSensitive: boolean;
  readonly owner: string;
  readonly migrationStatus: MigrationStatus;
  readonly usageGuidance: string;
}

export const COMPONENT_CANONICAL_MAP: readonly ComponentFamilyEntry[] = [
  // ── Display Primitives ───────────────────────────────────────
  {
    familyId: "cards",
    canonicalPaths: ["src/components/primitives/display/BaseCard.tsx"],
    deprecatedPaths: [],
    purpose: "Bounded content containers for all domain cards",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "All domain *Card components MUST compose BaseCard.",
  },
  {
    familyId: "heroes",
    canonicalPaths: ["src/components/primitives/display/Hero.tsx"],
    deprecatedPaths: [],
    purpose: "Page-level hero banners",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for page-level introductory sections.",
  },
  {
    familyId: "summaries",
    canonicalPaths: ["src/components/primitives/display/Summary.tsx"],
    deprecatedPaths: [],
    purpose: "Compact data summaries",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for concise metric/text summaries in dashboards.",
  },
  {
    familyId: "panels",
    canonicalPaths: ["src/components/primitives/display/Panel.tsx"],
    deprecatedPaths: [],
    purpose: "Sectioned content panels",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for titled content sections within pages.",
  },
  {
    familyId: "stat-tiles",
    canonicalPaths: ["src/components/primitives/display/StatTile.tsx"],
    deprecatedPaths: [],
    purpose: "Numeric KPI tiles",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for single-metric display in grids.",
  },

  // ── Status Primitives ────────────────────────────────────────
  {
    familyId: "status-badges",
    canonicalPaths: ["src/components/primitives/status/StatusBadge.tsx"],
    deprecatedPaths: ["src/components/sita/admin/StatusBadge.tsx"],
    purpose: "Compact status labels with tone",
    grammarRole: "status",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives. Migrate admin copy.",
  },
  {
    familyId: "trust-badges",
    canonicalPaths: ["src/components/primitives/status/TrustBadge.tsx"],
    deprecatedPaths: ["src/components/sita/TrustBadge.tsx", "src/components/sita/badges/TrustBadge.tsx"],
    purpose: "4-state trust indicators",
    grammarRole: "trust",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives. Legacy 9-level/3-level wrappers remain during migration.",
  },
  {
    familyId: "urgency-badges",
    canonicalPaths: ["src/components/primitives/status/UrgencyBadge.tsx"],
    deprecatedPaths: ["src/components/sita/badges/UrgencyBadge.tsx"],
    purpose: "Priority/urgency level indicators",
    grammarRole: "status",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives.",
  },
  {
    familyId: "proof-badges",
    canonicalPaths: ["src/components/primitives/status/ProofBadge.tsx"],
    deprecatedPaths: ["src/components/sita/badges/ProofBadge.tsx"],
    purpose: "Cryptographic proof status",
    grammarRole: "trust",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives.",
  },
  {
    familyId: "freshness-badges",
    canonicalPaths: ["src/components/primitives/status/FreshnessBadge.tsx"],
    deprecatedPaths: ["src/components/sita/badges/FreshnessBadge.tsx"],
    purpose: "Data freshness/staleness indicators",
    grammarRole: "status",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives.",
  },
  {
    familyId: "mode-badges",
    canonicalPaths: ["src/components/primitives/status/ModeBadge.tsx"],
    deprecatedPaths: ["src/components/sita/badges/ModeBadge.tsx"],
    purpose: "Operating mode indicator (live/demo/degraded)",
    grammarRole: "status",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives.",
  },
  {
    familyId: "ai-truth-disclosures",
    canonicalPaths: ["src/components/primitives/status/AITruthDisclosure.tsx"],
    deprecatedPaths: [],
    purpose: "AI-generated/AI-assisted content disclosure",
    grammarRole: "trust",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Required on all AI-generated surfaces per truth-surface-registry.",
  },
  {
    familyId: "provenance-chips",
    canonicalPaths: ["src/components/primitives/status/ProvenanceChip.tsx"],
    deprecatedPaths: [],
    purpose: "Data source + last-verified provenance labels",
    grammarRole: "trust",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use on cards/summaries to show truth-source.",
  },

  // ── Feedback Primitives ──────────────────────────────────────
  {
    familyId: "empty-states",
    canonicalPaths: ["src/components/primitives/feedback/EmptyState.tsx"],
    deprecatedPaths: ["src/components/sita/EmptyState.tsx"],
    purpose: "Empty data set placeholder with action",
    grammarRole: "feedback",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "migrating",
    usageGuidance: "Import from @/components/primitives.",
  },
  {
    familyId: "skeletons",
    canonicalPaths: ["src/components/primitives/feedback/Skeleton.tsx"],
    deprecatedPaths: [],
    purpose: "Loading placeholder skeletons",
    grammarRole: "feedback",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for async data loading. shadcn ui/skeleton is the underlying lib.",
  },
  {
    familyId: "needs-data-explainers",
    canonicalPaths: [
      "src/components/primitives/feedback/NeedsDataExplainer.tsx",
      "src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx",
      "src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx",
    ],
    deprecatedPaths: [],
    purpose: "Contextual explainers for missing prerequisite data",
    grammarRole: "feedback",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use when a page cannot render due to prerequisite data.",
  },

  // ── Action Primitives ────────────────────────────────────────
  {
    familyId: "evidence-links",
    canonicalPaths: ["src/components/primitives/actions/EvidenceLink.tsx"],
    deprecatedPaths: [],
    purpose: "Drilldown affordance to underlying evidence",
    grammarRole: "trust",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use instead of ad-hoc Link+Button combos for evidence drilldown.",
  },
  {
    familyId: "operator-action-panels",
    canonicalPaths: ["src/components/primitives/actions/OperatorActionPanel.tsx"],
    deprecatedPaths: [],
    purpose: "Grouped operator actions with safety classification",
    grammarRole: "action",
    trustSensitive: true,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for admin/operator action groups.",
  },

  // ── Overlay Primitives ───────────────────────────────────────
  {
    familyId: "drawers",
    canonicalPaths: ["src/components/primitives/overlays/Drawer.tsx"],
    deprecatedPaths: [],
    purpose: "Slide-out detail panels",
    grammarRole: "overlay",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Composes shadcn Sheet. Use for side-panel details.",
  },

  // ── Timeline Primitives ──────────────────────────────────────
  {
    familyId: "timeline-rows",
    canonicalPaths: ["src/components/primitives/timelines/TimelineRow.tsx"],
    deprecatedPaths: [],
    purpose: "Chronological event display rows",
    grammarRole: "display",
    trustSensitive: false,
    owner: "platform",
    migrationStatus: "canonical",
    usageGuidance: "Use for event/activity timelines.",
  },

  // ── UI Library (shadcn) ──────────────────────────────────────
  {
    familyId: "buttons",
    canonicalPaths: ["src/components/ui/button.tsx"],
    deprecatedPaths: [],
    purpose: "Primary interactive affordance",
    grammarRole: "action",
    trustSensitive: false,
    owner: "ui-lib",
    migrationStatus: "canonical",
    usageGuidance: "Import from @/components/ui/button.",
  },
  {
    familyId: "dialogs",
    canonicalPaths: ["src/components/ui/dialog.tsx", "src/components/ui/alert-dialog.tsx"],
    deprecatedPaths: [],
    purpose: "Modal dialogs and confirmation prompts",
    grammarRole: "overlay",
    trustSensitive: false,
    owner: "ui-lib",
    migrationStatus: "canonical",
    usageGuidance: "Import from @/components/ui/dialog or alert-dialog.",
  },
  {
    familyId: "tables",
    canonicalPaths: ["src/components/ui/table.tsx"],
    deprecatedPaths: [],
    purpose: "Data tables",
    grammarRole: "data",
    trustSensitive: false,
    owner: "ui-lib",
    migrationStatus: "canonical",
    usageGuidance: "Import from @/components/ui/table.",
  },
  {
    familyId: "forms",
    canonicalPaths: ["src/components/ui/form.tsx", "src/components/ui/input.tsx", "src/components/ui/textarea.tsx", "src/components/ui/select.tsx"],
    deprecatedPaths: [],
    purpose: "Form fields and input controls",
    grammarRole: "data",
    trustSensitive: false,
    owner: "ui-lib",
    migrationStatus: "canonical",
    usageGuidance: "Import from @/components/ui/form.",
  },
  {
    familyId: "toasts",
    canonicalPaths: ["src/components/ui/toast.tsx", "src/components/ui/sonner.tsx"],
    deprecatedPaths: [],
    purpose: "Ephemeral notification toasts",
    grammarRole: "feedback",
    trustSensitive: false,
    owner: "ui-lib",
    migrationStatus: "canonical",
    usageGuidance: "Use sonner for toast notifications.",
  },
] as const;

/** Total canonical families. */
export const CANONICAL_FAMILY_COUNT = COMPONENT_CANONICAL_MAP.length;

/** Families still migrating from deprecated paths. */
export function getMigratingFamilies(): readonly ComponentFamilyEntry[] {
  return COMPONENT_CANONICAL_MAP.filter(f => f.migrationStatus === "migrating");
}

/** All deprecated paths across all families. */
export function getAllDeprecatedPaths(): string[] {
  return COMPONENT_CANONICAL_MAP.flatMap(f => [...f.deprecatedPaths]);
}

/** All canonical paths across all families. */
export function getAllCanonicalPaths(): string[] {
  return COMPONENT_CANONICAL_MAP.flatMap(f => [...f.canonicalPaths]);
}

/** Trust-sensitive families requiring truth primitives. */
export function getTrustSensitiveFamilies(): readonly ComponentFamilyEntry[] {
  return COMPONENT_CANONICAL_MAP.filter(f => f.trustSensitive);
}

/** Look up family by path. */
export function findFamilyByPath(filePath: string): ComponentFamilyEntry | undefined {
  const normalized = filePath.replace(/\\/g, "/");
  return COMPONENT_CANONICAL_MAP.find(
    f => f.canonicalPaths.includes(normalized) || f.deprecatedPaths.includes(normalized),
  );
}