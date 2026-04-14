// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-OS Integration Engine
// Enables Business, Finance, and Concierge to share context,
// emit cross-domain events, and deep-link into each other.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype } from "@/lib/engines/business-profile-engine";

// ── Cross-OS Event Types ────────────────────────────────────

export type CrossOSEventType =
  | "cross-os:navigate"        // Navigate to a module in another app
  | "cross-os:data-request"    // Request data from another domain
  | "cross-os:signal"          // Push a signal (e.g., "invoice overdue" from Finance to Business)
  | "cross-os:context-sync"    // Sync shared context (e.g., business profile)
  | "cross-os:escalate";       // Escalate item from one domain's boardroom to another

export interface CrossOSEvent {
  type: CrossOSEventType;
  source: "business" | "finance" | "concierge";
  target: "business" | "finance" | "concierge" | "boardroom" | "*";
  payload: Record<string, any>;
  timestamp: number;
}

// ── Event Bus ──────────────────────────────────────────────

type Listener = (event: CrossOSEvent) => void;
const listeners: Map<string, Set<Listener>> = new Map();

export function emitCrossOSEvent(event: Omit<CrossOSEvent, "timestamp">) {
  const full: CrossOSEvent = { ...event, timestamp: Date.now() };

  // Dispatch to JS event system for app shells
  window.dispatchEvent(new CustomEvent("sita-cross-os", { detail: full }));

  // Dispatch to registered listeners
  const key = `${event.target}:${event.type}`;
  const wildKey = `*:${event.type}`;
  [key, wildKey].forEach(k => {
    listeners.get(k)?.forEach(fn => fn(full));
  });
}

export function onCrossOSEvent(
  target: "business" | "finance" | "concierge" | "*",
  type: CrossOSEventType,
  listener: Listener
): () => void {
  const key = `${target}:${type}`;
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => { listeners.get(key)?.delete(listener); };
}

// ── Deep-Link Navigation Helpers ───────────────────────────

/** Navigate to a specific module inside another app */
export function crossNavigate(
  targetApp: "business" | "finance" | "concierge",
  module: string,
  context?: Record<string, any>
) {
  // Set initial module for the target app
  (window as any)[`__${targetApp === "finance" ? "finance" : targetApp}InitialModule`] = module;

  // Emit navigation event that the target app shell listens for
  window.dispatchEvent(
    new CustomEvent(`sita-${targetApp}-navigate`, { detail: { module, ...context } })
  );

  // Also emit cross-OS event for logging/analytics
  emitCrossOSEvent({
    type: "cross-os:navigate",
    source: "business", // will be overridden by caller
    target: targetApp,
    payload: { module, context },
  });
}

// ── Cross-OS Link Definitions ──────────────────────────────
// Maps Business actions to Finance/Concierge destinations

export interface CrossOSLink {
  id: string;
  label: string;
  description: string;
  sourceApp: "business" | "finance" | "concierge";
  targetApp: "business" | "finance" | "concierge";
  targetModule: string;
  icon: string;
  relevantArchetypes: ProfileArchetype[] | "all";
  category: "financial" | "operational" | "scheduling" | "strategic";
}

