// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Archetype Engine
// Adapts advisor weighting & board behavior per business type
// ═══════════════════════════════════════════════════════════════

export type BusinessArchetype =
  | "solo-provider" | "local-service" | "agency" | "consulting"
  | "appointment-based" | "project-based" | "recurring-service"
  | "e-commerce" | "field-ops" | "small-team" | "hybrid" | "household-blend";

export interface ArchetypeProfile {
  key: BusinessArchetype;
  label: string;
  description: string;
  emoji: string;
  priorityAdvisors: string[];
  topRisks: string[];
  profitLeaks: string[];
  keyWorkflows: string[];
  automationOpportunities: string[];
  importantMetrics: string[];
  advisorWeights: Record<string, number>; // advisorId → weight 0-1
}

export const ARCHETYPE_PROFILES: ArchetypeProfile[] = [
  {
    key: "solo-provider",
    label: "Solo Service Provider",
    description: "One-person business offering specialized services",
    emoji: "🧑‍💼",
    priorityAdvisors: ["coo-advisor", "sales-advisor", "finance-advisor", "ea-advisor"],
    topRisks: ["Owner burnout", "No backup capacity", "Feast-famine cycles", "Missed leads while delivering"],
    profitLeaks: ["Underpricing", "Slow invoicing", "No follow-up system"],
    keyWorkflows: ["Lead → Quote → Deliver → Invoice → Follow-up"],
    automationOpportunities: ["Auto-scheduling", "Invoice reminders", "Lead response", "Calendar blocking"],
    importantMetrics: ["Utilization rate", "Quote-to-close ratio", "Days to invoice", "Lead response time"],
    advisorWeights: { "ceo-advisor": 0.6, "coo-advisor": 0.9, "sales-advisor": 0.8, "finance-advisor": 0.85, "ea-advisor": 0.95, "client-success": 0.7, "growth-advisor": 0.5, "strategy-advisor": 0.4, "risk-advisor": 0.5, "innovation-advisor": 0.3 },
  },
  {
    key: "local-service",
    label: "Local/Home Service Business",
    description: "Service business with local geographic focus",
    emoji: "🏠",
    priorityAdvisors: ["sales-advisor", "coo-advisor", "finance-advisor", "ea-advisor"],
    topRisks: ["Missed calls", "Slow follow-up", "Scheduling inefficiency", "Underpricing"],
    profitLeaks: ["No-shows", "Drive time waste", "Uncollected payments", "Repeat visit failures"],
    keyWorkflows: ["Call → Quote → Schedule → Complete → Invoice → Review"],
    automationOpportunities: ["Callback queue", "Appointment confirmations", "Invoice reminders", "Review requests"],
    importantMetrics: ["Callback speed", "Schedule fill rate", "First-time fix rate", "Revenue per visit"],
    advisorWeights: { "ceo-advisor": 0.5, "coo-advisor": 0.9, "sales-advisor": 0.9, "finance-advisor": 0.8, "ea-advisor": 0.85, "client-success": 0.75, "growth-advisor": 0.6, "strategy-advisor": 0.3, "risk-advisor": 0.4, "innovation-advisor": 0.3 },
  },
  {
    key: "agency",
    label: "Agency",
    description: "Creative, marketing, or professional services agency",
    emoji: "🏢",
    priorityAdvisors: ["ceo-advisor", "coo-advisor", "client-success", "finance-advisor", "growth-advisor"],
    topRisks: ["Project drift", "Follow-up gaps", "Under-scoped work", "Poor per-client profitability"],
    profitLeaks: ["Scope creep", "Unbilled hours", "Client concentration", "Over-servicing"],
    keyWorkflows: ["Lead → Proposal → Close → Onboard → Deliver → Review → Renew"],
    automationOpportunities: ["Project status updates", "Time tracking alerts", "Renewal reminders", "Profitability reports"],
    importantMetrics: ["Revenue per client", "Utilization rate", "Scope accuracy", "Client retention rate"],
    advisorWeights: { "ceo-advisor": 0.85, "coo-advisor": 0.9, "sales-advisor": 0.7, "finance-advisor": 0.85, "ea-advisor": 0.6, "client-success": 0.9, "growth-advisor": 0.8, "strategy-advisor": 0.7, "risk-advisor": 0.6, "innovation-advisor": 0.5 },
  },
  {
    key: "consulting",
    label: "Consulting / Coaching",
    description: "Knowledge-based advisory or coaching practice",
    emoji: "🎯",
    priorityAdvisors: ["ceo-advisor", "client-success", "finance-advisor", "strategy-advisor"],
    topRisks: ["Client dependency on founder", "Inconsistent pipeline", "Pricing pressure"],
    profitLeaks: ["Free work", "Scope creep", "No productized offers", "Undervalued expertise"],
    keyWorkflows: ["Inquiry → Discovery → Proposal → Engagement → Delivery → Review"],
    automationOpportunities: ["Meeting scheduling", "Session prep", "Follow-up sequences", "Testimonial requests"],
    importantMetrics: ["Revenue per hour", "Client lifetime value", "Pipeline coverage ratio", "Renewal rate"],
    advisorWeights: { "ceo-advisor": 0.9, "coo-advisor": 0.6, "sales-advisor": 0.7, "finance-advisor": 0.8, "ea-advisor": 0.7, "client-success": 0.85, "growth-advisor": 0.7, "strategy-advisor": 0.9, "risk-advisor": 0.5, "innovation-advisor": 0.6 },
  },
  {
    key: "appointment-based",
    label: "Appointment-Based Business",
    description: "Salon, clinic, therapy, or other booking-driven businesses",
    emoji: "📅",
    priorityAdvisors: ["coo-advisor", "ea-advisor", "sales-advisor", "client-success"],
    topRisks: ["No-shows", "Scheduling gaps", "Overbooking", "Seasonal dips"],
    profitLeaks: ["Empty slots", "No cancellation policy", "Late arrivals eating into next slots"],
    keyWorkflows: ["Book → Confirm → Arrive → Service → Payment → Rebook"],
    automationOpportunities: ["Confirmation reminders", "Waitlist fill", "Rebooking prompts", "No-show follow-up"],
    importantMetrics: ["Fill rate", "No-show rate", "Average revenue per slot", "Rebooking rate"],
    advisorWeights: { "ceo-advisor": 0.5, "coo-advisor": 0.95, "sales-advisor": 0.7, "finance-advisor": 0.7, "ea-advisor": 0.95, "client-success": 0.8, "growth-advisor": 0.6, "strategy-advisor": 0.3, "risk-advisor": 0.3, "innovation-advisor": 0.4 },
  },
  {
    key: "project-based",
    label: "Project-Based Business",
    description: "Construction, development, or deliverable-driven work",
    emoji: "🏗️",
    priorityAdvisors: ["coo-advisor", "finance-advisor", "risk-advisor", "ceo-advisor"],
    topRisks: ["Cost overruns", "Timeline delays", "Change orders", "Cash flow gaps between projects"],
    profitLeaks: ["Untracked change orders", "Material waste", "Idle crew time"],
    keyWorkflows: ["Bid → Win → Plan → Execute → Milestone → Invoice → Close"],
    automationOpportunities: ["Milestone tracking", "Change order logging", "Progress invoicing", "Resource scheduling"],
    importantMetrics: ["Project margin", "On-time delivery rate", "Change order ratio", "Cash gap between projects"],
    advisorWeights: { "ceo-advisor": 0.8, "coo-advisor": 0.95, "sales-advisor": 0.6, "finance-advisor": 0.9, "ea-advisor": 0.5, "client-success": 0.6, "growth-advisor": 0.5, "strategy-advisor": 0.6, "risk-advisor": 0.9, "innovation-advisor": 0.4 },
  },
  {
    key: "recurring-service",
    label: "Recurring Service Business",
    description: "Maintenance, cleaning, managed services, SaaS support",
    emoji: "🔄",
    priorityAdvisors: ["client-success", "finance-advisor", "coo-advisor", "growth-advisor"],
    topRisks: ["Churn", "Service quality inconsistency", "Price erosion"],
    profitLeaks: ["Under-charging renewals", "Free add-ons", "High service cost clients"],
    keyWorkflows: ["Sign-up → Onboard → Deliver → Check-in → Renew"],
    automationOpportunities: ["Renewal reminders", "Service quality surveys", "Upsell prompts", "Churn prediction alerts"],
    importantMetrics: ["Monthly recurring revenue", "Churn rate", "Net revenue retention", "Service cost ratio"],
    advisorWeights: { "ceo-advisor": 0.7, "coo-advisor": 0.8, "sales-advisor": 0.6, "finance-advisor": 0.85, "ea-advisor": 0.5, "client-success": 0.95, "growth-advisor": 0.85, "strategy-advisor": 0.6, "risk-advisor": 0.5, "innovation-advisor": 0.5 },
  },
  {
    key: "e-commerce",
    label: "E-Commerce Business",
    description: "Online retail, DTC, or marketplace seller",
    emoji: "🛒",
    priorityAdvisors: ["growth-advisor", "finance-advisor", "coo-advisor", "strategy-advisor"],
    topRisks: ["Inventory mismatch", "Ad spend waste", "Fulfillment delays", "Return rate"],
    profitLeaks: ["Low-margin products", "Shipping cost absorption", "Abandoned carts", "Return handling cost"],
    keyWorkflows: ["Browse → Cart → Purchase → Fulfill → Ship → Deliver → Review"],
    automationOpportunities: ["Abandoned cart recovery", "Inventory alerts", "Review solicitation", "Reorder prompts"],
    importantMetrics: ["Conversion rate", "Customer acquisition cost", "Average order value", "Return rate"],
    advisorWeights: { "ceo-advisor": 0.7, "coo-advisor": 0.85, "sales-advisor": 0.6, "finance-advisor": 0.9, "ea-advisor": 0.4, "client-success": 0.7, "growth-advisor": 0.95, "strategy-advisor": 0.8, "risk-advisor": 0.6, "innovation-advisor": 0.7 },
  },
  {
    key: "field-ops",
    label: "Field Operations",
    description: "Delivery, field service, or mobile workforce businesses",
    emoji: "🚚",
    priorityAdvisors: ["coo-advisor", "ea-advisor", "finance-advisor", "risk-advisor"],
    topRisks: ["Route inefficiency", "Equipment downtime", "Safety incidents", "Scheduling conflicts"],
    profitLeaks: ["Fuel waste", "Idle time between jobs", "Repeat visits", "Overtime"],
    keyWorkflows: ["Dispatch → Travel → Execute → Document → Invoice"],
    automationOpportunities: ["Route optimization", "Job completion notifications", "Equipment maintenance alerts", "Time tracking"],
    importantMetrics: ["Jobs per day", "First-time completion rate", "Travel time ratio", "Revenue per route"],
    advisorWeights: { "ceo-advisor": 0.5, "coo-advisor": 0.95, "sales-advisor": 0.5, "finance-advisor": 0.8, "ea-advisor": 0.9, "client-success": 0.6, "growth-advisor": 0.5, "strategy-advisor": 0.3, "risk-advisor": 0.85, "innovation-advisor": 0.4 },
  },
  {
    key: "small-team",
    label: "Small Team Operator",
    description: "Business with 3-15 employees across roles",
    emoji: "👥",
    priorityAdvisors: ["ceo-advisor", "coo-advisor", "finance-advisor", "ea-advisor"],
    topRisks: ["Key person dependency", "Communication gaps", "Role ambiguity", "Scaling friction"],
    profitLeaks: ["Duplicate work", "Handoff failures", "Unbilled time", "Training gaps"],
    keyWorkflows: ["Assign → Execute → Review → Handoff → Complete"],
    automationOpportunities: ["Task assignment", "Status updates", "Team workload balancing", "Meeting prep"],
    importantMetrics: ["Revenue per employee", "Task completion rate", "Handoff success rate", "Team utilization"],
    advisorWeights: { "ceo-advisor": 0.9, "coo-advisor": 0.9, "sales-advisor": 0.7, "finance-advisor": 0.8, "ea-advisor": 0.8, "client-success": 0.7, "growth-advisor": 0.6, "strategy-advisor": 0.7, "risk-advisor": 0.6, "innovation-advisor": 0.5 },
  },
  {
    key: "hybrid",
    label: "Hybrid Business",
    description: "Business spanning multiple models (e.g., service + product)",
    emoji: "🔀",
    priorityAdvisors: ["ceo-advisor", "strategy-advisor", "finance-advisor", "coo-advisor"],
    topRisks: ["Focus fragmentation", "Cross-model complexity", "Resource allocation", "Brand confusion"],
    profitLeaks: ["Cross-subsidizing weak units", "Shared cost misallocation", "Inventory for product side"],
    keyWorkflows: ["Model-specific workflows running in parallel"],
    automationOpportunities: ["Cross-model reporting", "Resource allocation alerts", "Unified client view"],
    importantMetrics: ["Revenue by model", "Margin by model", "Shared cost allocation", "Cross-sell rate"],
    advisorWeights: { "ceo-advisor": 0.95, "coo-advisor": 0.85, "sales-advisor": 0.7, "finance-advisor": 0.9, "ea-advisor": 0.6, "client-success": 0.7, "growth-advisor": 0.7, "strategy-advisor": 0.9, "risk-advisor": 0.7, "innovation-advisor": 0.6 },
  },
  {
    key: "household-blend",
    label: "Household-Business Blend",
    description: "Business intertwined with personal/household operations",
    emoji: "🏡",
    priorityAdvisors: ["ea-advisor", "finance-advisor", "coo-advisor", "ceo-advisor"],
    topRisks: ["Personal-business cash mixing", "Schedule overload", "Burnout", "No boundaries"],
    profitLeaks: ["Personal expenses in business", "Time leaks to household tasks during work hours"],
    keyWorkflows: ["Unified daily planning across personal + business"],
    automationOpportunities: ["Schedule separation", "Expense categorization", "Focus time blocking", "Family calendar sync"],
    importantMetrics: ["Business hours efficiency", "Expense separation accuracy", "Work-life time ratio"],
    advisorWeights: { "ceo-advisor": 0.7, "coo-advisor": 0.8, "sales-advisor": 0.6, "finance-advisor": 0.9, "ea-advisor": 0.95, "client-success": 0.6, "growth-advisor": 0.5, "strategy-advisor": 0.5, "risk-advisor": 0.5, "innovation-advisor": 0.3 },
  },
];

export class BusinessArchetypeEngine {
  private selectedArchetype: BusinessArchetype = "small-team";

  getSelectedArchetype(): BusinessArchetype {
    return this.selectedArchetype;
  }

  getProfile(): ArchetypeProfile {
    return ARCHETYPE_PROFILES.find(p => p.key === this.selectedArchetype) ?? ARCHETYPE_PROFILES[9]; // default small-team
  }

  setArchetype(key: BusinessArchetype) {
    this.selectedArchetype = key;
  }

  getAllProfiles(): ArchetypeProfile[] {
    return ARCHETYPE_PROFILES;
  }

  getAdvisorWeight(advisorId: string): number {
    return this.getProfile().advisorWeights[advisorId] ?? 0.5;
  }

  getPriorityAdvisors(): string[] {
    return this.getProfile().priorityAdvisors;
  }

  getTopRisks(): string[] {
    return this.getProfile().topRisks;
  }

  getAutomationOpportunities(): string[] {
    return this.getProfile().automationOpportunities;
  }
}

let _instance: BusinessArchetypeEngine | null = null;
export function getBusinessArchetypeEngine(): BusinessArchetypeEngine {
  if (!_instance) _instance = new BusinessArchetypeEngine();
  return _instance;
}
