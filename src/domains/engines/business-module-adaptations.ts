// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Module Adaptations
// Per-module, per-archetype adaptation configs for every Business OS page.
// Each module defines labels, categories, emphasis, advisor specialty,
// and terminology that change based on the user's business archetype.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype } from "./business-profile-engine";

// ── Types ─────────────────────────────────────────────────────

export interface ModuleAdaptation {
  /** Page/hero title override */
  title: string;
  /** Page subtitle */
  subtitle: string;
  /** Emphasis level: how important is this module for this archetype */
  emphasis: "primary" | "secondary" | "tertiary" | "hidden";
  /** Advisor name override */
  advisorName: string;
  /** Advisor specialty description */
  advisorSpecialty: string;
  /** Category/tab labels specific to this archetype */
  categories: string[];
  /** Key terminology overrides */
  terminology: Record<string, string>;
  /** Quick action labels */
  quickActions: string[];
  /** KPI labels (up to 4) */
  kpiLabels: string[];
  /** Boardroom escalation trigger description */
  boardroomTrigger: string;
}

type ModuleId =
  | "support" | "operations" | "follow-through" | "appointments"
  | "quotes" | "collections" | "documents" | "lead-recovery"
  | "communications" | "proof" | "opportunities" | "overview"
  | "boardroom" | "ecommerce" | "social" | "website";

type AdaptationMap = Record<string, ModuleAdaptation>;

// ── Defaults ──────────────────────────────────────────────────

