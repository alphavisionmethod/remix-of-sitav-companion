// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Profile Engine
// Computes weighted business model profile from BusinessTwin data
// and derives full adaptation config for the entire Business OS.
//
// PURITY:
//   ✅ Pure computation — no I/O or side effects
//   ✅ Deterministic — same inputs = same outputs
//
//   Persistence helpers (save/load/clear) live in
//   `src/lib/services/business-os/business-profile.service.ts`.
//   Canonical domain types live in `@/domains/business`.
// ═══════════════════════════════════════════════════════════════

import type { BusinessTwin, BusinessArchetype, BusinessTwinProfile, BusinessRevenueModel } from "@/pages/revenue-office/onboarding/business-twin";
import type { OnboardingState } from "@/pages/revenue-office/onboarding/types";

// ── Canonical types (single source of truth in @/domains/business) ──
import {
  ALL_ARCHETYPES,
  type ProfileArchetype,
  type ArchetypeWeights,
  type OperatingFlags,
  type SidebarPriority,
  type HomeWidgetConfig,
  type CRMAdaptation,
  type AdvisorSpec,
  type BoardroomFocus,
  type WorkflowSuggestion,
  type CrossDomainSignals,
  type BusinessProfileResult,
} from "@/domains/business";

// Re-export so existing import paths (`from "@/domains/engines/business-profile-engine"`)
// keep working. Source of truth lives in `@/domains/business`.
export { ALL_ARCHETYPES };
export type {
  ProfileArchetype,
  ArchetypeWeights,
  OperatingFlags,
  SidebarPriority,
  HomeWidgetConfig,
  CRMAdaptation,
  AdvisorSpec,
  BoardroomFocus,
  WorkflowSuggestion,
  CrossDomainSignals,
  BusinessProfileResult,
};

// ── Weight defaults ───────────────────────────────────────────

const EMPTY_WEIGHTS: ArchetypeWeights = {
  ecommerce: 0, "brick-and-mortar": 0, service: 0, "employee-based": 0,
  "appointment-based": 0, agency: 0, "professional-practice": 0, hybrid: 0,
  "multi-location": 0, "product-service": 0, membership: 0, marketplace: 0,
};

// ── Archetype mapping from BusinessTwin archetype ─────────────

const TWIN_TO_PROFILE: Record<BusinessArchetype, ProfileArchetype> = {
  service: "service",
  agency: "agency",
  coaching: "professional-practice",
  creator: "membership",
  ecommerce: "ecommerce",
  local: "brick-and-mortar",
  membership: "membership",
  hybrid: "hybrid",
  evolving: "service",
};

// ── Compute weights from BusinessTwin ─────────────────────────

function computeWeightsFromTwin(twin: BusinessTwin): ArchetypeWeights {
  const w = { ...EMPTY_WEIGHTS };
  const { profile, revenueModel } = twin;

  // Primary archetype
  const primary = TWIN_TO_PROFILE[profile.primaryBusinessArchetype] || "service";
  w[primary] += 0.4;

  // Secondary archetypes
  for (const arch of profile.secondaryArchetypes) {
    const mapped = TWIN_TO_PROFILE[arch] || "hybrid";
    w[mapped] += 0.15;
  }

  // Revenue model signals
  if (revenueModel.checkoutDriven) w.ecommerce += 0.15;
  if (revenueModel.bookingDriven) w["appointment-based"] += 0.15;
  if (revenueModel.quoteDriven) w.service += 0.1;
  if (revenueModel.localVisitDriven) w["brick-and-mortar"] += 0.15;
  if (revenueModel.recurringRevenuePresent) w.membership += 0.1;
  if (revenueModel.referralDriven) w.service += 0.05;
  if (revenueModel.launchDriven) w.membership += 0.05;

  // Revenue modes
  for (const mode of revenueModel.primaryRevenueModes) {
    if (mode === "ecommerce") w.ecommerce += 0.1;
    if (mode === "appointments") w["appointment-based"] += 0.1;
    if (mode === "proposals" || mode === "retainers") w.agency += 0.1;
    if (mode === "memberships" || mode === "subscriptions") w.membership += 0.1;
    if (mode === "digital_products") w.ecommerce += 0.05;
    if (mode === "in_person") w["brick-and-mortar"] += 0.1;
  }

  // Structure signals
  if (profile.organizationStructure === "multi_location") {
    w["multi-location"] += 0.2;
    w["brick-and-mortar"] += 0.1;
  }
  if (profile.multiLocation) w["multi-location"] += 0.15;
  if (profile.organizationStructure === "growing_team" || profile.organizationStructure === "multi_client") {
    w["employee-based"] += 0.15;
  }
  if (profile.teamSizeCategory !== "solo" && profile.teamSizeCategory !== "1") {
    w["employee-based"] += 0.1;
  }

  // Normalize to sum=1
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  if (total > 0) {
    for (const k of Object.keys(w) as ProfileArchetype[]) {
      w[k] = Math.round((w[k] / total) * 100) / 100;
    }
  }

  return w;
}

