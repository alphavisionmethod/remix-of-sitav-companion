// ═══════════════════════════════════════════════════════════════
// Adaptive Sidebar Intelligence
// Dynamically relabels, reicons, hides/shows, and reorders
// sidebar items based on the active business archetype —
// making the navigation feel purpose-built.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype, OperatingFlags } from "./business-profile-engine";
import { getModuleEmphasis } from "./business-module-adaptations";

export interface SidebarOverride {
  label?: string;
  hidden?: boolean;
  promoted?: boolean;        // bumped to top of its group
  badgeLabel?: string;       // e.g. "Carts: 5" instead of just "5"
  badgeSeverity?: "warning" | "critical";
  tooltipHint?: string;      // contextual tooltip
}

export type SidebarOverrideMap = Record<string, SidebarOverride>;

/**
 * Per-archetype sidebar label & visibility overrides.
 * Keys match sidebar item IDs in BusinessAppShell.
 */
const ARCHETYPE_SIDEBAR: Record<string, SidebarOverrideMap> = {
  ecommerce: {
    "crm-contacts":   { label: "Customers", tooltipHint: "Buyers & prospects" },
    "crm-pipeline":   { label: "Order Pipeline", tooltipHint: "Order stages" },
    leads:            { label: "Cart Leads", tooltipHint: "Abandoned cart recovery" },
    "lead-recovery":  { label: "Cart Recovery", badgeLabel: "Carts", promoted: true },
    invoices:         { label: "Orders & Invoices" },
    proposals:        { hidden: true },
    appointments:     { hidden: true },
    "revenue-autopilot": { label: "Sales Autopilot", promoted: true },
    ecommerce:        { promoted: true, label: "Store Manager" },
    quotes:           { label: "Price Quotes" },
    opportunities:    { label: "Upsell Opportunities" },
    "customer-health": { label: "Customer LTV" },
    collections:      { label: "Payment Recovery" },
    "crm-automations": { label: "Store Automations" },
  },

  service: {
    "crm-contacts":   { label: "Clients" },
    "crm-pipeline":   { label: "Project Pipeline" },
    leads:            { label: "Inquiries" },
    proposals:        { label: "Proposals & SOWs", promoted: true },
    invoices:         { label: "Invoices & Billing" },
    appointments:     { label: "Meetings" },
    ecommerce:        { hidden: true },
    "lead-recovery":  { label: "Follow-Up Queue" },
    quotes:           { label: "Estimates" },
    opportunities:    { label: "Opportunities" },
    "revenue-autopilot": { label: "Client Nurture" },
    "customer-health": { label: "Client Health" },
  },

  "brick-and-mortar": {
    "crm-contacts":   { label: "Customers" },
    "crm-pipeline":   { label: "Sales Pipeline" },
    leads:            { label: "Walk-ins & Leads" },
    appointments:     { label: "Appointments", promoted: true },
    ecommerce:        { hidden: true },
    proposals:        { hidden: true },
    "website-builder": { label: "Local Presence" },
    "lead-recovery":  { label: "Customer Win-Back" },
    social:           { label: "Local Marketing", promoted: true },
    "customer-health": { label: "Loyalty Score" },
    invoices:         { label: "POS & Invoices" },
  },

  "employee-based": {
    "crm-contacts":   { label: "Team & Clients" },
    "crm-pipeline":   { label: "Work Pipeline" },
    leads:            { label: "New Requests" },
    "crm-tasks":      { label: "Task Board", promoted: true },
    operations:       { label: "Ops Center", promoted: true },
    proposals:        { hidden: true },
    ecommerce:        { hidden: true },
    "customer-health": { label: "Account Health" },
    "revenue-autopilot": { label: "Workflow Engine" },
  },

  "appointment-based": {
    "crm-contacts":   { label: "Clients & Patients" },
    "crm-pipeline":   { label: "Booking Pipeline" },
    leads:            { label: "New Bookings" },
    appointments:     { label: "Schedule", promoted: true },
    ecommerce:        { hidden: true },
    proposals:        { hidden: true },
    "crm-tasks":      { label: "Session Notes", promoted: true },
    "customer-health": { label: "Client Retention" },
    "lead-recovery":  { label: "No-Show Recovery" },
    invoices:         { label: "Session Billing" },
  },

  agency: {
    "crm-contacts":   { label: "Clients & Stakeholders" },
    "crm-pipeline":   { label: "Deal Pipeline", promoted: true },
    leads:            { label: "Prospects" },
    proposals:        { label: "Proposals & Pitches", promoted: true },
    "crm-tasks":      { label: "Deliverables" },
    invoices:         { label: "Billing & Retainers" },
    ecommerce:        { hidden: true },
    appointments:     { label: "Client Meetings" },
    "customer-health": { label: "Client Satisfaction" },
    "revenue-autopilot": { label: "Growth Engine" },
    "revenue-forecast": { label: "Revenue Forecast", promoted: true },
  },

  "professional-practice": {
    "crm-contacts":   { label: "Patients / Clients" },
    "crm-pipeline":   { label: "Case Pipeline" },
    leads:            { label: "Referrals" },
    appointments:     { label: "Appointments", promoted: true },
    proposals:        { hidden: true },
    ecommerce:        { hidden: true },
    "crm-tasks":      { label: "Case Tasks" },
    documents:        { label: "Patient Records", promoted: true },
    invoices:         { label: "Billing & Insurance" },
    "customer-health": { label: "Patient Engagement" },
  },

  membership: {
    "crm-contacts":   { label: "Members" },
    "crm-pipeline":   { label: "Membership Pipeline" },
    leads:            { label: "Prospects" },
    ecommerce:        { label: "Membership Store" },
    "customer-health": { label: "Member Retention", promoted: true },
    "lead-recovery":  { label: "Churn Recovery", promoted: true },
    invoices:         { label: "Subscriptions & Billing" },
    "revenue-autopilot": { label: "Renewal Engine" },
  },

  marketplace: {
    "crm-contacts":   { label: "Vendors & Buyers" },
    "crm-pipeline":   { label: "Transaction Pipeline" },
    leads:            { label: "New Sellers" },
    ecommerce:        { label: "Marketplace", promoted: true },
    proposals:        { hidden: true },
    invoices:         { label: "Commission Billing" },
    "customer-health": { label: "Platform Health" },
  },

  "multi-location": {
    "crm-contacts":   { label: "Customers" },
    "crm-pipeline":   { label: "Regional Pipeline" },
    operations:       { label: "Multi-Site Ops", promoted: true },
    "customer-health": { label: "Location Health" },
    ecommerce:        { label: "Online Store" },
    social:           { label: "Local Marketing" },
  },

  hybrid: {
    "crm-contacts":   { label: "Contacts" },
    "crm-pipeline":   { label: "Pipeline" },
    leads:            { label: "Leads" },
  },

  "product-service": {
    "crm-contacts":   { label: "Customers & Clients" },
    "crm-pipeline":   { label: "Sales Pipeline" },
    ecommerce:        { label: "Product Store" },
    proposals:        { label: "Service Proposals" },
  },
};

