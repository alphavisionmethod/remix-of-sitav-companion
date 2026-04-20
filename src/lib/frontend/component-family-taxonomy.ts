// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Family Taxonomy
// Classification layer and grammar role mapping.
// ═══════════════════════════════════════════════════════════════

export type ComponentLayer = "PRIMITIVE" | "DOMAIN" | "SURFACE" | "LIB_UI";
export type GrammarRole = "display" | "status" | "feedback" | "action" | "overlay" | "layout" | "navigation" | "data" | "trust";

export interface TaxonomyEntry {
  readonly familyId: string;
  readonly layer: ComponentLayer;
  readonly grammarRole: GrammarRole;
  readonly description: string;
}

export const COMPONENT_TAXONOMY: readonly TaxonomyEntry[] = [
  // PRIMITIVE layer — visual building blocks
  { familyId: "cards",                layer: "PRIMITIVE", grammarRole: "display",  description: "Bounded content containers" },
  { familyId: "heroes",              layer: "PRIMITIVE", grammarRole: "display",  description: "Page-level hero banners" },
  { familyId: "summaries",           layer: "PRIMITIVE", grammarRole: "display",  description: "Compact data summaries" },
  { familyId: "panels",              layer: "PRIMITIVE", grammarRole: "display",  description: "Sectioned content panels" },
  { familyId: "stat-tiles",          layer: "PRIMITIVE", grammarRole: "display",  description: "Numeric KPI tiles" },
  { familyId: "status-badges",       layer: "PRIMITIVE", grammarRole: "status",   description: "Compact status labels" },
  { familyId: "trust-badges",        layer: "PRIMITIVE", grammarRole: "trust",    description: "Trust state indicators" },
  { familyId: "urgency-badges",      layer: "PRIMITIVE", grammarRole: "status",   description: "Priority indicators" },
  { familyId: "proof-badges",        layer: "PRIMITIVE", grammarRole: "trust",    description: "Proof state indicators" },
  { familyId: "freshness-badges",    layer: "PRIMITIVE", grammarRole: "status",   description: "Data freshness indicators" },
  { familyId: "mode-badges",         layer: "PRIMITIVE", grammarRole: "status",   description: "Mode indicators" },
  { familyId: "ai-truth-disclosures", layer: "PRIMITIVE", grammarRole: "trust",   description: "AI disclosure primitives" },
  { familyId: "provenance-chips",    layer: "PRIMITIVE", grammarRole: "trust",    description: "Data provenance labels" },
  { familyId: "empty-states",        layer: "PRIMITIVE", grammarRole: "feedback", description: "Empty data placeholders" },
  { familyId: "skeletons",           layer: "PRIMITIVE", grammarRole: "feedback", description: "Loading skeletons" },
  { familyId: "needs-data-explainers", layer: "PRIMITIVE", grammarRole: "feedback", description: "Prerequisite data explainers" },
  { familyId: "evidence-links",      layer: "PRIMITIVE", grammarRole: "trust",    description: "Evidence drilldown links" },
  { familyId: "operator-action-panels", layer: "PRIMITIVE", grammarRole: "action", description: "Operator action groups" },
  { familyId: "drawers",             layer: "PRIMITIVE", grammarRole: "overlay",  description: "Slide-out panels" },
  { familyId: "timeline-rows",       layer: "PRIMITIVE", grammarRole: "display",  description: "Chronological rows" },

  // LIB_UI layer — shadcn components
  { familyId: "buttons",             layer: "LIB_UI",    grammarRole: "action",   description: "Interactive buttons" },
  { familyId: "dialogs",             layer: "LIB_UI",    grammarRole: "overlay",  description: "Modal dialogs" },
  { familyId: "tables",              layer: "LIB_UI",    grammarRole: "data",     description: "Data tables" },
  { familyId: "forms",               layer: "LIB_UI",    grammarRole: "data",     description: "Form controls" },
  { familyId: "toasts",              layer: "LIB_UI",    grammarRole: "feedback", description: "Notification toasts" },
] as const;

/** Families by grammar role. */
export function familiesByRole(role: GrammarRole): readonly TaxonomyEntry[] {
  return COMPONENT_TAXONOMY.filter(t => t.grammarRole === role);
}

/** Families by layer. */
export function familiesByLayer(layer: ComponentLayer): readonly TaxonomyEntry[] {
  return COMPONENT_TAXONOMY.filter(t => t.layer === layer);
}

/** Trust-related families. */
export function trustFamilies(): readonly TaxonomyEntry[] {
  return familiesByRole("trust");
}