// ── Compute weights from OnboardingState (fallback) ───────────

function computeWeightsFromOnboarding(state: OnboardingState): ArchetypeWeights {
  const w = { ...EMPTY_WEIGHTS };

  for (const bt of state.businessTypes) {
    const lower = bt.toLowerCase();
    if (lower.includes("ecommerce") || lower.includes("online store")) w.ecommerce += 0.3;
    if (lower.includes("service")) w.service += 0.3;
    if (lower.includes("agency") || lower.includes("consulting")) w.agency += 0.3;
    if (lower.includes("local") || lower.includes("brick") || lower.includes("retail")) w["brick-and-mortar"] += 0.3;
    if (lower.includes("membership") || lower.includes("subscription")) w.membership += 0.3;
    if (lower.includes("coaching") || lower.includes("professional")) w["professional-practice"] += 0.3;
    if (lower.includes("creator")) w.membership += 0.2;
  }

  if (state.teamSize !== "solo") w["employee-based"] += 0.15;

  for (const rs of state.revenueSources) {
    const lower = rs.toLowerCase();
    if (lower.includes("appointment")) w["appointment-based"] += 0.15;
    if (lower.includes("ecommerce") || lower.includes("product")) w.ecommerce += 0.1;
    if (lower.includes("retainer") || lower.includes("subscription")) w.membership += 0.1;
  }

  const total = Object.values(w).reduce((s, v) => s + v, 0);
  if (total > 0) {
    for (const k of Object.keys(w) as ProfileArchetype[]) {
      w[k] = Math.round((w[k] / total) * 100) / 100;
    }
  }
  return w;
}

// ── Derive operating flags ────────────────────────────────────

function deriveFlags(weights: ArchetypeWeights, twin?: BusinessTwin): OperatingFlags {
  const rev = twin?.revenueModel;
  return {
    hasEmployees: weights["employee-based"] > 0.1 || (twin?.profile.teamSizeCategory !== "solo" && !!twin),
    hasAppointments: weights["appointment-based"] > 0.1 || !!rev?.bookingDriven,
    hasEcommerce: weights.ecommerce > 0.1 || !!rev?.checkoutDriven,
    hasLocations: weights["multi-location"] > 0.1 || weights["brick-and-mortar"] > 0.1 || !!twin?.profile.multiLocation,
    sendsQuotes: weights.service > 0.15 || weights.agency > 0.1 || !!rev?.quoteDriven,
    sendsInvoices: weights.service > 0.1 || weights.agency > 0.1 || weights["professional-practice"] > 0.1,
    hasRecurringRevenue: weights.membership > 0.1 || !!rev?.recurringRevenuePresent,
    hasCollections: weights.service > 0.15 || weights.agency > 0.1,
    hasLocalPresence: weights["brick-and-mortar"] > 0.1 || weights["multi-location"] > 0.1,
    hasDigitalProducts: !!rev?.primaryRevenueModes?.includes("digital_products"),
    hasTeam: weights["employee-based"] > 0.1,
    hasProposals: weights.agency > 0.1 || weights.service > 0.15 || !!rev?.quoteDriven,
  };
}

// ── Sidebar priority by archetype ─────────────────────────────

