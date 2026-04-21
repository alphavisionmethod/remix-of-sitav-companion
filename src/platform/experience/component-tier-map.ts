// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Tier Map
// Maps component families to visual tiers they appear in.
// ═══════════════════════════════════════════════════════════════

import type { VisualTierId } from "./visual-tier-system";

export interface ComponentTierEntry {
  readonly familyId: string;
  readonly tiers: readonly VisualTierId[];
  readonly hasTierVariants: boolean;
  readonly notes: string;
}

export const COMPONENT_TIER_MAP: readonly ComponentTierEntry[] = [
  { familyId: "cards",                tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Same card grammar across app and admin" },
  { familyId: "heroes",              tiers: ["TIER_PRODUCT_APP"],                                                hasTierVariants: false, notes: "App-only; not used in shell or admin" },
  { familyId: "summaries",           tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Shared summary component" },
  { familyId: "panels",              tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],   hasTierVariants: true,  notes: "Shell panels use glass material; app/admin use solid" },
  { familyId: "stat-tiles",          tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Shared KPI tile" },
  { familyId: "status-badges",       tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN", "TIER_DEGRADED_RECOVERY"], hasTierVariants: false, notes: "Universal status badge" },
  { familyId: "trust-badges",        tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_SUPPORT_TRUST"],    hasTierVariants: false, notes: "Shared trust badge; placement per trust-visual-grammar" },
  { familyId: "urgency-badges",      tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Priority indicator" },
  { familyId: "proof-badges",        tiers: ["TIER_SUPPORT_TRUST"],                                              hasTierVariants: false, notes: "Trust-tier only" },
  { familyId: "freshness-badges",    tiers: ["TIER_PRODUCT_APP"],                                                hasTierVariants: false, notes: "App-only freshness indicator" },
  { familyId: "mode-badges",         tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP"],                          hasTierVariants: false, notes: "Mode indicator" },
  { familyId: "ai-truth-disclosures", tiers: ["TIER_SUPPORT_TRUST"],                                            hasTierVariants: false, notes: "Trust-tier AI disclosure" },
  { familyId: "provenance-chips",    tiers: ["TIER_SUPPORT_TRUST"],                                              hasTierVariants: false, notes: "Trust-tier provenance" },
  { familyId: "empty-states",        tiers: ["TIER_PRODUCT_APP", "TIER_DEGRADED_RECOVERY"],                     hasTierVariants: false, notes: "Shared empty state" },
  { familyId: "skeletons",           tiers: ["TIER_PRODUCT_APP", "TIER_DEGRADED_RECOVERY"],                     hasTierVariants: false, notes: "Loading skeleton" },
  { familyId: "needs-data-explainers", tiers: ["TIER_PRODUCT_APP"],                                             hasTierVariants: false, notes: "App-only prerequisite explainer" },
  { familyId: "evidence-links",      tiers: ["TIER_SUPPORT_TRUST"],                                              hasTierVariants: false, notes: "Trust-tier evidence drilldown" },
  { familyId: "operator-action-panels", tiers: ["TIER_OPERATOR_ADMIN"],                                         hasTierVariants: false, notes: "Admin-only action panel" },
  { familyId: "drawers",             tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP"],                          hasTierVariants: true,  notes: "Shell drawers use glass; app drawers use solid" },
  { familyId: "timeline-rows",       tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Shared timeline row" },
  { familyId: "buttons",             tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN", "TIER_SUPPORT_TRUST", "TIER_DEGRADED_RECOVERY"], hasTierVariants: false, notes: "Universal button" },
  { familyId: "dialogs",             tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],   hasTierVariants: false, notes: "Shared dialog chrome" },
  { familyId: "tables",              tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: true,  notes: "Admin tables are denser" },
  { familyId: "forms",               tiers: ["TIER_PRODUCT_APP", "TIER_OPERATOR_ADMIN"],                        hasTierVariants: false, notes: "Shared form controls" },
  { familyId: "toasts",              tiers: ["TIER_SYSTEM_SHELL", "TIER_PRODUCT_APP"],                          hasTierVariants: false, notes: "Shared toast / notification" },
] as const;

export const COMPONENT_TIER_MAP_COUNT = COMPONENT_TIER_MAP.length;