export const CROSS_OS_LINKS: CrossOSLink[] = [
  // Business → Finance
  { id: "biz-to-receivables", label: "View Receivables", description: "Track outstanding invoices in Finance", sourceApp: "business", targetApp: "finance", targetModule: "receivables", icon: "ArrowDownLeft", relevantArchetypes: "all", category: "financial" },
  { id: "biz-to-cash-timing", label: "Cash Flow Timing", description: "See when money arrives and departs", sourceApp: "business", targetApp: "finance", targetModule: "cash-timing", icon: "Clock", relevantArchetypes: "all", category: "financial" },
  { id: "biz-to-tax", label: "Tax Implications", description: "Review tax impact of business decisions", sourceApp: "business", targetApp: "finance", targetModule: "tax", icon: "Calculator", relevantArchetypes: "all", category: "financial" },
  { id: "biz-to-budgets", label: "Budget Check", description: "Verify budget before committing spend", sourceApp: "business", targetApp: "finance", targetModule: "budgets", icon: "PieChart", relevantArchetypes: "all", category: "financial" },
  { id: "biz-to-scenarios", label: "Financial Scenarios", description: "Model business decision impact", sourceApp: "business", targetApp: "finance", targetModule: "scenarios", icon: "FlaskConical", relevantArchetypes: ["service", "agency", "ecommerce"], category: "strategic" },

  // Finance → Business
  { id: "fin-to-invoices", label: "Business Invoices", description: "Create and manage invoices", sourceApp: "finance", targetApp: "business", targetModule: "invoices", icon: "Receipt", relevantArchetypes: "all", category: "financial" },
  { id: "fin-to-pipeline", label: "Sales Pipeline", description: "Review expected revenue from deals", sourceApp: "finance", targetApp: "business", targetModule: "opportunities", icon: "TrendingUp", relevantArchetypes: ["service", "agency", "ecommerce"], category: "strategic" },
  { id: "fin-to-collections", label: "Collections Center", description: "Escalate overdue accounts", sourceApp: "finance", targetApp: "business", targetModule: "collections", icon: "AlertTriangle", relevantArchetypes: "all", category: "financial" },
  { id: "fin-to-forecast", label: "Revenue Forecast", description: "See projected revenue from business", sourceApp: "finance", targetApp: "business", targetModule: "forecast", icon: "LineChart", relevantArchetypes: "all", category: "strategic" },

  // Business → Concierge
  { id: "biz-to-appointments", label: "Scheduling", description: "Manage business appointments in Concierge", sourceApp: "business", targetApp: "concierge", targetModule: "appointments", icon: "Calendar", relevantArchetypes: ["appointment-based", "professional-practice", "brick-and-mortar"], category: "scheduling" },
  { id: "biz-to-errands", label: "Business Errands", description: "Track business-related errands", sourceApp: "business", targetApp: "concierge", targetModule: "errands", icon: "ShoppingCart", relevantArchetypes: ["brick-and-mortar"], category: "operational" },
  { id: "biz-to-travel", label: "Business Travel", description: "Plan business trips", sourceApp: "business", targetApp: "concierge", targetModule: "travel", icon: "Plane", relevantArchetypes: ["service", "agency"], category: "operational" },

  // Concierge → Business
  { id: "con-to-support", label: "Customer Support", description: "Handle customer issues from Business OS", sourceApp: "concierge", targetApp: "business", targetModule: "support", icon: "Headphones", relevantArchetypes: "all", category: "operational" },
  { id: "con-to-operations", label: "Business Operations", description: "Check operational status", sourceApp: "concierge", targetApp: "business", targetModule: "operations", icon: "Activity", relevantArchetypes: "all", category: "operational" },

  // Concierge → Finance
  { id: "con-to-bills", label: "Pay Bills", description: "Review and pay household & business bills", sourceApp: "concierge", targetApp: "finance", targetModule: "bills", icon: "Receipt", relevantArchetypes: "all", category: "financial" },
  { id: "con-to-subscriptions", label: "Subscriptions", description: "Manage recurring subscriptions", sourceApp: "concierge", targetApp: "finance", targetModule: "subscriptions", icon: "CreditCard", relevantArchetypes: "all", category: "financial" },

  // Finance → Concierge
  { id: "fin-to-recurring", label: "Recurring Obligations", description: "Review recurring personal obligations", sourceApp: "finance", targetApp: "concierge", targetModule: "recurring", icon: "RefreshCw", relevantArchetypes: "all", category: "operational" },
  { id: "fin-to-household", label: "Household Budget", description: "Manage household spending context", sourceApp: "finance", targetApp: "concierge", targetModule: "household", icon: "Home", relevantArchetypes: "all", category: "financial" },
];

/** Get relevant cross-OS links for a given source app and archetype */
export function getCrossOSLinks(
  sourceApp: "business" | "finance" | "concierge",
  primaryMode?: ProfileArchetype
): CrossOSLink[] {
  return CROSS_OS_LINKS.filter(link => {
    if (link.sourceApp !== sourceApp) return false;
    if (link.relevantArchetypes === "all") return true;
    if (!primaryMode) return true;
    return link.relevantArchetypes.includes(primaryMode);
  });
}

// ── Finance OS Archetype Adaptations ──────────────────────

export interface FinanceArchetypeAdaptation {
  receivablesLabel: string;
  cashTimingEmphasis: "high" | "medium" | "low";
  investmentEmphasis: "high" | "medium" | "low";
  taxComplexity: "simple" | "moderate" | "complex";
  budgetStyle: "personal" | "business" | "hybrid";
  heroMetricLabel: string;
  advisorPersonality: string;
  keyInsightFocus: string;
}

