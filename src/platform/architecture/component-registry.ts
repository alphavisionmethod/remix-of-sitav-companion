// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Registry (Canonical Truth)
// Auto-derived from generated/component-registry.json
//
// This file is the typed entry point used by:
//   - check-component-classification.ts
//   - check-duplicate-families.ts
//   - check-deprecated-wrappers.ts
//
// Re-generate underlying JSON via:
//   npx tsx scripts/architecture/audit-components.ts
// ═══════════════════════════════════════════════════════════════

export type ComponentClassification =
  | "PRIMITIVE"
  | "DOMAIN"
  | "SURFACE"
  | "PRIVATE_HELPER"
  | "DEPRECATED_WRAPPER"
  | "UI_LIB";

export type ComponentFamily =
  | "card"
  | "badge"
  | "shell"
  | "panel"
  | "drawer"
  | "overlay"
  | "hero"
  | "summary"
  | "timeline"
  | "list"
  | "table"
  | "inspector"
  | "console"
  | "board"
  | "tile"
  | "row"
  | "other";

export interface ComponentRegistryEntry {
  path: string;
  name: string;
  classification: ComponentClassification;
  domain: string;
  family: ComponentFamily;
  duplicateGroupId: string | null;
  isWrapper: boolean;
}

/**
 * Canonical primitive paths.
 * Any component matching these exactly is the single source of truth.
 */
export const CANONICAL_PRIMITIVES = {
  // display
  BaseCard:        "src/components/primitives/display/BaseCard.tsx",
  Hero:            "src/components/primitives/display/Hero.tsx",
  Summary:         "src/components/primitives/display/Summary.tsx",
  Panel:           "src/components/primitives/display/Panel.tsx",
  StatTile:        "src/components/primitives/display/StatTile.tsx",
  // status
  StatusBadge:     "src/components/primitives/status/StatusBadge.tsx",
  TrustBadge:      "src/components/primitives/status/TrustBadge.tsx",
  UrgencyBadge:    "src/components/primitives/status/UrgencyBadge.tsx",
  ProofBadge:      "src/components/primitives/status/ProofBadge.tsx",
  FreshnessBadge:  "src/components/primitives/status/FreshnessBadge.tsx",
  ModeBadge:       "src/components/primitives/status/ModeBadge.tsx",
  // feedback
  EmptyState:      "src/components/primitives/feedback/EmptyState.tsx",
  Skeleton:        "src/components/primitives/feedback/Skeleton.tsx",
  // overlays
  Drawer:          "src/components/primitives/overlays/Drawer.tsx",
  // timelines
  TimelineRow:     "src/components/primitives/timelines/TimelineRow.tsx",
} as const;

/**
 * Family-specific suffix grammar enforced by check-component-classification.ts
 */
export const VALID_SUFFIXES = [
  "Card", "Badge", "Pill", "Chip",
  "Panel", "Drawer", "Sheet", "Dialog", "Modal",
  "Shell", "Layout", "Wrapper",
  "Hero", "Summary", "Inspector", "Console",
  "Board", "Workspace",
  "Timeline", "List", "Table", "Tile", "Row",
  "EmptyState", "Skeleton",
  "Header", "Footer", "Section", "Sections", "Bar", "Bars", "Strip", "Menu", "Rail",
  "Widget", "Terminal", "Picker", "Center", "Feed",
  "Form", "Field", "Input", "Button", "Link",
  "Provider", "Context", "Boundary",
  "View", "Page", "Surface", "Window", "Theater",
  "Avatar", "Icon", "Logo", "Image",
  "Chart", "Graph", "Map", "Grid", "Tree",
  "Indicator", "Banner", "Disclosure", "Scorecard", "Preview",
  "Stepper", "Progress", "Status", "State",
  "Group", "Stack", "Flex", "Box", "Container",
] as const;

/**
 * Forbidden imports per classification.
 */
export const PURITY_RULES: Record<ComponentClassification, RegExp[]> = {
  PRIMITIVE: [
    /\/lib\/services\//,
    /\/lib\/engines\//,
    /\/lib\/orchestrat/,
    /\/integrations\/supabase\//,
    /\/hooks\//,
    /\/components\/domain\//,
    /\/components\/surfaces\//,
    /\/pages\//,
  ],
  DOMAIN: [
    /\/pages\//,
    /\/components\/surfaces\//,
  ],
  SURFACE: [],
  PRIVATE_HELPER: [],
  DEPRECATED_WRAPPER: [],
  UI_LIB: [
    /\/lib\/services\//,
    /\/integrations\/supabase\//,
    /\/hooks\//,
  ],
};

/**
 * Load the auto-generated registry. Used by governance scripts.
 * Throws if the registry has not been generated.
 */
export function loadComponentRegistry(): {
  generatedAt: string;
  stats: Record<string, unknown>;
  records: ComponentRegistryEntry[];
} {
  // Imported lazily so this module stays usable in browser bundles for type info.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require("fs");
  const path = "generated/component-registry.json";
  if (!fs.existsSync(path)) {
    throw new Error(
      `Component registry not found at ${path}. ` +
      `Run: npx tsx scripts/architecture/audit-components.ts`
    );
  }
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}
