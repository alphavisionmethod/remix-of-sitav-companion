// ═══════════════════════════════════════════════════════════════
// SITA OS — Full OS Demo Scenario (Default)
// Complete cross-domain data for the unified demo experience
// ═══════════════════════════════════════════════════════════════

export const defaultScenario = {
  name: "Full OS Demo",
  description: "All domains active with rich, interconnected data across business, money, concierge, and household",
  data: {
    // ── Business Domain ──────────────────────────────────────
    leads: [
      { id: "L-D01", name: "Sarah Chen", company: "Bloom Studio", source: "Website", status: "new", score: 87, value: "$12,000", lastTouch: "2h ago", nextAction: "Follow-up call", urgency: "high" },
      { id: "L-D02", name: "Marcus Rivera", company: "RiverTech", source: "Referral", status: "contacted", score: 72, value: "$8,500", lastTouch: "1d ago", nextAction: "Send proposal", urgency: "medium" },
      { id: "L-D03", name: "Emily Park", company: "Park & Associates", source: "LinkedIn", status: "qualified", score: 91, value: "$24,000", lastTouch: "3h ago", nextAction: "Schedule demo", urgency: "high" },
      { id: "L-D04", name: "James Morton", company: "Morton Labs", source: "Cold outreach", status: "cooling", score: 45, value: "$6,000", lastTouch: "5d ago", nextAction: "Re-engage", urgency: "low" },
      { id: "L-D05", name: "Amanda Liu", company: "Liu Design Co", source: "Website", status: "new", score: 78, value: "$15,000", lastTouch: "1h ago", nextAction: "Initial outreach", urgency: "medium" },
      { id: "L-D06", name: "Kevin Tran", company: "Tran Consulting", source: "Conference", status: "qualified", score: 83, value: "$18,000", lastTouch: "4h ago", nextAction: "Send case study", urgency: "medium" },
    ],
    customers: [
      { id: "C-D01", name: "Acme Corp", contact: "John Doe", mrr: "$4,800", health: "healthy", since: "Nov 2023", lastInteraction: "Today", lifetimeRevenue: "$57,600", invoiceCount: 12, overdueInvoices: 0 },
      { id: "C-D02", name: "Bloom Studio", contact: "Sarah Chen", mrr: "$1,200", health: "at-risk", since: "Mar 2024", lastInteraction: "2 weeks ago", lifetimeRevenue: "$14,400", invoiceCount: 6, overdueInvoices: 1 },
      { id: "C-D03", name: "NovaTech", contact: "Lisa Wang", mrr: "$9,600", health: "healthy", since: "Aug 2023", lastInteraction: "Today", lifetimeRevenue: "$96,000", invoiceCount: 20, overdueInvoices: 0 },
      { id: "C-D04", name: "Meridian Health", contact: "Dr. Patel", mrr: "$3,200", health: "healthy", since: "Jan 2024", lastInteraction: "Yesterday", lifetimeRevenue: "$38,400", invoiceCount: 8, overdueInvoices: 0 },
    ],
    opportunities: [
      { id: "O-D01", name: "Acme Expansion", value: "$48,000", stage: "negotiation", probability: 75, owner: "You", daysOpen: 34, nextStep: "Counter-offer review" },
      { id: "O-D02", name: "Bloom Retainer", value: "$14,400", stage: "proposal", probability: 60, owner: "You", daysOpen: 12, nextStep: "Follow up on proposal" },
      { id: "O-D03", name: "NovaTech Upgrade", value: "$24,000", stage: "discovery", probability: 40, owner: "You", daysOpen: 5, nextStep: "Technical assessment" },
      { id: "O-D04", name: "Meridian Platform", value: "$72,000", stage: "qualified", probability: 55, owner: "You", daysOpen: 8, nextStep: "Stakeholder meeting" },
    ],
    invoices: [
      { id: "INV-D01", client: "Acme Corp", amount: "$4,800", status: "paid", dueDate: "Mar 15", paidDate: "Mar 14", agingDays: 0 },
      { id: "INV-D02", client: "Bloom Studio", amount: "$1,200", status: "overdue", dueDate: "Mar 20", paidDate: null, agingDays: 14 },
      { id: "INV-D03", client: "NovaTech", amount: "$9,600", status: "pending", dueDate: "Apr 5", paidDate: null, agingDays: 0 },
      { id: "INV-D04", client: "Meridian Health", amount: "$3,200", status: "sent", dueDate: "Apr 10", paidDate: null, agingDays: 0 },
      { id: "INV-D05", client: "Acme Corp", amount: "$4,800", status: "pending", dueDate: "Apr 15", paidDate: null, agingDays: 0 },
    ],

    // ── Money Domain ─────────────────────────────────────────
    bills: [
      { id: "B-D01", name: "Office Rent", amount: "$2,500", dueDate: "Apr 1", status: "upcoming", recurring: true, category: "Rent", autopay: true },
      { id: "B-D02", name: "AWS Hosting", amount: "$342", dueDate: "Apr 3", status: "upcoming", recurring: true, category: "Infrastructure", autopay: true },
      { id: "B-D03", name: "Insurance Premium", amount: "$890", dueDate: "Mar 30", status: "overdue", recurring: true, category: "Insurance", autopay: false },
      { id: "B-D04", name: "Internet Service", amount: "$99", dueDate: "Apr 10", status: "scheduled", recurring: true, category: "Utilities", autopay: true },
      { id: "B-D05", name: "Quarterly Tax Estimate", amount: "$4,200", dueDate: "Apr 15", status: "upcoming", recurring: false, category: "Tax", autopay: false },
      { id: "B-D06", name: "Accountant Retainer", amount: "$500", dueDate: "Apr 1", status: "upcoming", recurring: true, category: "Professional", autopay: true },
    ],
    subscriptions: [
      { id: "S-D01", name: "Slack Business", cost: "$12.50/user", totalCost: "$62.50", usage: "85%", status: "active", renewal: "Monthly", lastUsed: "Today" },
      { id: "S-D02", name: "Figma Pro", cost: "$15/user", totalCost: "$45", usage: "40%", status: "underused", renewal: "Monthly", lastUsed: "3 days ago" },
      { id: "S-D03", name: "Notion Team", cost: "$10/user", totalCost: "$50", usage: "92%", status: "active", renewal: "Monthly", lastUsed: "Today" },
      { id: "S-D04", name: "Adobe CC", cost: "$54.99", totalCost: "$54.99", usage: "15%", status: "waste", renewal: "Annual", lastUsed: "32 days ago" },
      { id: "S-D05", name: "Zoom Pro", cost: "$13.33", totalCost: "$13.33", usage: "78%", status: "active", renewal: "Annual", lastUsed: "Yesterday" },
      { id: "S-D06", name: "Grammarly Business", cost: "$15", totalCost: "$15", usage: "8%", status: "waste", renewal: "Monthly", lastUsed: "45 days ago" },
    ],
    cashFlow: {
      available: "$32,680",
      incoming: "$18,800",
      outgoing: "$12,531",
      safeToSpend: "$15,780",
      runway: "3.2 months",
      nextBigExpense: { name: "Quarterly Tax", amount: "$4,200", date: "Apr 15" },
      burnRate: "$8,200/mo",
      reserveHealth: "78%",
    },
    reserves: [
      { id: "R-D01", name: "Emergency Fund", target: "$25,000", current: "$18,400", health: "on-track", monthlyContribution: "$500" },
      { id: "R-D02", name: "Tax Reserve", target: "$16,800", current: "$12,600", health: "on-track", monthlyContribution: "$1,400" },
      { id: "R-D03", name: "Equipment Upgrade", target: "$5,000", current: "$2,100", health: "behind", monthlyContribution: "$300" },
    ],

    // ── Concierge / Household Domain ─────────────────────────
    householdTasks: [
      { id: "HT-D01", title: "Grocery run — weekly staples", assignee: "You", due: "Today", priority: "high", status: "pending", estimatedMinutes: 45 },
      { id: "HT-D02", title: "Schedule HVAC maintenance", assignee: "SITA", due: "This week", priority: "medium", status: "in-progress", estimatedMinutes: 15 },
      { id: "HT-D03", title: "Pick up dry cleaning", assignee: "You", due: "Tomorrow", priority: "low", status: "pending", estimatedMinutes: 20 },
      { id: "HT-D04", title: "Renew car registration", assignee: "You", due: "Apr 12", priority: "high", status: "pending", estimatedMinutes: 30 },
      { id: "HT-D05", title: "Clean garage", assignee: "You", due: "This weekend", priority: "low", status: "pending", estimatedMinutes: 120 },
      { id: "HT-D06", title: "Order birthday cake for Maya", assignee: "SITA", due: "Apr 20", priority: "medium", status: "pending", estimatedMinutes: 10 },
    ],
    familyEvents: [
      { id: "FE-D01", title: "Soccer Practice", who: "Alex", when: "Today 4:00 PM", location: "Wilson Park", recurring: true },
      { id: "FE-D02", title: "Parent-Teacher Meeting", who: "Both", when: "Thu 3:30 PM", location: "Lincoln Elementary", recurring: false },
      { id: "FE-D03", title: "Dance Recital", who: "Maya", when: "Sat 2:00 PM", location: "Community Center", recurring: false },
      { id: "FE-D04", title: "Dentist — Maya", who: "Maya", when: "Next Mon 10:00 AM", location: "Dr. Kim's office", recurring: false },
      { id: "FE-D05", title: "Piano Lesson", who: "Maya", when: "Wed 5:30 PM", location: "Mrs. Chen's Studio", recurring: true },
      { id: "FE-D06", title: "Family Dinner — Grandparents", who: "Everyone", when: "Sun 6:00 PM", location: "Home", recurring: false },
    ],
    groceryList: [
      { id: "G-D01", item: "Organic milk (2)", category: "Dairy", status: "needed", recurring: true, estimatedCost: "$7.98" },
      { id: "G-D02", item: "Bananas", category: "Produce", status: "needed", recurring: true, estimatedCost: "$1.29" },
      { id: "G-D03", item: "Chicken breast (2 lbs)", category: "Meat", status: "needed", recurring: false, estimatedCost: "$9.98" },
      { id: "G-D04", item: "Whole wheat bread", category: "Bakery", status: "needed", recurring: true, estimatedCost: "$4.49" },
      { id: "G-D05", item: "Laundry detergent", category: "Household", status: "running-low", recurring: true, estimatedCost: "$12.99" },
      { id: "G-D06", item: "Greek yogurt (6-pack)", category: "Dairy", status: "needed", recurring: true, estimatedCost: "$5.49" },
      { id: "G-D07", item: "Avocados (4)", category: "Produce", status: "needed", recurring: true, estimatedCost: "$5.96" },
    ],
    travel: [
      { id: "TR-D01", trip: "NYC Business Trip", dates: "Apr 14–16", status: "booked", flight: "AA 1240 — JFK", hotel: "The Standard, High Line", totalCost: "$2,840", gaps: ["No dinner reservation Apr 15"] },
      { id: "TR-D02", trip: "Family Beach Weekend", dates: "Apr 25–27", status: "planning", flight: null, hotel: "Searching...", totalCost: "~$1,200", gaps: ["Need to book hotel", "Car rental", "Pack list"] },
    ],
    serviceProviders: [
      { id: "SP-D01", name: "ServicePro HVAC", category: "Home Maintenance", rating: 4.8, lastService: "Jan 2024", nextService: "Apr 2024", cost: "$150/visit" },
      { id: "SP-D02", name: "CleanTeam", category: "Cleaning", rating: 4.5, lastService: "Last week", nextService: "Next week", cost: "$120/visit" },
      { id: "SP-D03", name: "GreenThumb Landscaping", category: "Yard", rating: 4.2, lastService: "Mar 2024", nextService: "Apr 2024", cost: "$85/visit" },
    ],

    // ── Cross-Domain Insights ────────────────────────────────
    crossDomainInsights: [
      { title: "Cash + Receivables alignment", description: "Overdue invoice from Bloom Studio ($1,200) overlaps with overdue insurance premium ($890). Collecting the invoice covers the bill.", domains: ["money", "business"], impact: "high" },
      { title: "Thursday schedule overload", description: "3 conflicts: Parent-teacher at 3:30 PM, dental at 3:00 PM, and soccer at 4:00 PM. Suggested reschedule: move dental to Friday 10 AM.", domains: ["concierge"], impact: "medium" },
      { title: "Travel expense gap", description: "NYC trip has no dinner reservation for Apr 15 — client Sarah Chen is NYC-based. Opportunity for face-to-face deal close.", domains: ["concierge", "business"], impact: "high" },
      { title: "Subscription waste detected", description: "Adobe CC ($54.99/mo) and Grammarly ($15/mo) both below 15% usage. Combined annual savings: $839.88.", domains: ["money"], impact: "medium" },
    ],

    focus: "Close Emily Park deal, pay overdue insurance, resolve Thursday scheduling conflicts, and prepare for NYC trip",
  },
};