const FINANCE_ADAPTATIONS: Record<ProfileArchetype, FinanceArchetypeAdaptation> = {
  ecommerce: {
    receivablesLabel: "Order Payments & Refunds",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "moderate",
    budgetStyle: "business",
    heroMetricLabel: "Net Revenue After COGS",
    advisorPersonality: "Growth-minded commerce strategist",
    keyInsightFocus: "Payment processing fees and margins",
  },
  service: {
    receivablesLabel: "Client Invoices & Retainers",
    cashTimingEmphasis: "high",
    investmentEmphasis: "low",
    taxComplexity: "moderate",
    budgetStyle: "hybrid",
    heroMetricLabel: "Billable Revenue",
    advisorPersonality: "Practical cash flow guardian",
    keyInsightFocus: "Invoice aging and collection velocity",
  },
  "brick-and-mortar": {
    receivablesLabel: "Daily Sales & Deposits",
    cashTimingEmphasis: "high",
    investmentEmphasis: "low",
    taxComplexity: "moderate",
    budgetStyle: "business",
    heroMetricLabel: "Daily Net Revenue",
    advisorPersonality: "Local business financial advisor",
    keyInsightFocus: "Rent, utilities, and seasonal cash gaps",
  },
  "employee-based": {
    receivablesLabel: "Client Payments & Payroll",
    cashTimingEmphasis: "high",
    investmentEmphasis: "low",
    taxComplexity: "complex",
    budgetStyle: "business",
    heroMetricLabel: "Revenue After Payroll",
    advisorPersonality: "Payroll-aware cash manager",
    keyInsightFocus: "Payroll timing and cash reserves",
  },
  agency: {
    receivablesLabel: "Retainer & Project Billing",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "complex",
    budgetStyle: "business",
    heroMetricLabel: "Net Margin After Team Costs",
    advisorPersonality: "Agency financial strategist",
    keyInsightFocus: "Utilization rate and profit per project",
  },
  "appointment-based": {
    receivablesLabel: "Session Payments & No-Show Fees",
    cashTimingEmphasis: "medium",
    investmentEmphasis: "low",
    taxComplexity: "moderate",
    budgetStyle: "hybrid",
    heroMetricLabel: "Weekly Session Revenue",
    advisorPersonality: "Practice financial advisor",
    keyInsightFocus: "No-show revenue loss and booking density",
  },
  marketplace: {
    receivablesLabel: "Platform Fees & Payouts",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "complex",
    budgetStyle: "business",
    heroMetricLabel: "Net Take Rate",
    advisorPersonality: "Platform economics advisor",
    keyInsightFocus: "Take rate optimization and payout timing",
  },
  "professional-practice": {
    receivablesLabel: "Patient/Client Billing",
    cashTimingEmphasis: "medium",
    investmentEmphasis: "medium",
    taxComplexity: "complex",
    budgetStyle: "hybrid",
    heroMetricLabel: "Collections Rate",
    advisorPersonality: "Practice management advisor",
    keyInsightFocus: "Insurance reimbursement and collections",
  },
  "multi-location": {
    receivablesLabel: "Location Revenue & Royalties",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "complex",
    budgetStyle: "business",
    heroMetricLabel: "Net Multi-Location Revenue",
    advisorPersonality: "Multi-unit financial strategist",
    keyInsightFocus: "Per-location profitability and cross-site costs",
  },
  membership: {
    receivablesLabel: "Membership Dues & Renewals",
    cashTimingEmphasis: "medium",
    investmentEmphasis: "low",
    taxComplexity: "simple",
    budgetStyle: "hybrid",
    heroMetricLabel: "Monthly Recurring Revenue",
    advisorPersonality: "Subscription revenue advisor",
    keyInsightFocus: "Churn rate and renewal forecasting",
  },
  "product-service": {
    receivablesLabel: "Product Sales & Service Billing",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "moderate",
    budgetStyle: "business",
    heroMetricLabel: "Blended Product + Service Revenue",
    advisorPersonality: "Dual-revenue financial advisor",
    keyInsightFocus: "Product margins vs service profitability",
  },
  hybrid: {
    receivablesLabel: "Mixed Revenue Streams",
    cashTimingEmphasis: "high",
    investmentEmphasis: "medium",
    taxComplexity: "complex",
    budgetStyle: "hybrid",
    heroMetricLabel: "Blended Net Revenue",
    advisorPersonality: "Multi-model financial strategist",
    keyInsightFocus: "Revenue stream diversification and risk",
  },
};