function deriveSidebar(primary: ProfileArchetype, flags: OperatingFlags): SidebarPriority {
  const order: Record<ProfileArchetype, string[]> = {
    ecommerce:            ["CRM", "Growth", "Core", "Sales", "Intelligence", "System"],
    "brick-and-mortar":   ["Core", "CRM", "Sales", "Growth", "Intelligence", "System"],
    service:              ["CRM", "Sales", "Core", "Intelligence", "Growth", "System"],
    "employee-based":     ["Core", "CRM", "Sales", "Intelligence", "Growth", "System"],
    "appointment-based":  ["Core", "CRM", "Sales", "Growth", "Intelligence", "System"],
    agency:               ["CRM", "Sales", "Core", "Intelligence", "Growth", "System"],
    "professional-practice": ["CRM", "Sales", "Core", "Intelligence", "Growth", "System"],
    hybrid:               ["CRM", "Core", "Sales", "Growth", "Intelligence", "System"],
    "multi-location":     ["Core", "CRM", "Sales", "Growth", "Intelligence", "System"],
    "product-service":    ["CRM", "Sales", "Core", "Growth", "Intelligence", "System"],
    membership:           ["CRM", "Core", "Growth", "Sales", "Intelligence", "System"],
    marketplace:          ["CRM", "Core", "Growth", "Sales", "Intelligence", "System"],
  };

  const badgeMap: Record<string, Record<string, { label: string; severity?: "warning" | "critical" }>> = {
    ecommerce: { "lead-recovery": { label: "Cart Recovery", severity: "warning" }, ecommerce: { label: "Store" } },
    service: { proposals: { label: "Proposals" }, invoices: { label: "Invoices", severity: "critical" } },
    "brick-and-mortar": { appointments: { label: "Bookings" }, operations: { label: "Location Ops" } },
    "employee-based": { operations: { label: "Assignments", severity: "warning" }, "follow-through": { label: "Handoffs", severity: "warning" } },
    agency: { proposals: { label: "Proposals" }, "follow-through": { label: "Client Tasks", severity: "warning" } },
  };

  return {
    groupOrder: order[primary] || order.hybrid,
    hiddenGroups: [],
    badgeOverrides: badgeMap[primary] || {},
  };
}

// ── Home widget config by archetype ───────────────────────────

function deriveHomeWidgets(primary: ProfileArchetype, flags: OperatingFlags): HomeWidgetConfig {
  const presets: Record<string, HomeWidgetConfig> = {
    ecommerce: {
      primary: ["orders", "cart-recovery", "conversion-rate", "aov", "fulfillment", "returns", "campaign-roi"],
      secondary: ["customer-ltv", "support-pressure", "repeat-purchase"],
      hidden: ["proposals", "scheduling-load"],
    },
    service: {
      primary: ["pipeline-value", "booked-work", "pending-proposals", "follow-up-queue", "scheduling-load", "invoice-timing"],
      secondary: ["client-retention", "delivery-load", "collections-status"],
      hidden: ["cart-recovery", "aov", "fulfillment"],
    },
    "brick-and-mortar": {
      primary: ["appointments-today", "walk-in-traffic", "staffing-coverage", "location-performance", "repeat-visits", "reputation"],
      secondary: ["local-demand", "inventory", "no-show-rate"],
      hidden: ["cart-recovery", "proposals", "aov"],
    },
    "employee-based": {
      primary: ["active-assignments", "handoff-queue", "workload-distribution", "accountability", "support-queue", "execution-rate"],
      secondary: ["staffing-strain", "process-blockers", "response-standards"],
      hidden: ["cart-recovery", "aov"],
    },
    agency: {
      primary: ["pipeline-value", "pending-proposals", "retainer-health", "delivery-load", "follow-up-queue", "client-retention"],
      secondary: ["team-utilization", "project-margin", "collections-status"],
      hidden: ["cart-recovery", "walk-in-traffic"],
    },
  };

  return presets[primary] || {
    primary: ["pipeline-value", "follow-up-queue", "revenue-trend", "customer-health", "appointments-today", "pending-proposals"],
    secondary: ["support-queue", "collections-status", "execution-rate"],
    hidden: [],
  };
}

// ── CRM adaptation ────────────────────────────────────────────

