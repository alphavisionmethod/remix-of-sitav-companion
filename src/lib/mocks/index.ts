// ============================================================
// SITA OS — Consolidated Mock Data
// All demo/sample data for every module lives here.
// When mode === "demo", hooks return data from this file.
// When mode === "live", hooks call real APIs/Supabase.
// ============================================================

// ── Business ──────────────────────────────────────────────
export const mockLeads = [
  { id: "L-001", name: "Sarah Chen", company: "Bloom Studio", source: "Website", status: "new", score: 87, value: "$12,000", lastTouch: "2h ago", nextAction: "Follow-up call" },
  { id: "L-002", name: "Marcus Rivera", company: "RiverTech", source: "Referral", status: "contacted", score: 72, value: "$8,500", lastTouch: "1d ago", nextAction: "Send proposal" },
  { id: "L-003", name: "Emily Park", company: "Park & Associates", source: "LinkedIn", status: "qualified", score: 91, value: "$24,000", lastTouch: "3h ago", nextAction: "Schedule demo" },
  { id: "L-004", name: "James Morton", company: "Morton Labs", source: "Cold outreach", status: "cooling", score: 45, value: "$6,000", lastTouch: "5d ago", nextAction: "Re-engage" },
];

export const mockCustomers = [
  { id: "C-001", name: "Acme Corp", contact: "John Doe", mrr: "$2,400", health: "healthy", since: "Jan 2024", lastInteraction: "Yesterday" },
  { id: "C-002", name: "Bloom Studio", contact: "Sarah Chen", mrr: "$1,200", health: "at-risk", since: "Mar 2024", lastInteraction: "2 weeks ago" },
  { id: "C-003", name: "NovaTech", contact: "Lisa Wang", mrr: "$4,800", health: "healthy", since: "Nov 2023", lastInteraction: "Today" },
];

export const mockOpportunities = [
  { id: "O-001", name: "Acme Expansion", value: "$48,000", stage: "negotiation", probability: 75, owner: "You", daysOpen: 34 },
  { id: "O-002", name: "Bloom Retainer", value: "$14,400", stage: "proposal", probability: 60, owner: "You", daysOpen: 12 },
  { id: "O-003", name: "NovaTech Upgrade", value: "$24,000", stage: "discovery", probability: 40, owner: "You", daysOpen: 5 },
];

export const mockQuotes = [
  { id: "Q-001", client: "Acme Corp", amount: "$12,000", status: "sent", sentDate: "Mar 28", expiresIn: "3 days" },
  { id: "Q-002", client: "Bloom Studio", amount: "$3,600", status: "draft", sentDate: null, expiresIn: null },
  { id: "Q-003", client: "NovaTech", amount: "$8,400", status: "accepted", sentDate: "Mar 25", expiresIn: null },
];

export const mockInvoices = [
  { id: "INV-001", client: "Acme Corp", amount: "$2,400", status: "paid", dueDate: "Mar 15", paidDate: "Mar 14" },
  { id: "INV-002", client: "Bloom Studio", amount: "$1,200", status: "overdue", dueDate: "Mar 20", paidDate: null },
  { id: "INV-003", client: "NovaTech", amount: "$4,800", status: "pending", dueDate: "Apr 5", paidDate: null },
];

export const mockCommunications = [
  { id: "COM-001", to: "Sarah Chen", subject: "Follow-up: Project Proposal", channel: "email", status: "sent", sentAt: "Today 9:15 AM", opened: true },
  { id: "COM-002", to: "John Doe", subject: "Monthly check-in", channel: "email", status: "draft", sentAt: null, opened: false },
  { id: "COM-003", to: "Lisa Wang", subject: "Contract renewal reminder", channel: "slack", status: "sent", sentAt: "Yesterday 3:00 PM", opened: true },
  { id: "COM-004", to: "Marcus Rivera", subject: "Intro call scheduling", channel: "sms", status: "sent", sentAt: "Yesterday 11:30 AM", opened: false },
];

// ── Money ─────────────────────────────────────────────────
export const mockBills = [
  { id: "B-001", name: "Office Rent", amount: "$2,500", dueDate: "Apr 1", status: "upcoming", recurring: true, category: "Rent" },
  { id: "B-002", name: "AWS Hosting", amount: "$342", dueDate: "Apr 3", status: "upcoming", recurring: true, category: "Infrastructure" },
  { id: "B-003", name: "Insurance Premium", amount: "$890", dueDate: "Mar 30", status: "overdue", recurring: true, category: "Insurance" },
  { id: "B-004", name: "Internet Service", amount: "$99", dueDate: "Apr 10", status: "scheduled", recurring: true, category: "Utilities" },
];