export function getFinanceAdaptation(primaryMode: ProfileArchetype): FinanceArchetypeAdaptation {
  return FINANCE_ADAPTATIONS[primaryMode] || FINANCE_ADAPTATIONS.service;
}

// ── Concierge OS Archetype Adaptations ────────────────────

export interface ConciergeArchetypeAdaptation {
  appointmentEmphasis: "primary" | "secondary" | "hidden";
  errandTypes: string[];
  travelEmphasis: "high" | "medium" | "low";
  householdIntegration: "full" | "light" | "minimal";
  advisorTone: string;
  schedulingLabel: string;
  primaryConcern: string;
  workLifeBlend: "separate" | "blended" | "work-dominant";
}

const CONCIERGE_ADAPTATIONS: Record<ProfileArchetype, ConciergeArchetypeAdaptation> = {
  ecommerce: {
    appointmentEmphasis: "hidden",
    errandTypes: ["Packaging supplies", "Warehouse visit", "Supplier meeting"],
    travelEmphasis: "low",
    householdIntegration: "full",
    advisorTone: "You handle logistics online — I'll manage everything else",
    schedulingLabel: "Personal Calendar",
    primaryConcern: "Separating personal life from 24/7 commerce",
    workLifeBlend: "separate",
  },
  service: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Client meeting prep", "Document filing", "Office supplies"],
    travelEmphasis: "medium",
    householdIntegration: "full",
    advisorTone: "Your clients get your best — I'll handle the rest",
    schedulingLabel: "Appointments & Meetings",
    primaryConcern: "Client work eating into personal time",
    workLifeBlend: "blended",
  },
  "brick-and-mortar": {
    appointmentEmphasis: "secondary",
    errandTypes: ["Store supplies", "Bank deposit", "Vendor pickup", "Maintenance call"],
    travelEmphasis: "low",
    householdIntegration: "full",
    advisorTone: "You run the shop — I'll run the errands",
    schedulingLabel: "Shop & Personal Schedule",
    primaryConcern: "Store hours consuming all personal time",
    workLifeBlend: "blended",
  },
  "employee-based": {
    appointmentEmphasis: "secondary",
    errandTypes: ["HR meeting prep", "Team offsite logistics", "Office coordination"],
    travelEmphasis: "medium",
    householdIntegration: "full",
    advisorTone: "Managing people is enough — let me manage everything else",
    schedulingLabel: "Team & Personal Calendar",
    primaryConcern: "Management responsibilities spilling into personal life",
    workLifeBlend: "blended",
  },
  agency: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Client dinner reservation", "Pitch deck printing", "Event setup"],
    travelEmphasis: "high",
    householdIntegration: "light",
    advisorTone: "Your agency delivers for clients — I deliver for you",
    schedulingLabel: "Client & Travel Schedule",
    primaryConcern: "Client demands vs personal wellness",
    workLifeBlend: "work-dominant",
  },
  "appointment-based": {
    appointmentEmphasis: "primary",
    errandTypes: ["Supply restock", "Equipment maintenance", "Continuing education"],
    travelEmphasis: "low",
    householdIntegration: "full",
    advisorTone: "Your schedule is your business — I'll protect your off-hours",
    schedulingLabel: "Sessions & Personal Time",
    primaryConcern: "Back-to-back sessions leaving no personal time",
    workLifeBlend: "blended",
  },
  marketplace: {
    appointmentEmphasis: "hidden",
    errandTypes: ["Partner meetings", "Legal filings", "Compliance review"],
    travelEmphasis: "medium",
    householdIntegration: "full",
    advisorTone: "The platform runs 24/7 — you don't have to",
    schedulingLabel: "Personal Calendar",
    primaryConcern: "Platform emergencies disrupting personal life",
    workLifeBlend: "separate",
  },
  "professional-practice": {
    appointmentEmphasis: "primary",
    errandTypes: ["CE credits", "License renewal", "Practice supplies"],
    travelEmphasis: "low",
    householdIntegration: "full",
    advisorTone: "You care for your patients — I'll care for everything else",
    schedulingLabel: "Practice & Personal Schedule",
    primaryConcern: "Practice demands and continuing education",
    workLifeBlend: "blended",
  },
  franchise: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Location visit", "Franchise meeting", "Training event"],
    travelEmphasis: "high",
    householdIntegration: "light",
    advisorTone: "Multiple locations, one personal life to protect",
    schedulingLabel: "Location & Personal Calendar",
    primaryConcern: "Multi-location travel eating personal time",
    workLifeBlend: "work-dominant",
  },
  membership: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Member event setup", "Community outreach", "Venue booking"],
    travelEmphasis: "low",
    householdIntegration: "full",
    advisorTone: "Your community thrives — now let's make sure you do too",
    schedulingLabel: "Events & Personal Calendar",
    primaryConcern: "Community obligations vs personal boundaries",
    workLifeBlend: "blended",
  },
  nonprofit: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Donor meeting", "Grant deadline prep", "Event logistics"],
    travelEmphasis: "medium",
    householdIntegration: "full",
    advisorTone: "You serve the mission — I'll serve you",
    schedulingLabel: "Mission & Personal Calendar",
    primaryConcern: "Mission passion causing burnout",
    workLifeBlend: "blended",
  },
  hybrid: {
    appointmentEmphasis: "secondary",
    errandTypes: ["Cross-business coordination", "Mixed scheduling", "Priority sorting"],
    travelEmphasis: "medium",
    householdIntegration: "full",
    advisorTone: "Multiple business models, one support system",
    schedulingLabel: "Unified Calendar",
    primaryConcern: "Complexity of multiple revenue models",
    workLifeBlend: "blended",
  },
};