function deriveCRM(primary: ProfileArchetype, flags: OperatingFlags): CRMAdaptation {
  const configs: Record<string, CRMAdaptation> = {
    ecommerce: {
      language: { contactLabel: "Buyers", dealLabel: "Orders", pipelineLabel: "Order Flow", proposalLabel: "Offers" },
      priorityFields: ["order_history", "lifetime_value", "cart_status", "campaign_source", "spend_segment"],
      hiddenFields: ["proposal_date", "retainer_status"],
      defaultSegments: ["High-Value Buyers", "Repeat Customers", "Cart Abandoners", "Campaign Responders"],
      pipelineStages: ["Browsing", "Cart Added", "Checkout Started", "Order Placed", "Fulfilled", "Delivered", "Returned"],
    },
    service: {
      language: { contactLabel: "Clients", dealLabel: "Jobs", pipelineLabel: "Pipeline", proposalLabel: "Proposals" },
      priorityFields: ["communication_history", "proposal_status", "delivery_timeline", "invoice_status", "follow_up_date"],
      hiddenFields: ["cart_status", "order_history"],
      defaultSegments: ["Active Clients", "Pending Proposals", "Overdue Follow-up", "At-Risk Clients"],
      pipelineStages: ["Lead", "Consultation", "Proposal Sent", "Negotiation", "Won", "In Delivery", "Completed"],
    },
    "brick-and-mortar": {
      language: { contactLabel: "Visitors", dealLabel: "Visits", pipelineLabel: "Visit Flow", proposalLabel: "Quotes" },
      priorityFields: ["visit_count", "loyalty_status", "location", "staff_notes", "last_visit"],
      hiddenFields: ["cart_status", "proposal_status"],
      defaultSegments: ["Regulars", "New Visitors", "Lapsed", "VIP"],
      pipelineStages: ["Walk-in", "Engaged", "Purchase", "Follow-up", "Repeat"],
    },
    "employee-based": {
      language: { contactLabel: "Accounts", dealLabel: "Assignments", pipelineLabel: "Work Queue", proposalLabel: "Service Quotes" },
      priorityFields: ["account_owner", "handoff_state", "team_tasks", "response_time", "accountability_score"],
      hiddenFields: ["cart_status"],
      defaultSegments: ["Active Accounts", "Pending Handoffs", "Escalated", "Overdue"],
      pipelineStages: ["Intake", "Assigned", "In Progress", "Review", "Completed", "Follow-up"],
    },
    agency: {
      language: { contactLabel: "Clients", dealLabel: "Projects", pipelineLabel: "Pipeline", proposalLabel: "Proposals" },
      priorityFields: ["project_status", "retainer_health", "proposal_status", "billing_status", "team_assigned"],
      hiddenFields: ["cart_status", "order_history"],
      defaultSegments: ["Active Retainers", "Proposal Pipeline", "At-Risk Clients", "Expansion Opportunities"],
      pipelineStages: ["Prospect", "Discovery", "Proposal", "Negotiation", "Onboarding", "Active", "Renewal"],
    },
  };

  return configs[primary] || configs.service;
}

// ── Advisor roster by archetype ───────────────────────────────