export const mockSubscriptions = [
  { id: "S-001", name: "Slack Business", cost: "$12.50/user", totalCost: "$62.50", usage: "85%", status: "active", renewal: "Monthly" },
  { id: "S-002", name: "Figma Pro", cost: "$15/user", totalCost: "$45", usage: "40%", status: "underused", renewal: "Monthly" },
  { id: "S-003", name: "Notion Team", cost: "$10/user", totalCost: "$50", usage: "92%", status: "active", renewal: "Monthly" },
  { id: "S-004", name: "Adobe CC", cost: "$54.99", totalCost: "$54.99", usage: "15%", status: "waste", renewal: "Annual" },
];

export const mockCashFlow = {
  available: "$24,680",
  incoming: "$12,400",
  outgoing: "$8,900",
  safeToSpend: "$15,780",
  runway: "3.2 months",
  nextBigExpense: { name: "Quarterly Tax", amount: "$4,200", date: "Apr 15" },
};

// ── Concierge / Household ─────────────────────────────────
export const mockHouseholdTasks = [
  { id: "HT-001", title: "Grocery run — weekly staples", assignee: "You", due: "Today", priority: "high", status: "pending" },
  { id: "HT-002", title: "Schedule HVAC maintenance", assignee: "SITA", due: "This week", priority: "medium", status: "in-progress" },
  { id: "HT-003", title: "Pick up dry cleaning", assignee: "You", due: "Tomorrow", priority: "low", status: "pending" },
  { id: "HT-004", title: "Renew car registration", assignee: "You", due: "Apr 12", priority: "high", status: "pending" },
];

export const mockFamilyEvents = [
  { id: "FE-001", title: "Soccer Practice", who: "Alex", when: "Today 4:00 PM", location: "Wilson Park" },
  { id: "FE-002", title: "Parent-Teacher Meeting", who: "Both", when: "Thu 3:30 PM", location: "Lincoln Elementary" },
  { id: "FE-003", title: "Dance Recital", who: "Maya", when: "Sat 2:00 PM", location: "Community Center" },
  { id: "FE-004", title: "Dentist — Maya", who: "Maya", when: "Next Mon 10:00 AM", location: "Dr. Kim's office" },
];

export const mockGroceryList = [
  { id: "G-001", item: "Organic milk (2)", category: "Dairy", status: "needed", recurring: true },
  { id: "G-002", item: "Bananas", category: "Produce", status: "needed", recurring: true },
  { id: "G-003", item: "Chicken breast (2 lbs)", category: "Meat", status: "needed", recurring: false },
  { id: "G-004", item: "Whole wheat bread", category: "Bakery", status: "needed", recurring: true },
  { id: "G-005", item: "Laundry detergent", category: "Household", status: "running-low", recurring: true },
];

export const mockTravel = [
  { id: "TR-001", trip: "NYC Business Trip", dates: "Apr 14–16", status: "booked", flight: "AA 1240 — JFK", hotel: "The Standard, High Line", gaps: ["No dinner reservation Apr 15"] },
  { id: "TR-002", trip: "Family Beach Weekend", dates: "Apr 25–27", status: "planning", flight: null, hotel: "Searching...", gaps: ["Need to book hotel", "Car rental"] },
];

// ── Activity / Timeline ───────────────────────────────────
export const mockActivity = [
  { id: "A-001", type: "noticed", message: "Invoice INV-002 is 10 days overdue", time: "5 min ago", domain: "money" },
  { id: "A-002", type: "recommended", message: "Send follow-up to Bloom Studio — last contact 2 weeks ago", time: "12 min ago", domain: "business" },
  { id: "A-003", type: "executed", message: "Scheduled HVAC maintenance with ServicePro", time: "1h ago", domain: "concierge" },
  { id: "A-004", type: "approved", message: "Auto-paid AWS hosting bill — $342", time: "2h ago", domain: "money" },
  { id: "A-005", type: "verified", message: "Grocery delivery confirmed for Thursday", time: "3h ago", domain: "concierge" },
  { id: "A-006", type: "noticed", message: "Thursday schedule overloaded — 3 conflicts detected", time: "4h ago", domain: "concierge" },
];

// ── Opportunity Engine ────────────────────────────────────
export const mockOpportunityInsights = [
  { id: "OI-001", title: "4 leads cooling off", description: "Callback windows identified with follow-up drafts prepared", domain: "business", impact: "high", savings: "$24,000 pipeline at risk" },
  { id: "OI-002", title: "Adobe CC underused", description: "Only 15% usage — consider downgrade or cancellation", domain: "money", impact: "medium", savings: "$660/yr savings" },
  { id: "OI-003", title: "Thursday overload", description: "3 scheduling conflicts — calmer plan available", domain: "concierge", impact: "high", savings: "2h time recovered" },
  { id: "OI-004", title: "Invoice overdue", description: "Bloom Studio INV-002 is 10 days past due — auto-reminder ready", domain: "money", impact: "high", savings: "$1,200 receivable" },
];