const BASE: Record<ModuleId, ModuleAdaptation> = {
  support: {
    title: "Customer Support",
    subtitle: "Resolve issues, protect relationships, maintain trust",
    emphasis: "secondary",
    advisorName: "Support Advisor",
    advisorSpecialty: "Issue resolution and relationship protection",
    categories: ["All Open", "Urgent", "Waiting on Us", "Escalated", "Resolved"],
    terminology: { issue: "Issue", customer: "Customer", sla: "SLA", queue: "Support Queue" },
    quickActions: ["Reply", "Assign", "Escalate", "Close"],
    kpiLabels: ["Critical", "SLA Breached", "Avg Resolution", "Satisfaction"],
    boardroomTrigger: "Multiple SLA breaches or customer churn risk",
  },
  operations: {
    title: "Operations Center",
    subtitle: "Living state of business execution — queues, bottlenecks, team load",
    emphasis: "secondary",
    advisorName: "Operations Advisor",
    advisorSpecialty: "Operational efficiency and bottleneck resolution",
    categories: ["All", "Queues", "Escalations", "Bottlenecks", "Delayed"],
    terminology: { item: "Item", queue: "Queue", bottleneck: "Bottleneck", owner: "Owner" },
    quickActions: ["Assign", "Escalate", "Resolve", "Reassign"],
    kpiLabels: ["Critical Items", "Escalations", "Bottlenecks", "Customer Impact"],
    boardroomTrigger: "Critical operational bottleneck affecting revenue",
  },
  "follow-through": {
    title: "Follow-Through Center",
    subtitle: "Never drop a ball — every open thread tracked",
    emphasis: "primary",
    advisorName: "Follow-Through Advisor",
    advisorSpecialty: "Pipeline momentum and response timing",
    categories: ["Callbacks", "No-Touch Leads", "Waiting on Reply", "Unsent Drafts", "Overdue", "Recovery"],
    terminology: { thread: "Thread", followUp: "Follow-Up", stale: "Stale", recovery: "Recovery" },
    quickActions: ["Call", "Send Draft", "Reschedule", "Mark Done"],
    kpiLabels: ["Total Queue", "At Risk Value", "Overdue", "Ready to Send"],
    boardroomTrigger: "High-value leads going stale with no follow-up",
  },
  appointments: {
    title: "Appointments & Scheduling",
    subtitle: "Confirm, protect, and recover bookings",
    emphasis: "tertiary",
    advisorName: "Scheduling Advisor",
    advisorSpecialty: "Booking optimization and no-show prevention",
    categories: ["Upcoming", "Needs Confirmation", "No-Shows", "Follow-Up", "All"],
    terminology: { appointment: "Appointment", booking: "Booking", noShow: "No-Show", slot: "Slot" },
    quickActions: ["Send Reminder", "Call Unconfirmed", "Recover No-Shows", "New Booking"],
    kpiLabels: ["Upcoming", "Needs Confirmation", "High Risk", "Recent No-Shows"],
    boardroomTrigger: "No-show rate exceeding threshold or revenue loss from cancellations",
  },
  quotes: {
    title: "Quotes & Proposals",
    subtitle: "Build, send, and track quotes to close",
    emphasis: "secondary",
    advisorName: "Quote Intelligence",
    advisorSpecialty: "Quote-to-close conversion optimization",
    categories: ["All", "Active", "Drafts & Sent", "Closed"],
    terminology: { quote: "Quote", proposal: "Proposal", estimate: "Estimate", offer: "Offer" },
    quickActions: ["New Quote", "Follow Up", "Convert to Invoice", "Duplicate"],
    kpiLabels: ["Active", "Value", "Drafts", "Won"],
    boardroomTrigger: "Quote aging beyond win-rate threshold",
  },
  collections: {
    title: "Collections Command Center",
    subtitle: "Recover outstanding payments with dignity and precision",
    emphasis: "secondary",
    advisorName: "Collections Advisor",
    advisorSpecialty: "Payment recovery and relationship-sensitive escalation",
    categories: ["All Overdue", "0–30 Days", "30–60 Days", "60–90 Days", "90+ Days"],
    terminology: { account: "Account", aging: "Aging", chase: "Chase Sequence", escalation: "Escalation" },
    quickActions: ["Send Reminder", "Call", "Escalate", "Payment Plan"],
    kpiLabels: ["Total Overdue", "At Risk", "Recovery Rate", "Avg Days Outstanding"],
    boardroomTrigger: "Collections aging past 60 days with significant revenue at risk",
  },
  documents: {
    title: "Business Documents",
    subtitle: "Your business file workspace — quotes, contracts, attachments",
    emphasis: "secondary",
    advisorName: "Document Advisor",
    advisorSpecialty: "Document lifecycle and compliance tracking",
    categories: ["All", "Quotes", "Invoices", "Contracts", "Attachments", "Images"],
    terminology: { document: "Document", file: "File", contract: "Contract", attachment: "Attachment" },
    quickActions: ["Upload", "Search", "Share", "Archive"],
    kpiLabels: ["Total Files", "Pending Signature", "Expiring Soon", "Starred"],
    boardroomTrigger: "Contracts expiring without renewal action",
  },
  "lead-recovery": {
    title: "Lead Recovery",
    subtitle: "Win back stalled leads and dormant prospects",
    emphasis: "secondary",
    advisorName: "Recovery Advisor",
    advisorSpecialty: "Re-engagement strategy and win-back campaigns",
    categories: ["Cold Leads", "Campaigns", "ROI"],
    terminology: { lead: "Lead", recovery: "Recovery", winback: "Win-Back", reactivation: "Reactivation" },
    quickActions: ["Launch Campaign", "Call Lead", "Send Outreach", "Review ROI"],
    kpiLabels: ["Recovered", "Revenue Saved", "Active Campaigns", "Recovery Rate"],
    boardroomTrigger: "High-value leads dormant beyond recovery window",
  },
  communications: {
    title: "Communications Center",
    subtitle: "Every message, draft, and follow-up in one place",
    emphasis: "secondary",
    advisorName: "Communications Advisor",
    advisorSpecialty: "Message timing, tone, and response strategy",
    categories: ["All", "Drafts", "Sent", "Delivered", "Waiting"],
    terminology: { message: "Message", draft: "Draft", outreach: "Outreach", followUp: "Follow-Up" },
    quickActions: ["New Message", "Review Drafts", "Send All Ready", "Check Opens"],
    kpiLabels: ["Total Messages", "Pending Drafts", "Open Rate", "Response Rate"],
    boardroomTrigger: "Batch of unapproved communications awaiting action",
  },
  proof: {
    title: "Business Proof & Receipts",
    subtitle: "Every action has a verifiable trail",
    emphasis: "secondary",
    advisorName: "Trust Advisor",
    advisorSpecialty: "Verification, audit trails, and compliance proof",
    categories: ["All", "Verified", "Pending", "Approvals"],
    terminology: { receipt: "Receipt", proof: "Proof", verification: "Verification", trail: "Trail" },
    quickActions: ["Verify", "Approve", "Export Trail", "Flag Issue"],
    kpiLabels: ["Total Receipts", "Verified", "Pending Review", "Approvals Needed"],
    boardroomTrigger: "Unverified actions in critical workflow chains",
  },
  opportunities: {
    title: "Opportunities",
    subtitle: "Track deals from discovery to close",
    emphasis: "primary",
    advisorName: "Opportunity Advisor",
    advisorSpecialty: "Deal velocity and close-rate optimization",
    categories: ["All", "At Risk", "High Confidence", "Won"],
    terminology: { deal: "Deal", pipeline: "Pipeline", stage: "Stage", opportunity: "Opportunity" },
    quickActions: ["New Opportunity", "Follow Up", "Mark Won", "Mark Lost"],
    kpiLabels: ["Open", "Pipeline Value", "At Risk", "Avg Confidence"],
    boardroomTrigger: "Pipeline velocity stalling or high-value deals going stale",
  },
  overview: {
    title: "Business Home",
    subtitle: "Your operating room — what matters now",
    emphasis: "primary",
    advisorName: "Business Advisor",
    advisorSpecialty: "Operational pulse and strategic priority surfacing",
    categories: [],
    terminology: { pulse: "Pulse", revenue: "Revenue", pipeline: "Pipeline", conversion: "Conversion" },
    quickActions: ["Review Leads", "Check Invoices", "Open Boardroom", "Ask Advisor"],
    kpiLabels: ["Pipeline Value", "Revenue", "Customers", "Conversion"],
    boardroomTrigger: "Multiple domain alerts converging",
  },
  boardroom: {
    title: "Business Boardroom",
    subtitle: "Strategic command — evidence-based decisions",
    emphasis: "primary",
    advisorName: "Boardroom Council",
    advisorSpecialty: "Cross-domain synthesis and strategic recommendation",
    categories: ["Weekly Review", "Monthly Review", "Quarterly Review"],
    terminology: { session: "Session", agenda: "Agenda", motion: "Motion", receipt: "Receipt" },
    quickActions: ["Open Session", "Review Evidence", "Approve Motion", "Export Receipts"],
    kpiLabels: ["Revenue", "New Leads", "At Risk", "Decisions Pending"],
    boardroomTrigger: "Scheduled review or critical escalation",
  },
  ecommerce: {
    title: "E-Commerce Manager",
    subtitle: "Store performance, orders, and customer lifecycle",
    emphasis: "hidden",
    advisorName: "E-Commerce Advisor",
    advisorSpecialty: "Store optimization and conversion rate improvement",
    categories: ["Orders", "Products", "Analytics", "Campaigns"],
    terminology: { order: "Order", cart: "Cart", sku: "SKU", conversion: "Conversion" },
    quickActions: ["View Orders", "Check Inventory", "Launch Campaign", "Review Analytics"],
    kpiLabels: ["Orders Today", "Revenue", "Cart Abandon Rate", "Avg Order Value"],
    boardroomTrigger: "Conversion rate drop or inventory stockout",
  },
  social: {
    title: "Social Command",
    subtitle: "Social presence and content strategy",
    emphasis: "tertiary",
    advisorName: "Social Advisor",
    advisorSpecialty: "Content strategy and audience engagement",
    categories: ["Feed", "Scheduled", "Analytics", "Drafts"],
    terminology: { post: "Post", campaign: "Campaign", engagement: "Engagement", reach: "Reach" },
    quickActions: ["New Post", "Schedule", "Review Analytics", "Respond"],
    kpiLabels: ["Posts This Week", "Engagement Rate", "Followers", "Scheduled"],
    boardroomTrigger: "Engagement drop or brand sentiment shift",
  },
  website: {
    title: "Website Builder",
    subtitle: "Your digital presence and landing pages",
    emphasis: "tertiary",
    advisorName: "Web Advisor",
    advisorSpecialty: "Website performance and lead capture optimization",
    categories: ["Pages", "Forms", "Analytics", "SEO"],
    terminology: { page: "Page", form: "Form", landing: "Landing Page", cta: "CTA" },
    quickActions: ["Edit Page", "New Landing Page", "Check SEO", "View Analytics"],
    kpiLabels: ["Visitors", "Conversions", "Bounce Rate", "Top Pages"],
    boardroomTrigger: "Traffic drop or form conversion decline",
  },
};