function deriveAdvisors(weights: ArchetypeWeights, primary: ProfileArchetype): AdvisorSpec[] {
  const allAdvisors: Record<string, AdvisorSpec[]> = {
    ecommerce: [
      { id: "conversion", name: "Conversion Advisor", specialty: "Optimize checkout and conversion funnels", accent: "38 85% 58%", portraitSeed: 101, affinityScore: 0.95 },
      { id: "cart-recovery", name: "Cart Recovery Advisor", specialty: "Recover abandoned carts and incomplete purchases", accent: "280 55% 58%", portraitSeed: 102, affinityScore: 0.9 },
      { id: "retention", name: "Retention Advisor", specialty: "Increase repeat purchases and customer loyalty", accent: "152 55% 48%", portraitSeed: 103, affinityScore: 0.85 },
      { id: "customer-ltv", name: "Customer LTV Advisor", specialty: "Maximize lifetime value per buyer", accent: "217 80% 55%", portraitSeed: 104, affinityScore: 0.8 },
      { id: "support-pressure", name: "Support Pressure Advisor", specialty: "Monitor and reduce support load", accent: "0 72% 51%", portraitSeed: 105, affinityScore: 0.7 },
      { id: "offer-timing", name: "Offer Timing Advisor", specialty: "Optimize campaign and offer timing", accent: "45 90% 55%", portraitSeed: 106, affinityScore: 0.75 },
    ],
    service: [
      { id: "lead-followup", name: "Lead Follow-up Advisor", specialty: "Ensure no lead goes cold", accent: "38 85% 58%", portraitSeed: 201, affinityScore: 0.95 },
      { id: "proposal", name: "Proposal Advisor", specialty: "Optimize quote-to-close velocity", accent: "280 55% 58%", portraitSeed: 202, affinityScore: 0.9 },
      { id: "scheduling", name: "Scheduling Advisor", specialty: "Balance capacity and availability", accent: "152 55% 48%", portraitSeed: 203, affinityScore: 0.85 },
      { id: "delivery-load", name: "Delivery Load Advisor", specialty: "Prevent overcommitment and delays", accent: "217 80% 55%", portraitSeed: 204, affinityScore: 0.8 },
      { id: "collections", name: "Collections Advisor", specialty: "Track and recover overdue payments", accent: "0 72% 51%", portraitSeed: 205, affinityScore: 0.75 },
      { id: "client-relationship", name: "Client Relationship Advisor", specialty: "Deepen relationships and prevent churn", accent: "45 90% 55%", portraitSeed: 206, affinityScore: 0.85 },
    ],
    "brick-and-mortar": [
      { id: "local-ops", name: "Local Ops Advisor", specialty: "Optimize daily store operations", accent: "38 85% 58%", portraitSeed: 301, affinityScore: 0.95 },
      { id: "footfall", name: "Footfall Advisor", specialty: "Track and increase walk-in traffic", accent: "280 55% 58%", portraitSeed: 302, affinityScore: 0.9 },
      { id: "staff-coverage", name: "Staff Coverage Advisor", specialty: "Ensure optimal staffing levels", accent: "152 55% 48%", portraitSeed: 303, affinityScore: 0.85 },
      { id: "repeat-customer", name: "Repeat Customer Advisor", specialty: "Drive return visits and loyalty", accent: "217 80% 55%", portraitSeed: 304, affinityScore: 0.8 },
      { id: "local-issue", name: "Local Issue Advisor", specialty: "Flag and resolve location-specific problems", accent: "0 72% 51%", portraitSeed: 305, affinityScore: 0.75 },
    ],
    "employee-based": [
      { id: "team-workload", name: "Team Workload Advisor", specialty: "Balance work across team members", accent: "38 85% 58%", portraitSeed: 401, affinityScore: 0.95 },
      { id: "assignment", name: "Assignment Advisor", specialty: "Optimize task delegation and matching", accent: "280 55% 58%", portraitSeed: 402, affinityScore: 0.9 },
      { id: "handoff", name: "Handoff Advisor", specialty: "Prevent dropped balls during transitions", accent: "152 55% 48%", portraitSeed: 403, affinityScore: 0.85 },
      { id: "bottleneck", name: "Bottleneck Advisor", specialty: "Identify and clear execution blockers", accent: "217 80% 55%", portraitSeed: 404, affinityScore: 0.8 },
      { id: "accountability", name: "Accountability Advisor", specialty: "Track ownership and follow-through", accent: "0 72% 51%", portraitSeed: 405, affinityScore: 0.75 },
    ],
    agency: [
      { id: "pipeline-advisor", name: "Pipeline Advisor", specialty: "Manage proposal and deal flow", accent: "38 85% 58%", portraitSeed: 501, affinityScore: 0.95 },
      { id: "project-health", name: "Project Health Advisor", specialty: "Monitor active project delivery", accent: "280 55% 58%", portraitSeed: 502, affinityScore: 0.9 },
      { id: "client-expansion", name: "Client Expansion Advisor", specialty: "Identify upsell and cross-sell opportunities", accent: "152 55% 48%", portraitSeed: 503, affinityScore: 0.85 },
      { id: "utilization", name: "Utilization Advisor", specialty: "Optimize team capacity and billable hours", accent: "217 80% 55%", portraitSeed: 504, affinityScore: 0.8 },
      { id: "retention-advisor", name: "Client Retention Advisor", specialty: "Prevent churn and manage renewals", accent: "45 90% 55%", portraitSeed: 505, affinityScore: 0.85 },
    ],
  };

  // Gather advisors from top archetypes, scored by weight
  const sorted = (Object.entries(weights) as [ProfileArchetype, number][])
    .filter(([, v]) => v > 0.05)
    .sort((a, b) => b[1] - a[1]);

  const seen = new Set<string>();
  const result: AdvisorSpec[] = [];

  for (const [arch, weight] of sorted) {
    const roster = allAdvisors[arch] || allAdvisors.service;
    for (const adv of roster) {
      if (!seen.has(adv.id)) {
        seen.add(adv.id);
        result.push({ ...adv, affinityScore: Math.round(adv.affinityScore * weight * 100) / 100 });
      }
    }
  }

  return result.sort((a, b) => b.affinityScore - a.affinityScore).slice(0, 8);
}

// ── Boardroom framing ─────────────────────────────────────────