// ── Memory ────────────────────────────────────────────────
export const mockMemoryItems = [
  { id: "M-001", category: "profile", fact: "Prefers concise morning summaries", confidence: 92, source: "Observed pattern", editable: true },
  { id: "M-002", category: "business", fact: "Sends proposals on Tuesdays — higher close rate", confidence: 78, source: "Inferred from history", editable: true },
  { id: "M-003", category: "money", fact: "Bills paid 2 days before due date on average", confidence: 95, source: "Transaction history", editable: false },
  { id: "M-004", category: "household", fact: "Grocery run happens every Thursday", confidence: 88, source: "Calendar + receipts", editable: true },
  { id: "M-005", category: "preferences", fact: "Risk tolerance: moderate", confidence: 70, source: "Onboarding + behavior", editable: true },
];

// ── System / Connectors ───────────────────────────────────
export const mockConnectors = [
  { id: "slack", name: "Slack", status: "connected" as const, lastSync: "2 min ago", category: "communication" },
  { id: "resend", name: "Resend", status: "connected" as const, lastSync: "Just now", category: "email" },
  { id: "twilio", name: "Twilio", status: "connected" as const, lastSync: "5 min ago", category: "sms" },
  { id: "stripe", name: "Stripe", status: "connected" as const, lastSync: "1 min ago", category: "payments" },
  { id: "google-calendar", name: "Google Calendar", status: "connected" as const, lastSync: "3 min ago", category: "calendar" },
  { id: "quickbooks", name: "QuickBooks", status: "degraded" as const, lastSync: "2h ago", category: "accounting" },
];

// ── Automation Rules ──────────────────────────────────────
export const mockAutomationRules = [
  { id: "AR-001", name: "Auto-pay bills under $500", domain: "money", trustLevel: "execute", enabled: true, executions: 12 },
  { id: "AR-002", name: "Send follow-up after 3 days silence", domain: "business", trustLevel: "approval-ready", enabled: true, executions: 8 },
  { id: "AR-003", name: "Weekly grocery list compilation", domain: "concierge", trustLevel: "execute", enabled: true, executions: 4 },
  { id: "AR-004", name: "Flag invoices overdue > 7 days", domain: "money", trustLevel: "suggest", enabled: true, executions: 3 },
  { id: "AR-005", name: "Schedule conflict detection", domain: "concierge", trustLevel: "suggest", enabled: false, executions: 0 },
];

// ── AI Team ───────────────────────────────────────────────
export const mockAITeam = [
  { name: "Business Advisor", role: "Revenue & lead intelligence", status: "healthy", requests: 142, accuracy: "94%", model: "gpt-4o" },
  { name: "Money Advisor", role: "Cash flow & bill optimization", status: "healthy", requests: 98, accuracy: "91%", model: "gpt-4o" },
  { name: "Concierge Advisor", role: "Life & household coordination", status: "healthy", requests: 67, accuracy: "88%", model: "gpt-4o-mini" },
  { name: "Workflow Engine", role: "Task execution & orchestration", status: "healthy", requests: 312, accuracy: "99%", model: "rules-engine" },
  { name: "Memory Processor", role: "Learning & pattern recognition", status: "healthy", requests: 89, accuracy: "85%", model: "gpt-4o-mini" },
  { name: "Risk Analyzer", role: "Threat detection & alerts", status: "degraded", requests: 45, accuracy: "82%", model: "gpt-4o" },
];

// ── Incidents ─────────────────────────────────────────────
export const mockIncidents = [
  { id: "INC-042", title: "QuickBooks sync authentication expiring", severity: "medium", status: "open", time: "2h ago", impact: "Financial data freshness" },
  { id: "INC-041", title: "Email delivery retry succeeded", severity: "low", status: "resolved", time: "6h ago", impact: "Communication delay (recovered)" },
  { id: "INC-040", title: "High latency on AI advisor calls", severity: "low", status: "resolved", time: "Yesterday", impact: "Advisor response time 2.1s → 0.8s" },
];

// ── Cost Breakdown ────────────────────────────────────────
export const mockCosts = [
  { service: "AI Model Calls", cost: "$12.40", percentage: 45, trend: "up" as const },
  { service: "Database", cost: "$3.20", percentage: 12, trend: "flat" as const },
  { service: "Edge Functions", cost: "$2.10", percentage: 8, trend: "down" as const },
  { service: "Storage", cost: "$0.80", percentage: 3, trend: "flat" as const },
  { service: "Connectors", cost: "$8.90", percentage: 32, trend: "up" as const },
];