// ── Per-archetype overrides ───────────────────────────────────

const OVERRIDES: Partial<Record<ProfileArchetype, Partial<Record<ModuleId, Partial<ModuleAdaptation>>>>> = {
  ecommerce: {
    support: {
      title: "Customer Support",
      subtitle: "Order issues, returns, refunds — protect buyer trust",
      emphasis: "primary",
      advisorSpecialty: "Order issue resolution, refund handling, buyer retention",
      categories: ["All Open", "Order Issues", "Returns/Refunds", "Shipping", "Resolved"],
      terminology: { issue: "Ticket", customer: "Buyer", sla: "Response SLA", queue: "Ticket Queue" },
      kpiLabels: ["Open Tickets", "Returns Pending", "Avg Response", "CSAT"],
    },
    operations: {
      title: "Fulfillment Center",
      subtitle: "Order processing, shipping, and returns operations",
      emphasis: "primary",
      advisorSpecialty: "Fulfillment speed, shipping accuracy, return processing",
      categories: ["All", "Fulfillment Queue", "Returns", "Shipping Issues", "Exceptions"],
      terminology: { item: "Order", queue: "Fulfillment Queue", bottleneck: "Backlog", owner: "Handler" },
      kpiLabels: ["Fulfillment Rate", "Returns", "Shipping Issues", "Backlog"],
    },
    "follow-through": {
      title: "Customer Follow-Up",
      subtitle: "Cart recovery, post-purchase, and retention outreach",
      categories: ["Cart Recovery", "Post-Purchase", "Review Requests", "Win-Back", "Retention"],
      terminology: { thread: "Sequence", followUp: "Touchpoint", stale: "Abandoned", recovery: "Win-Back" },
      kpiLabels: ["Abandoned Carts", "Recovery Value", "Post-Purchase Sent", "Review Requests"],
    },
    appointments: { emphasis: "hidden" },
    quotes: {
      emphasis: "tertiary",
      title: "Custom Pricing",
      subtitle: "Custom quotes for wholesale and B2B orders",
      terminology: { quote: "Price Quote", proposal: "Custom Offer", estimate: "Price Sheet", offer: "Offer" },
    },
    collections: {
      title: "Payment Recovery",
      subtitle: "Recover failed payments and outstanding balances",
      terminology: { account: "Order", aging: "Aging", chase: "Recovery Sequence", escalation: "Dispute" },
      kpiLabels: ["Failed Payments", "Outstanding", "Recovery Rate", "Disputes"],
    },
    documents: {
      categories: ["All", "Orders", "Invoices", "Returns", "Shipping"],
      terminology: { document: "Order Doc", file: "File", contract: "Agreement", attachment: "Attachment" },
    },
    "lead-recovery": {
      title: "Cart & Lead Recovery",
      subtitle: "Recover abandoned carts and dormant shoppers",
      terminology: { lead: "Prospect", recovery: "Cart Recovery", winback: "Win-Back", reactivation: "Re-Engagement" },
      categories: ["Abandoned Carts", "Dormant Buyers", "Campaigns", "ROI"],
    },
    opportunities: {
      title: "Upsell Opportunities",
      subtitle: "Cross-sell, upsell, and repeat purchase opportunities",
      terminology: { deal: "Upsell", pipeline: "Revenue Pipeline", stage: "Stage", opportunity: "Opportunity" },
    },
    overview: {
      subtitle: "Store pulse — orders, revenue, customer health",
      terminology: { pulse: "Store Pulse", revenue: "Sales", pipeline: "Order Pipeline", conversion: "Conversion Rate" },
      kpiLabels: ["Orders Today", "Revenue", "Active Buyers", "Conversion Rate"],
    },
    ecommerce: { emphasis: "primary" },
    social: { emphasis: "secondary", title: "Social Commerce" },
    boardroom: {
      advisorSpecialty: "Revenue optimization, retention, and conversion analysis",
      kpiLabels: ["Sales Revenue", "Cart Recovery", "Returns Rate", "Customer LTV"],
    },
  },

  service: {
    support: {
      title: "Client Support",
      subtitle: "Service issues, scope changes, and client satisfaction",
      advisorSpecialty: "Client relationship preservation and service recovery",
      categories: ["All Open", "Service Issues", "Scope Changes", "Client Feedback", "Resolved"],
      terminology: { issue: "Case", customer: "Client", sla: "Response Time", queue: "Case Queue" },
      kpiLabels: ["Open Cases", "Scope Issues", "Avg Resolution", "Client Satisfaction"],
    },
    operations: {
      title: "Service Delivery",
      subtitle: "Active projects, delivery milestones, and team workload",
      emphasis: "primary",
      advisorSpecialty: "Project delivery, milestone tracking, and resource allocation",
      categories: ["All", "Active Projects", "At Risk", "Milestones Due", "Team Load"],
      terminology: { item: "Project", queue: "Delivery Queue", bottleneck: "Blocker", owner: "Project Lead" },
      kpiLabels: ["Active Projects", "At Risk", "Milestones Due", "Team Capacity"],
    },
    "follow-through": {
      subtitle: "Quote follow-ups, consult callbacks, and delivery check-ins",
      categories: ["Consult Follow-Up", "Quote Follow-Up", "Delivery Check-In", "Drafts", "Overdue"],
      terminology: { thread: "Thread", followUp: "Follow-Up", stale: "Cold", recovery: "Re-Engage" },
    },
    appointments: {
      emphasis: "secondary",
      title: "Meetings & Consultations",
      terminology: { appointment: "Meeting", booking: "Consultation", noShow: "No-Show", slot: "Time Slot" },
    },
    quotes: {
      emphasis: "primary",
      title: "Estimates & Proposals",
      subtitle: "Build, send, and close service estimates",
      terminology: { quote: "Estimate", proposal: "Proposal", estimate: "Scope Doc", offer: "Service Offer" },
    },
    collections: {
      subtitle: "Recover outstanding invoices with client sensitivity",
      advisorSpecialty: "Relationship-aware payment recovery for service clients",
      terminology: { account: "Client Account", aging: "Invoice Age", chase: "Gentle Reminder", escalation: "Escalation" },
    },
    documents: {
      categories: ["All", "Proposals", "Contracts", "SOWs", "Invoices", "Deliverables"],
      terminology: { document: "Document", file: "File", contract: "Service Agreement", attachment: "Deliverable" },
    },
    "lead-recovery": {
      title: "Prospect Recovery",
      subtitle: "Re-engage stalled consultations and proposals",
      terminology: { lead: "Prospect", recovery: "Re-Engagement", winback: "Reactivation", reactivation: "Follow-Up" },
      categories: ["Stalled Proposals", "Cold Consults", "Campaigns", "ROI"],
    },
    opportunities: {
      title: "Projects & Deals",
      subtitle: "Track service deals from inquiry to close",
      terminology: { deal: "Project", pipeline: "Sales Pipeline", stage: "Stage", opportunity: "Opportunity" },
    },
    overview: {
      subtitle: "Client operations — pipeline, delivery, revenue health",
      terminology: { pulse: "Client Pulse", revenue: "Billings", pipeline: "Project Pipeline", conversion: "Close Rate" },
      kpiLabels: ["Pipeline Value", "Billings", "Active Clients", "Close Rate"],
    },
    boardroom: {
      advisorSpecialty: "Pipeline health, client risk, and delivery quality synthesis",
      kpiLabels: ["Billings", "Pipeline", "At Risk Clients", "Proposal Win Rate"],
    },
  },

  "brick-and-mortar": {
    support: {
      title: "Customer Care",
      subtitle: "In-store issues, local complaints, and service recovery",
      categories: ["All Open", "In-Store Issues", "Complaints", "Returns", "Resolved"],
      terminology: { issue: "Complaint", customer: "Customer", sla: "Response Time", queue: "Care Queue" },
    },
    operations: {
      title: "Store Operations",
      subtitle: "Daily operations, staffing, and local execution",
      emphasis: "primary",
      categories: ["All", "Staffing", "Inventory", "Store Issues", "Daily Checklist"],
      terminology: { item: "Task", queue: "Ops Queue", bottleneck: "Staffing Gap", owner: "Manager" },
      kpiLabels: ["Open Tasks", "Staff Coverage", "Inventory Alerts", "Daily Score"],
    },
    appointments: {
      emphasis: "secondary",
      title: "Bookings & Walk-Ins",
      terminology: { appointment: "Booking", booking: "Walk-In", noShow: "No-Show", slot: "Time Slot" },
    },
    quotes: { emphasis: "tertiary" },
    "lead-recovery": {
      title: "Customer Win-Back",
      subtitle: "Re-engage lapsed local customers",
      terminology: { lead: "Lapsed Customer", recovery: "Win-Back", winback: "Reactivation", reactivation: "Local Outreach" },
    },
    ecommerce: { emphasis: "hidden" },
    social: { emphasis: "secondary", title: "Local Marketing" },
    website: { title: "Local Presence", subtitle: "Your local web presence and Google listing" },
    overview: {
      subtitle: "Store pulse — foot traffic, staffing, daily operations",
      kpiLabels: ["Daily Revenue", "Walk-Ins", "Staff Coverage", "Inventory Health"],
    },
  },

  "employee-based": {
    operations: {
      title: "Workforce Operations",
      subtitle: "Team workload, assignments, and accountability tracking",
      emphasis: "primary",
      categories: ["All", "Assignments", "Overdue", "Team Load", "Blockers"],
      terminology: { item: "Assignment", queue: "Work Queue", bottleneck: "Blocker", owner: "Assignee" },
      kpiLabels: ["Open Assignments", "Overdue", "Team Utilization", "Blockers"],
    },
    "follow-through": {
      title: "Task Follow-Through",
      subtitle: "Assignment completion, handoffs, and accountability",
      categories: ["Overdue Tasks", "Handoff Pending", "Waiting on Team", "Drafts", "Completed"],
      terminology: { thread: "Task", followUp: "Check-In", stale: "Overdue", recovery: "Reassign" },
    },
    appointments: { emphasis: "tertiary" },
    ecommerce: { emphasis: "hidden" },
    overview: {
      subtitle: "Team operations — workload, assignments, and execution velocity",
      kpiLabels: ["Active Assignments", "Team Size", "Completion Rate", "Overdue"],
    },
    boardroom: {
      advisorSpecialty: "Workload distribution, team accountability, and execution drift",
      kpiLabels: ["Assignments", "Team Utilization", "Completion Rate", "Blockers"],
    },
  },

  "appointment-based": {
    appointments: {
      emphasis: "primary",
      title: "Schedule Command",
      subtitle: "Your appointment engine — confirmations, prep, recovery",
      advisorSpecialty: "Schedule optimization, no-show prevention, revenue-per-slot maximization",
    },
    support: {
      categories: ["All Open", "Scheduling Issues", "Service Complaints", "Billing", "Resolved"],
      terminology: { issue: "Case", customer: "Client", sla: "Response Window", queue: "Case Queue" },
    },
    operations: {
      title: "Schedule Operations",
      subtitle: "Daily schedule flow, prep windows, and provider coverage",
      categories: ["All", "Today's Prep", "Schedule Gaps", "Provider Load", "Exceptions"],
      terminology: { item: "Slot", queue: "Schedule Queue", bottleneck: "Gap", owner: "Provider" },
      kpiLabels: ["Slots Today", "Utilization", "No-Show Risk", "Prep Status"],
    },
    "follow-through": {
      categories: ["Post-Visit Follow-Up", "Rebooking Prompts", "Reminder Queue", "Drafts", "Recovery"],
      terminology: { thread: "Follow-Up", followUp: "Check-In", stale: "Unbooked", recovery: "Rebook" },
    },
    "lead-recovery": {
      title: "Booking Recovery",
      subtitle: "Recover no-shows and rebook lapsed clients",
      terminology: { lead: "Lapsed Client", recovery: "Rebooking", winback: "Re-Engagement", reactivation: "Rebook" },
      categories: ["No-Show Recovery", "Lapsed Clients", "Campaigns", "ROI"],
    },
    overview: {
      subtitle: "Schedule pulse — today's bookings, confirmations, and revenue",
      kpiLabels: ["Bookings Today", "Revenue", "No-Show Risk", "Utilization"],
    },
    ecommerce: { emphasis: "hidden" },
    boardroom: {
      advisorSpecialty: "Booking load, no-show trends, and schedule-driven revenue analysis",
      kpiLabels: ["Booking Revenue", "No-Show Rate", "Utilization", "Rebooking Rate"],
    },
  },

  agency: {
    support: {
      title: "Client Support",
      subtitle: "Client requests, scope changes, and delivery issues",
      categories: ["All Open", "Client Requests", "Scope Creep", "Delivery Issues", "Resolved"],
      terminology: { issue: "Request", customer: "Client", sla: "Turnaround", queue: "Request Queue" },
    },
    operations: {
      title: "Project Operations",
      subtitle: "Active campaigns, delivery status, and team capacity",
      emphasis: "primary",
      categories: ["All", "Campaigns", "Deliverables Due", "Client Reviews", "Team Capacity"],
      terminology: { item: "Deliverable", queue: "Campaign Queue", bottleneck: "Bottleneck", owner: "Account Lead" },
    },
    quotes: {
      emphasis: "primary",
      title: "Proposals & Retainers",
      terminology: { quote: "Proposal", proposal: "SOW", estimate: "Budget Estimate", offer: "Retainer Offer" },
    },
    appointments: { emphasis: "secondary", title: "Client Meetings" },
    ecommerce: { emphasis: "hidden" },
    overview: {
      subtitle: "Agency pulse — clients, campaigns, and revenue pipeline",
      kpiLabels: ["Retainer MRR", "Active Clients", "Pipeline", "Utilization"],
    },
  },

  "professional-practice": {
    appointments: {
      emphasis: "primary",
      title: "Patient/Client Schedule",
      terminology: { appointment: "Session", booking: "Appointment", noShow: "No-Show", slot: "Time Block" },
    },
    support: {
      title: "Patient/Client Care",
      terminology: { issue: "Case", customer: "Patient", sla: "Response SLA", queue: "Care Queue" },
    },
    operations: {
      title: "Practice Operations",
      categories: ["All", "Daily Schedule", "Prep Queue", "Follow-Ups", "Admin"],
    },
    quotes: { emphasis: "tertiary", title: "Treatment Estimates" },
    ecommerce: { emphasis: "hidden" },
    overview: {
      subtitle: "Practice pulse — schedule, patient flow, and billing",
      kpiLabels: ["Sessions Today", "Revenue", "No-Show Rate", "Patient Satisfaction"],
    },
  },

  "multi-location": {
    operations: {
      title: "Multi-Location Ops",
      subtitle: "Cross-location performance, staffing, and execution",
      emphasis: "primary",
      categories: ["All Locations", "Staffing", "Performance", "Alerts", "Compliance"],
      terminology: { item: "Location Task", queue: "Location Queue", bottleneck: "Staffing Gap", owner: "Location Manager" },
    },
    overview: {
      subtitle: "Multi-location pulse — revenue, staffing, and performance by site",
      kpiLabels: ["Total Revenue", "Locations", "Top Performer", "Staffing Gaps"],
    },
  },

  membership: {
    "follow-through": {
      title: "Member Engagement",
      subtitle: "Renewal nudges, usage check-ins, and churn prevention",
      categories: ["Renewals Due", "At-Risk Members", "Engagement Drops", "Win-Back", "Onboarding"],
      terminology: { thread: "Member Thread", followUp: "Check-In", stale: "Disengaged", recovery: "Reactivation" },
    },
    collections: {
      title: "Subscription Recovery",
      subtitle: "Failed renewals, expired cards, and payment recovery",
      terminology: { account: "Member", aging: "Lapsed", chase: "Recovery Sequence", escalation: "Cancellation Risk" },
    },
    overview: {
      subtitle: "Membership pulse — MRR, churn, engagement, and growth",
      kpiLabels: ["MRR", "Active Members", "Churn Rate", "Renewal Rate"],
    },
  },
};

// ── Public API ────────────────────────────────────────────────

/**
 * Get the full adaptation config for a specific module and archetype.
 * Merges base defaults with archetype-specific overrides.
 */
export function getModuleAdaptation(moduleId: string, archetype: ProfileArchetype): ModuleAdaptation {
  const base = BASE[moduleId as ModuleId];
  if (!base) {
    return BASE.overview; // fallback
  }

  const overrides = OVERRIDES[archetype]?.[moduleId as ModuleId];
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    terminology: { ...base.terminology, ...(overrides.terminology || {}) },
  };
}

/**
 * Get emphasis level for a module given an archetype.
 * Used for sidebar visibility and home widget composition.
 */
export function getModuleEmphasis(moduleId: string, archetype: ProfileArchetype): ModuleAdaptation["emphasis"] {
  return getModuleAdaptation(moduleId, archetype).emphasis;
}

/**
 * Get all module adaptations for a given archetype.
 */
export function getAllModuleAdaptations(archetype: ProfileArchetype): Record<string, ModuleAdaptation> {
  const result: Record<string, ModuleAdaptation> = {};
  for (const key of Object.keys(BASE)) {
    result[key] = getModuleAdaptation(key, archetype);
  }
  return result;
}