function deriveBoardroom(primary: ProfileArchetype): BoardroomFocus {
  const configs: Record<string, BoardroomFocus> = {
    ecommerce: {
      focusAreas: ["Conversion Health", "Cart Recovery", "Customer Retention", "Support Pressure", "Refund Rate", "Campaign ROI"],
      kpiEmphasis: ["conversion_rate", "cart_abandonment", "repeat_purchase_rate", "aov", "customer_ltv", "return_rate"],
      reviewMode: "performance",
      agendaPriorities: ["Revenue leaks", "Conversion drops", "Support escalations", "Offer timing"],
    },
    service: {
      focusAreas: ["Pipeline Quality", "Proposal Velocity", "Delivery Execution", "Invoice Timing", "Client Retention"],
      kpiEmphasis: ["pipeline_value", "proposal_close_rate", "delivery_on_time", "invoice_aging", "client_churn"],
      reviewMode: "strategic",
      agendaPriorities: ["Pipeline gaps", "Proposal stalls", "Delivery risk", "Payment delays"],
    },
    "brick-and-mortar": {
      focusAreas: ["Location Performance", "Staffing Coverage", "Customer Repeat Rate", "Local Reputation", "Appointment Patterns"],
      kpiEmphasis: ["daily_traffic", "staff_utilization", "repeat_visit_rate", "no_show_rate", "satisfaction_score"],
      reviewMode: "operational",
      agendaPriorities: ["Staffing gaps", "Location issues", "Customer complaints", "No-show patterns"],
    },
    "employee-based": {
      focusAreas: ["Workload Balance", "Execution Bottlenecks", "Accountability", "Service Consistency", "Staffing Pressure"],
      kpiEmphasis: ["task_completion_rate", "avg_resolution_time", "handoff_success", "overdue_rate", "utilization"],
      reviewMode: "operational",
      agendaPriorities: ["Overloaded team members", "Blocked tasks", "Missed deadlines", "Quality drops"],
    },
    agency: {
      focusAreas: ["Client Health", "Project Delivery", "Pipeline Strength", "Team Utilization", "Revenue Concentration"],
      kpiEmphasis: ["client_satisfaction", "project_margin", "pipeline_value", "billable_utilization", "revenue_per_client"],
      reviewMode: "strategic",
      agendaPriorities: ["At-risk clients", "Project delays", "Pipeline gaps", "Capacity planning"],
    },
  };

  return configs[primary] || configs.service;
}

// ── Workflow templates ────────────────────────────────────────

function deriveWorkflows(primary: ProfileArchetype, flags: OperatingFlags): WorkflowSuggestion[] {
  const all: WorkflowSuggestion[] = [
    // Ecommerce
    { id: "cart-recovery-flow", name: "Cart Recovery", description: "Automated follow-up for abandoned carts", trigger: "cart_abandoned", steps: ["Wait 1h", "Send reminder email", "Wait 24h", "Send discount offer", "Wait 48h", "Final reminder"], affinityScore: 0.95, archetype: "ecommerce" },
    { id: "order-followup", name: "Order Follow-up", description: "Post-purchase engagement sequence", trigger: "order_completed", steps: ["Send thank you", "Wait 3d", "Request review", "Wait 14d", "Cross-sell suggestion"], affinityScore: 0.9, archetype: "ecommerce" },
    { id: "retention-sequence", name: "Retention Sequence", description: "Re-engage lapsed customers", trigger: "no_purchase_30d", steps: ["Segment check", "Personalized email", "Wait 7d", "Special offer", "Wait 14d", "Win-back campaign"], affinityScore: 0.85, archetype: "ecommerce" },
    { id: "review-request", name: "Review Request", description: "Automated review solicitation", trigger: "delivery_confirmed", steps: ["Wait 2d", "Send review request", "Wait 5d", "Gentle reminder"], affinityScore: 0.8, archetype: "ecommerce" },
    // Service
    { id: "lead-intake", name: "Lead Intake", description: "Qualify and route new leads", trigger: "new_lead", steps: ["Auto-acknowledge", "Score lead", "Assign owner", "Schedule follow-up"], affinityScore: 0.95, archetype: "service" },
    { id: "proposal-followup", name: "Proposal Follow-up", description: "Track proposal responses", trigger: "proposal_sent", steps: ["Wait 3d", "Check-in call", "Wait 5d", "Value reminder", "Wait 7d", "Decision prompt"], affinityScore: 0.9, archetype: "service" },
    { id: "invoice-followup", name: "Invoice Follow-up", description: "Payment reminder sequence", trigger: "invoice_sent", steps: ["Wait 7d", "Friendly reminder", "Wait 7d", "Firm reminder", "Wait 7d", "Escalation"], affinityScore: 0.85, archetype: "service" },
    { id: "pre-service-reminder", name: "Pre-Service Reminder", description: "Preparation reminders before appointments", trigger: "appointment_24h", steps: ["Send reminder", "Include prep checklist", "Confirm attendance"], affinityScore: 0.8, archetype: "service" },
    // Local
    { id: "appointment-reminder", name: "Appointment Reminder", description: "Reduce no-shows with reminders", trigger: "appointment_upcoming", steps: ["24h reminder", "2h reminder", "Post-visit follow-up"], affinityScore: 0.95, archetype: "brick-and-mortar" },
    { id: "repeat-outreach", name: "Repeat Customer Outreach", description: "Encourage return visits", trigger: "no_visit_30d", steps: ["Personal message", "Wait 7d", "Special offer", "Wait 14d", "Loyalty check-in"], affinityScore: 0.85, archetype: "brick-and-mortar" },
    { id: "location-escalation", name: "Location Issue Escalation", description: "Auto-escalate location problems", trigger: "issue_reported", steps: ["Log issue", "Notify manager", "Set resolution deadline", "Follow-up check"], affinityScore: 0.75, archetype: "brick-and-mortar" },
    // Employee/team
    { id: "assignment-flow", name: "Task Assignment", description: "Structured task delegation", trigger: "task_created", steps: ["Match skills", "Assign owner", "Set deadline", "Notify team", "Track progress"], affinityScore: 0.95, archetype: "employee-based" },
    { id: "escalation-flow", name: "Escalation Flow", description: "Overdue task escalation", trigger: "task_overdue", steps: ["Notify owner", "Wait 4h", "Notify manager", "Wait 24h", "Emergency escalation"], affinityScore: 0.9, archetype: "employee-based" },
    { id: "accountability-review", name: "Accountability Review", description: "Weekly accountability check", trigger: "weekly_schedule", steps: ["Generate report", "Identify gaps", "Notify team leads", "Schedule review"], affinityScore: 0.8, archetype: "employee-based" },
    // Agency
    { id: "client-onboarding", name: "Client Onboarding", description: "Structured new client setup", trigger: "deal_won", steps: ["Send welcome pack", "Schedule kickoff", "Create project", "Assign team", "Set milestones"], affinityScore: 0.95, archetype: "agency" },
    { id: "project-checkpoint", name: "Project Checkpoint", description: "Regular project health checks", trigger: "milestone_due", steps: ["Status check", "Client update", "Risk assessment", "Adjust timeline"], affinityScore: 0.85, archetype: "agency" },
  ];

  // Score each workflow by archetype affinity
  return all
    .map(wf => ({
      ...wf,
      affinityScore: wf.archetype === primary ? wf.affinityScore : wf.affinityScore * 0.3,
    }))
    .sort((a, b) => b.affinityScore - a.affinityScore);
}