export function getConciergeAdaptation(primaryMode: ProfileArchetype): ConciergeArchetypeAdaptation {
  return CONCIERGE_ADAPTATIONS[primaryMode] || CONCIERGE_ADAPTATIONS.service;
}

// ── Cross-Domain Signal Definitions ────────────────────────

export interface CrossDomainSignal {
  id: string;
  label: string;
  source: "business" | "finance" | "concierge";
  target: "business" | "finance" | "concierge";
  triggerCondition: string;
  action: string;
  severity: "info" | "warning" | "critical";
}

export const CROSS_DOMAIN_SIGNALS: CrossDomainSignal[] = [
  { id: "invoice-overdue-90", label: "Invoice 90+ days overdue", source: "finance", target: "business", triggerCondition: "receivable.daysOverdue > 90", action: "Escalate to Collections center", severity: "critical" },
  { id: "cash-stress-upcoming", label: "Cash stress window ahead", source: "finance", target: "business", triggerCondition: "cashTiming.stressWindows > 0", action: "Highlight in Business pulse strip", severity: "warning" },
  { id: "appointment-booking-surge", label: "Booking surge detected", source: "concierge", target: "business", triggerCondition: "appointments.thisWeek > avg * 1.5", action: "Surface in Business operations", severity: "info" },
  { id: "high-deal-close", label: "Large deal closing", source: "business", target: "finance", triggerCondition: "opportunity.value > threshold && stage === 'closing'", action: "Alert cash timing forecast", severity: "info" },
  { id: "payroll-coming", label: "Payroll due in 3 days", source: "finance", target: "business", triggerCondition: "payroll.dueIn < 3", action: "Show in Business pulse strip", severity: "warning" },
  { id: "travel-expense-spike", label: "Travel expense spike", source: "concierge", target: "finance", triggerCondition: "travel.thisMonth > budget * 0.8", action: "Alert in Finance boundaries", severity: "warning" },
  { id: "client-meeting-prep", label: "Client meeting tomorrow", source: "concierge", target: "business", triggerCondition: "meeting.isClientMeeting && daysUntil === 1", action: "Surface in CRM contact card", severity: "info" },
  { id: "subscription-waste", label: "Wasteful subscription found", source: "finance", target: "concierge", triggerCondition: "subscription.usageRate < 0.1", action: "Add to Life Admin review queue", severity: "info" },
];

export function getActiveSignals(primaryMode: ProfileArchetype): CrossDomainSignal[] {
  // In production, filter by actual data conditions — for now return all
  return CROSS_DOMAIN_SIGNALS;
}
