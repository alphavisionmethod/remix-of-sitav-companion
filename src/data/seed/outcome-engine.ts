// SITA OS — Demo Data: Outcome Engine

export const DEMO_OUTCOMES = [
  {
    id: "O-1", title: "Get more booked clients",
    description: "Increase booking rate from 22% to 35% by recovering stale leads and optimizing follow-up timing",
    progress: 42, domain: "business" as const, impact: "high" as const,
    blockers: ["4 leads cooling off — no follow-up in 5+ days", "Thursday schedule conflict blocking callback window"],
    nextAction: "Send follow-up to Sarah Chen at Bloom Studio",
  },
  {
    id: "O-2", title: "Stabilize monthly cash flow",
    description: "Reduce cash flow volatility by 40% through better bill timing, collections acceleration, and reserve buffers",
    progress: 67, domain: "money" as const, impact: "high" as const,
    blockers: ["Invoice INV-002 overdue by 10 days ($1,200)"],
    nextAction: "Send payment reminder to Bloom Studio",
  },
  {
    id: "O-3", title: "Create a calmer school week",
    description: "Eliminate Thursday scheduling conflicts and automate recurring logistics for school activities",
    progress: 55, domain: "concierge" as const, impact: "medium" as const,
    blockers: ["3 conflicts on Thursday", "Soccer pickup not delegated"],
    nextAction: "Reschedule dentist appointment to avoid Thursday overload",
  },
  {
    id: "O-4", title: "Reduce unnecessary spending",
    description: "Cut $2,400/year in wasted subscriptions and negotiate better rates on recurring services",
    progress: 28, domain: "money" as const, impact: "medium" as const,
    blockers: ["Adobe CC only 15% used", "Figma seats underutilized"],
    nextAction: "Review Adobe CC usage and consider downgrade",
  },
  {
    id: "O-5", title: "Free up 5 hours/week of founder time",
    description: "Delegate recurring operational tasks to reach target autonomous execution rate",
    progress: 34, domain: "cross-domain" as const, impact: "high" as const,
    blockers: ["3 recurring tasks still require manual approval", "Grocery compilation not fully trusted"],
    nextAction: "Promote 'Auto-pay bills under $500' to delegated-recurring",
  },
];

export const DEMO_INTERVENTIONS = [
  {
    title: "Unblock Thursday — one reschedule fixes 3 domains",
    description: "Moving Maya's dentist from Thursday 10am to Monday 2pm clears the schedule conflict, opens a callback window for 2 cooling leads, and reduces household stress from triple-booking.",
    impact: "3 domains unblocked, 2h recovered, $24K pipeline re-engaged",
    affectedDomains: ["business", "concierge", "household"],
    urgency: "today" as const, effort: "quick" as const,
  },
  {
    title: "Send overdue invoice reminder to Bloom Studio",
    description: "INV-002 is 10 days overdue. Auto-reminder is drafted and policy-approved. One click to send.",
    impact: "$1,200 receivable recovery",
    affectedDomains: ["money", "business"],
    urgency: "now" as const, effort: "quick" as const,
  },
  {
    title: "Cancel or downgrade Adobe CC subscription",
    description: "Only 15% usage over 90 days. Cancellation saves $660/year. Draft notice prepared.",
    impact: "$660/year savings",
    affectedDomains: ["money"],
    urgency: "this-week" as const, effort: "moderate" as const,
  },
];

export const DEMO_SPILLOVERS = [
  {
    from: "concierge" as const, to: "business" as const, impact: "high" as const,
    title: "Thursday overload hurting callbacks",
    description: "3 scheduling conflicts on Thursday are blocking your best callback window. 2 high-value leads have gone 5+ days without follow-up during this recurring conflict.",
    intervention: "Reschedule dentist to Monday — opens Thursday 10am-12pm for callbacks",
  },
  {
    from: "money" as const, to: "business" as const, impact: "medium" as const,
    title: "Overdue invoice creating collection anxiety",
    description: "Bloom Studio's overdue INV-002 is occupying mental bandwidth that could go toward pipeline development. The unresolved receivable is also impacting cash flow confidence.",
    intervention: "Send auto-reminder now — system estimates 78% collection probability within 48h",
  },
  {
    from: "business" as const, to: "household" as const, impact: "medium" as const,
    title: "Late-evening work sessions from lead backlog",
    description: "Stale lead queue is causing after-hours catch-up work 3 days this week, reducing family time and increasing next-day fatigue.",
    intervention: "Delegate morning lead triage to SITA — currently at suggest level, ready for approve-execute",
  },
];