// ── KPI derivation ────────────────────────────────────────────

function deriveKPIs(primary: ProfileArchetype): string[] {
  const kpis: Record<string, string[]> = {
    ecommerce: ["Revenue", "Conversion Rate", "AOV", "Cart Abandonment", "Customer LTV", "Repeat Purchase Rate", "Return Rate", "Campaign ROI"],
    service: ["Pipeline Value", "Proposal Close Rate", "Avg Job Value", "Client Retention", "Invoice Aging", "Delivery On-Time %", "Follow-up Rate"],
    "brick-and-mortar": ["Daily Traffic", "Conversion Rate", "Repeat Visit Rate", "Staff Utilization", "No-Show Rate", "Satisfaction Score", "Revenue/Location"],
    "employee-based": ["Task Completion Rate", "Avg Resolution Time", "Utilization", "Handoff Success %", "Overdue Tasks", "Quality Score"],
    agency: ["Pipeline Value", "Client Satisfaction", "Billable Utilization", "Project Margin", "Revenue/Client", "Proposal Win Rate", "Retention Rate"],
  };
  return kpis[primary] || kpis.service;
}

// ── Main compute function ─────────────────────────────────────

export function computeBusinessProfile(
  input: { twin?: BusinessTwin; onboarding?: OnboardingState },
  manualOverrides?: Partial<ArchetypeWeights>
): BusinessProfileResult {
  // 1. Compute raw weights
  let weights = input.twin
    ? computeWeightsFromTwin(input.twin)
    : input.onboarding
      ? computeWeightsFromOnboarding(input.onboarding)
      : { ...EMPTY_WEIGHTS, service: 1 };

  // Compute confidence based on signal count
  let signalCount = 0;
  if (input.twin) {
    signalCount += 3; // base twin data
    if (input.twin.revenueModel.checkoutDriven || input.twin.revenueModel.bookingDriven) signalCount += 1;
    if (input.twin.revenueModel.primaryRevenueModes.length > 0) signalCount += 1;
    if (input.twin.profile.organizationStructure) signalCount += 1;
    if (input.twin.profile.teamSizeCategory !== "solo") signalCount += 1;
    if (input.twin.profile.multiLocation) signalCount += 1;
  } else if (input.onboarding) {
    signalCount += input.onboarding.businessTypes.length > 0 ? 2 : 0;
    signalCount += input.onboarding.revenueSources.length > 0 ? 1 : 0;
    signalCount += input.onboarding.teamSize !== "solo" ? 1 : 0;
  }
  if (manualOverrides && Object.keys(manualOverrides).length > 0) signalCount += 2;
  const profileConfidence = Math.min(1, signalCount / 8);

  // 2. Apply manual overrides (blend 70% computed, 30% override)
  if (manualOverrides) {
    for (const [k, v] of Object.entries(manualOverrides) as [ProfileArchetype, number][]) {
      if (v != null && weights[k] != null) {
        weights[k] = weights[k] * 0.7 + v * 0.3;
      }
    }
    // Re-normalize
    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    if (total > 0) {
      for (const k of Object.keys(weights) as ProfileArchetype[]) {
        weights[k] = Math.round((weights[k] / total) * 100) / 100;
      }
    }
  }

  // 3. Determine primary + secondary modes
  const sorted = (Object.entries(weights) as [ProfileArchetype, number][])
    .sort((a, b) => b[1] - a[1]);
  const primaryMode = sorted[0]?.[0] || "service";
  const secondaryModes = sorted.filter(([, v]) => v > 0.1).slice(1).map(([k]) => k);

  // 4. Derive all adaptation configs
  const flags = deriveFlags(weights, input.twin);

  // 5. Cross-domain signals
  const crossDomainSignals: CrossDomainSignals = deriveCrossDomain(primaryMode, flags);

  return {
    weights,
    primaryMode,
    secondaryModes,
    operatingFlags: flags,
    sidebar: deriveSidebar(primaryMode, flags),
    homeWidgets: deriveHomeWidgets(primaryMode, flags),
    crm: deriveCRM(primaryMode, flags),
    advisors: deriveAdvisors(weights, primaryMode),
    boardroom: deriveBoardroom(primaryMode),
    workflows: deriveWorkflows(primaryMode, flags),
    kpis: deriveKPIs(primaryMode),
    manualOverrides: manualOverrides || {},
    profileConfidence,
    crossDomainSignals,
  };
}