/**
 * Get the full sidebar override map for the current business profile.
 * Merges archetype overrides with operating-flag-based visibility.
 */
export function getSidebarOverrides(
  primaryMode: ProfileArchetype,
  flags: OperatingFlags
): SidebarOverrideMap {
  const base = ARCHETYPE_SIDEBAR[primaryMode] || ARCHETYPE_SIDEBAR.service || {};
  const merged = { ...base };

  // Flag-based conditional visibility
  if (!flags.hasAppointments && !merged.appointments?.promoted) {
    merged.appointments = { ...merged.appointments, hidden: true };
  }
  if (!flags.hasEcommerce && !merged.ecommerce?.promoted) {
    merged.ecommerce = { ...merged.ecommerce, hidden: true };
  }
  if (!flags.hasEmployees) {
    merged.operations = { ...merged.operations, tooltipHint: "Solo operations" };
  }

  // Module-emphasis-based auto-hide: if a module's emphasis is "hidden", hide it
  const moduleIdMap: Record<string, string> = {
    appointments: "appointments",
    ecommerce: "ecommerce",
    proposals: "quotes",
    quotes: "quotes",
    "lead-recovery": "lead-recovery",
    social: "social",
    "website-builder": "website",
    operations: "operations",
    support: "support",
    collections: "collections",
    documents: "documents",
    communications: "communications",
  };

  for (const [sidebarId, moduleId] of Object.entries(moduleIdMap)) {
    if (!merged[sidebarId]?.hidden) {
      const emphasis = getModuleEmphasis(moduleId, primaryMode);
      if (emphasis === "hidden") {
        merged[sidebarId] = { ...merged[sidebarId], hidden: true };
      }
    }
  }

  return merged;
}

/**
 * Filter and relabel sidebar items based on overrides.
 */
export function applySidebarOverrides<T extends { id: string; label: string }>(
  items: T[],
  overrides: SidebarOverrideMap
): (T & { tooltipHint?: string })[] {
  return items
    .filter(item => !overrides[item.id]?.hidden)
    .map(item => {
      const override = overrides[item.id];
      if (!override) return item;
      return {
        ...item,
        label: override.label || item.label,
        tooltipHint: override.tooltipHint,
      };
    })
    .sort((a, b) => {
      const aPromoted = overrides[a.id]?.promoted ? 0 : 1;
      const bPromoted = overrides[b.id]?.promoted ? 0 : 1;
      return aPromoted - bPromoted;
    });
}
