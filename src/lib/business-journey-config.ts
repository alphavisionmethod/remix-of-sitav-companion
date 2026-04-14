/**
 * Maps business types to which sidebar items should be visible.
 * Items in `base` are always shown. Items in type-specific sets are added
 * when the user has that business type selected.
 */

const BASE_ITEMS = new Set([
  "overview", "crm-home", "crm-contacts", "crm-companies", "crm-pipeline",
  "crm-health", "crm-timeline", "crm-communications", "crm-tasks", "crm-notes",
  "crm-segments", "crm-automations", "crm-import", "crm-duplicates", "crm-advisor",
  "crm-fields", "integrations", "customers", "follow-through", "operations",
  "communications", "documents", "boardroom", "proof", "advisors",
  "pipeline-health", "business-profile", "profile-evolution", "workflow-templates",
  "boardroom-agenda", "revenue-impact", "kpi-dashboard", "revenue-forecast",
  "adaptive-home", "business-settings", "customer-health",
]);

const TYPE_ITEMS: Record<string, string[]> = {
  ecommerce: ["ecommerce", "website-builder", "social", "lead-recovery", "revenue-autopilot", "autopilot-hub"],
  local: ["appointments", "support", "leads", "follow-through", "lead-recovery"],
  service: ["quotes", "invoices", "collections", "proposals", "leads", "opportunities", "playbook-builder"],
  agency: ["quotes", "invoices", "collections", "proposals", "leads", "opportunities", "playbook-builder", "social"],
  coaching: ["appointments", "leads", "opportunities", "revenue-autopilot", "autopilot-hub"],
  saas: ["revenue-autopilot", "autopilot-hub", "leads", "opportunities", "playbook-builder", "website-builder"],
  creator: ["social", "website-builder", "revenue-autopilot", "autopilot-hub", "ecommerce"],
  marketplace: ["ecommerce", "leads", "opportunities", "revenue-autopilot", "website-builder"],
  membership: ["revenue-autopilot", "autopilot-hub", "leads", "opportunities", "lead-recovery"],
  hybrid: ["quotes", "invoices", "ecommerce", "leads", "opportunities", "appointments", "revenue-autopilot", "autopilot-hub", "social", "website-builder"],
  evolving: ["leads", "opportunities", "revenue-autopilot", "autopilot-hub", "website-builder"],
};

/**
 * Given a list of selected business types, returns the set of sidebar item IDs that should be visible.
 * If no types are selected, all items are visible (no filtering).
 */
export function getVisibleSidebarItems(businessTypes: string[]): Set<string> | null {
  if (!businessTypes || businessTypes.length === 0) return null; // null = show all
  const visible = new Set(BASE_ITEMS);
  for (const bt of businessTypes) {
    const items = TYPE_ITEMS[bt];
    if (items) items.forEach(id => visible.add(id));
  }
  return visible;
}

/**
 * Returns the recommended journey template based on primary business type.
 */
export function getRecommendedJourney(businessTypes: string[]): string {
  if (businessTypes.includes("ecommerce") || businessTypes.includes("marketplace")) return "ecommerce";
  if (businessTypes.includes("service") || businessTypes.includes("agency")) return "service";
  if (businessTypes.includes("saas")) return "subscription";
  if (businessTypes.includes("membership")) return "membership";
  if (businessTypes.includes("coaching") || businessTypes.includes("creator")) return "coaching";
  if (businessTypes.includes("local")) return "local";
  if (businessTypes.includes("hybrid")) return "service";
  if (businessTypes.includes("evolving")) return "creator";
  return "service";
}