function deriveCrossDomain(primary: ProfileArchetype, flags: OperatingFlags): CrossDomainSignals {
  const financeMap: Record<string, { emphasis: string; kpis: string[] }> = {
    ecommerce: { emphasis: "Revenue optimization & AOV tracking", kpis: ["AOV", "Customer LTV", "Refund Rate", "Campaign ROAS"] },
    service: { emphasis: "Invoice aging & collections timing", kpis: ["Invoice Aging", "Collections Rate", "Cash Flow Gap", "Revenue Per Client"] },
    "brick-and-mortar": { emphasis: "Recurring operational costs & daily revenue", kpis: ["Daily Revenue", "Rent/Overhead Ratio", "Staff Cost %", "Location ROI"] },
    "employee-based": { emphasis: "Payroll efficiency & utilization", kpis: ["Revenue Per Employee", "Utilization Rate", "Overtime Cost", "Margin Per Team"] },
    agency: { emphasis: "Project margins & retainer health", kpis: ["Project Margin", "Billable Rate", "Revenue Concentration", "Retainer MRR"] },
  };
  const conciergeMap: Record<string, { emphasis: string; triggers: string[] }> = {
    ecommerce: { emphasis: "Campaign prep & fulfillment coordination", triggers: ["campaign_launch", "inventory_alert", "seasonal_prep"] },
    service: { emphasis: "Client meeting prep & scheduling", triggers: ["consultation_prep", "proposal_deadline", "delivery_milestone"] },
    "brick-and-mortar": { emphasis: "Staffing prep & location readiness", triggers: ["shift_coverage", "location_opening", "supply_order"] },
    "appointment-based": { emphasis: "Calendar optimization & prep reminders", triggers: ["appointment_prep", "no_show_followup", "schedule_gap"] },
    agency: { emphasis: "Project kickoff & client meeting prep", triggers: ["kickoff_prep", "quarterly_review", "contract_renewal"] },
  };

  return {
    finance: financeMap[primary] || financeMap.service,
    concierge: conciergeMap[primary] || conciergeMap.service,
  };
}
