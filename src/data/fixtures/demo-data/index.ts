// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Demo Data
// All mock/demo data in one place for easy swap to real data
// ═══════════════════════════════════════════════════════════════

// ── Inbox ──────────────────────────────────────────────────
export const DEMO_INBOX_ITEMS = [
  { id: "1", type: "receipt", content: "Office supplies receipt — $142.50 from Staples", source: "Photo capture", status: "classified", routed_to: "Money", time: "12m ago", confidence: 95 },
  { id: "2", type: "note", content: "Sarah Chen wants to discuss expanded scope — retainer model", source: "Quick note", status: "routed", routed_to: "Business", time: "1h ago", confidence: 88 },
  { id: "3", type: "email", content: "Travel confirmation: LAX → SFO Mar 28, United UA-1142", source: "Email forward", status: "classified", routed_to: "Concierge", time: "2h ago", confidence: 92 },
  { id: "4", type: "bill", content: "Electric bill due Apr 5 — $186.40", source: "Mail scan", status: "routed", routed_to: "Money", time: "3h ago", confidence: 97 },
  { id: "5", type: "idea", content: "Offer monthly retainer packages for small businesses", source: "Voice note", status: "processing", time: "4h ago" },
  { id: "6", type: "reminder", content: "Pick up dry cleaning Thursday before 6 PM", source: "Quick capture", status: "classified", routed_to: "Concierge", time: "5h ago", confidence: 90 },
  { id: "7", type: "screenshot", content: "Competitor pricing comparison — web design packages", source: "Screenshot", status: "new", time: "6h ago" },
  { id: "8", type: "voice", content: "Meeting notes: James Rodriguez wants Q2 project kickoff in April", source: "Voice memo", status: "routed", routed_to: "Business", time: "Yesterday" },
] as const;

// ── Activity Stream ────────────────────────────────────────
export const DEMO_ACTIVITY_TIMELINE = [
  { title: "SITA recommended: Follow up with Sarah Chen", subtitle: "Based on lead aging pattern — 48h no contact", time: "15m ago", type: "recommendation", iconKey: "sparkles", colorKey: "accent", borderKey: "accent" },
  { title: "Invoice #1038 payment received", subtitle: "Marcus Johnson — $4,200 via Stripe", time: "1h ago", type: "execution", iconKey: "check", colorKey: "trust-verified", borderKey: "trust-verified" },
  { title: "Approval granted: Quote #1042", subtitle: "You approved — sent to Sarah Chen", time: "2h ago", type: "approval", iconKey: "shield", colorKey: "primary", borderKey: "primary" },
  { title: "SITA simulated: Bill payment schedule", subtitle: "Result: All bills covered with $1,200 buffer", time: "3h ago", type: "simulation", iconKey: "eye", colorKey: "state-simulated", borderKey: "state-simulated" },
  { title: "Risk detected: Invoice #1035 overdue", subtitle: "7 days past due — $1,800 from David Kim", time: "4h ago", type: "detection", iconKey: "alert", colorKey: "urgency-high", borderKey: "urgency-high" },
  { title: "SITA learned: You prefer Monday money reviews", subtitle: "Pattern detected from 8 consecutive Mondays", time: "5h ago", type: "learning", iconKey: "brain", colorKey: "primary", borderKey: "primary" },
  { title: "Automated: Invoice reminder sent", subtitle: "David Kim — payment overdue reminder #2", time: "6h ago", type: "automation", iconKey: "zap", colorKey: "accent", borderKey: "accent" },
  { title: "New lead captured: Michael Park", subtitle: "Website form — web design inquiry", time: "8h ago", type: "capture", iconKey: "users", colorKey: "primary", borderKey: "primary" },
  { title: "Bill paid: AWS hosting — $340", subtitle: "Auto-approved under $500 threshold", time: "Yesterday", type: "execution", iconKey: "dollar", colorKey: "trust-verified", borderKey: "trust-verified" },
  { title: "Workflow recovered: Email delivery retry", subtitle: "Initial failure — succeeded on retry #2", time: "Yesterday", type: "recovery", iconKey: "rotate", colorKey: "trust-recovered", borderKey: "trust-recovered" },
];

// ── Automation ─────────────────────────────────────────────
export const DEMO_AUTOMATION_RULES = [
  { id: "1", name: "Send invoice reminders", trigger_event: "3 days before due date", steps: [{ action: "Email reminder to customer" }], active: true, domain: "Business" },
  { id: "2", name: "Auto-approve bills under $200", trigger_event: "New bill detected", steps: [{ action: "Pay if under threshold" }], active: true, domain: "Money" },
  { id: "3", name: "Grocery restock alerts", trigger_event: "Consumption pattern detected", steps: [{ action: "Create shopping list" }], active: true, domain: "Household" },
  { id: "4", name: "Lead follow-up drafts", trigger_event: "No contact in 24h", steps: [{ action: "Draft follow-up email" }], active: true, domain: "Business" },
  { id: "5", name: "Travel conflict detection", trigger_event: "New booking", steps: [{ action: "Alert if conflict" }], active: false, domain: "Concierge" },
];

export const DEMO_DELEGATIONS = [
  { action: "Invoice reminders", level: "Fully delegated", approvalNeeded: false, threshold: "All amounts" },
  { action: "Bill payments", level: "Threshold-based", approvalNeeded: true, threshold: "Under $200 auto, over $200 approval" },
  { action: "Lead follow-ups", level: "Draft for review", approvalNeeded: true, threshold: "All outbound comms" },
  { action: "Grocery orders", level: "Fully delegated", approvalNeeded: false, threshold: "Under $100" },
  { action: "Calendar scheduling", level: "Suggest only", approvalNeeded: true, threshold: "All changes" },
  { action: "Subscription cancellations", level: "Approval required", approvalNeeded: true, threshold: "Always" },
];

// ── Files ──────────────────────────────────────────────────
export const DEMO_FILE_ITEMS = [
  { name: "Q1_Financial_Statement.pdf", mime: "application/pdf", text: "Revenue figures, tax obligations, quarterly earnings report" },
  { name: "School_Enrollment_Form.pdf", mime: "application/pdf", text: "Student enrollment form for Spring semester" },
  { name: "Vendor_Contract_Apex.docx", mime: "application/msword", text: "Service agreement NDA with auto-renew clause, Net-30 terms, $24,000/yr" },
  { name: "Invoice_1042_Marcus.pdf", mime: "application/pdf", text: "Invoice for design services, payment due 04/15/2025" },
  { name: "Passport_Scan.jpg", mime: "image/jpeg", text: "Passport identification document scan" },
  { name: "Bank_Statement_Mar.pdf", mime: "application/pdf", text: "Bank statement with account routing and SSN information" },
  { name: "Travel_Itinerary_Hawaii.pdf", mime: "application/pdf", text: "Flight confirmation and hotel reservation for trip" },
  { name: "Medical_Records_2024.pdf", mime: "application/pdf", text: "Annual medical checkup results, prescription details" },
];

export const DEMO_PROCESSING_FILES = [
  { filename: "Receipt_Costco_Mar28.jpg", mimeType: "image/jpeg", sizeBytes: 2400000, textContent: "Costco Wholesale receipt total $342.18 grocery items household supplies", uploadedBy: "owner" },
  { filename: "Vendor_NDA_TechFlow.pdf", mimeType: "application/pdf", sizeBytes: 450000, textContent: "Mutual NDA agreement confidential information 2-year term", uploadedBy: "owner" },
  { filename: "Bank_Statement_Chase_Mar.pdf", mimeType: "application/pdf", sizeBytes: 890000, textContent: "Bank statement account routing number SSN ending 4821 February deposits", uploadedBy: "owner" },
  { filename: "Kid_Activity_Schedule.png", mimeType: "image/png", sizeBytes: 1200000, textContent: "Soccer practice Tuesday Thursday 4pm swimming lessons Wednesday", uploadedBy: "owner" },
  { filename: "Insurance_Renewal_Notice.pdf", mimeType: "application/pdf", sizeBytes: 320000, textContent: "Insurance renewal date 04/30/2025 premium increase $120/mo policy NDA confidential", uploadedBy: "owner" },
  { filename: "Invoice_1039_DavisGroup.pdf", mimeType: "application/pdf", sizeBytes: 280000, textContent: "Invoice for design services $8,500 Net-30 payment due 05/01/2025", uploadedBy: "owner" },
  { filename: "School_Report_Card_Q3.pdf", mimeType: "application/pdf", sizeBytes: 150000, textContent: "Student report card GPA 3.8 teacher notes excellent progress", uploadedBy: "owner" },
  { filename: "Travel_Hotel_Confirmation.pdf", mimeType: "application/pdf", sizeBytes: 200000, textContent: "Hotel confirmation Marriott Wailea Apr 12-18 $289/night confirmation", uploadedBy: "owner" },
];

// ── Search ─────────────────────────────────────────────────
export const DEMO_SEARCH_ITEMS = [
  { id: "d1", type: "customer" as const, domain: "business" as const, title: "Apex Corp", body: "Enterprise client, $48K ARR. Primary contact: Sarah Chen.", tags: ["enterprise", "active"], timestamp: Date.now() - 86400000, metadata: { value: 48000 }, linkedEntities: ["Sarah Chen"], sensitivity: "internal" as const, actionUrl: "/business/customers" },
  { id: "d2", type: "lead" as const, domain: "business" as const, title: "James Morton — Bloom Design", body: "Interested in retainer package. Proposal sent, awaiting response.", tags: ["retainer", "proposal"], timestamp: Date.now() - 172800000, metadata: { value: 14400 }, linkedEntities: ["Bloom Design"], sensitivity: "internal" as const, actionUrl: "/business/leads" },
  { id: "d3", type: "invoice" as const, domain: "business" as const, title: "Invoice #1038 — Design Services", body: "Design services invoice for Marcus, $4,200. Status: sent.", tags: ["invoice", "design"], timestamp: Date.now() - 259200000, metadata: { value: 4200 }, linkedEntities: ["Marcus"], sensitivity: "internal" as const, actionUrl: "/money" },
  { id: "d4", type: "document" as const, domain: "files" as const, title: "Service Agreement — NDA", body: "Master services agreement with non-disclosure clause for Apex Corp.", tags: ["contract", "nda", "legal"], timestamp: Date.now() - 345600000, metadata: {}, linkedEntities: ["Apex Corp"], sensitivity: "confidential" as const, actionUrl: "/files" },
  { id: "d5", type: "task" as const, domain: "concierge" as const, title: "School Enrollment", body: "Complete enrollment form for academy by April 15 deadline.", tags: ["school", "deadline", "family"], timestamp: Date.now() - 432000000, metadata: {}, linkedEntities: ["Family"], sensitivity: "internal" as const, actionUrl: "/concierge" },
  { id: "d6", type: "bill" as const, domain: "finance" as const, title: "Insurance Premium — Auto", body: "Monthly auto insurance premium $890. Due date: April 5.", tags: ["insurance", "recurring"], timestamp: Date.now() - 518400000, metadata: { value: 890 }, linkedEntities: [], sensitivity: "internal" as const, actionUrl: "/money/bills" },
  { id: "d7", type: "workflow" as const, domain: "workflows" as const, title: "Lead Follow-up Automation", body: "Automated follow-up sequence for stale leads. Triggers after 3 days no contact.", tags: ["automation", "leads"], timestamp: Date.now() - 604800000, metadata: {}, linkedEntities: [], sensitivity: "public" as const, actionUrl: "/workflows" },
  { id: "d8", type: "advisor" as const, domain: "advisors" as const, title: "Cost Guardrail Agent", body: "Monitors fleet compute costs and triggers alerts when thresholds exceed budget.", tags: ["agent", "cost", "monitoring"], timestamp: Date.now() - 691200000, metadata: {}, linkedEntities: [], sensitivity: "internal" as const, actionUrl: "/mission-control?tab=control-panel" },
  { id: "d9", type: "receipt" as const, domain: "proof" as const, title: "Receipt: Invoice #1037 Sent", body: "Proof of delivery for invoice #1037 to Apex Corp. Verified by advisor.", tags: ["receipt", "proof"], timestamp: Date.now() - 777600000, metadata: { value: 12000 }, linkedEntities: ["Apex Corp"], sensitivity: "internal" as const, actionUrl: "/proof" },
  { id: "d10", type: "event" as const, domain: "concierge" as const, title: "HVAC Maintenance Appointment", body: "ServicePro scheduled for April 10 at 2:00 PM. Annual maintenance.", tags: ["home", "maintenance"], timestamp: Date.now() - 864000000, metadata: {}, linkedEntities: ["ServicePro"], sensitivity: "public" as const, actionUrl: "/concierge" },
  { id: "d11", type: "opportunity" as const, domain: "business" as const, title: "Upsell: Apex Corp Premium Tier", body: "Opportunity to upsell Apex Corp to premium support tier. Estimated $18K/yr increase.", tags: ["upsell", "enterprise"], timestamp: Date.now() - 950400000, metadata: { value: 18000 }, linkedEntities: ["Apex Corp"], sensitivity: "internal" as const, actionUrl: "/business/opportunities" },
  { id: "d12", type: "document" as const, domain: "files" as const, title: "Q1 Financial Report", body: "Quarterly financial summary including revenue, expenses, and cash flow analysis.", tags: ["report", "financial", "quarterly"], timestamp: Date.now() - 1036800000, metadata: {}, linkedEntities: [], sensitivity: "confidential" as const, actionUrl: "/files" },
];

export const DEMO_FILE_SEARCH_INDEX = [
  { id: "1", type: "document" as const, domain: "business" as const, title: "Service Agreement — Apex Corp", body: "Service agreement with auto-renew clause, Net-30 terms, $24,000/yr annual contract", tags: ["contract", "apex", "auto-renew"], timestamp: Date.now() - 86400000 * 2, metadata: { value: 24000 }, linkedEntities: ["Apex Corp", "Business"], sensitivity: "confidential" as const, actionUrl: "/files" },
  { id: "2", type: "invoice" as const, domain: "business" as const, title: "Invoice #1038 — Marcus Johnson", body: "Invoice for design services $4,200 payment received via Stripe", tags: ["invoice", "marcus", "design"], timestamp: Date.now() - 86400000, metadata: { value: 4200 }, linkedEntities: ["Marcus Johnson"], sensitivity: "internal" as const, actionUrl: "/money" },
  { id: "3", type: "document" as const, domain: "finance" as const, title: "Bank Statement — Chase Feb", body: "Bank statement with account ending 4821 showing deposits and withdrawals for February", tags: ["bank", "statement", "chase"], timestamp: Date.now() - 86400000 * 5, metadata: {}, linkedEntities: ["Chase Bank", "Money Center"], sensitivity: "restricted" as const, actionUrl: "/money" },
  { id: "4", type: "booking" as const, domain: "concierge" as const, title: "Travel Confirmation — Hawaii", body: "Flight confirmation and hotel reservation Marriott Wailea Apr 12-18 $289/night trip", tags: ["travel", "hawaii", "hotel", "trip"], timestamp: Date.now() - 3600000 * 12, metadata: {}, linkedEntities: ["Hawaii Trip", "Travel"], sensitivity: "internal" as const, actionUrl: "/concierge/travel" },
  { id: "5", type: "customer" as const, domain: "business" as const, title: "Apex Corp — Customer Profile", body: "Enterprise client since 2023, annual contract $24,000, renewal March 2025, primary contact Sarah", tags: ["customer", "apex", "enterprise"], timestamp: Date.now() - 86400000 * 10, metadata: { value: 24000 }, linkedEntities: ["Apex Corp"], sensitivity: "internal" as const, actionUrl: "/business/customers" },
  { id: "6", type: "bill" as const, domain: "finance" as const, title: "AWS Hosting — Monthly Bill", body: "Amazon Web Services hosting bill $340 monthly recurring auto-pay enabled", tags: ["aws", "hosting", "recurring", "bill"], timestamp: Date.now() - 86400000 * 3, metadata: { value: 340 }, linkedEntities: ["AWS"], sensitivity: "internal" as const, actionUrl: "/money/bills" },
  { id: "7", type: "task" as const, domain: "concierge" as const, title: "School Enrollment Deadline", body: "Complete school enrollment form by April 15, 2025 for Spring semester", tags: ["school", "deadline", "enrollment"], timestamp: Date.now() - 3600000 * 24, metadata: {}, linkedEntities: ["Family", "School"], sensitivity: "internal" as const, actionUrl: "/concierge/school" },
  { id: "8", type: "receipt" as const, domain: "finance" as const, title: "Costco Groceries Receipt", body: "Costco wholesale receipt total $342.18 groceries household supplies March 28", tags: ["receipt", "costco", "groceries"], timestamp: Date.now() - 86400000, metadata: { value: 342.18 }, linkedEntities: ["Costco"], sensitivity: "public" as const, actionUrl: "/files" },
  { id: "9", type: "opportunity" as const, domain: "business" as const, title: "Expansion Opportunity — TechFlow", body: "TechFlow expressed interest in expanded design services, potential $15,000 quarterly engagement", tags: ["opportunity", "techflow", "expansion"], timestamp: Date.now() - 86400000 * 7, metadata: { value: 60000 }, linkedEntities: ["TechFlow"], sensitivity: "confidential" as const, actionUrl: "/business/opportunities" },
  { id: "10", type: "document" as const, domain: "finance" as const, title: "Insurance Renewal Notice", body: "Insurance policy renewal notice premium increase $120/mo due date April 30, 2025", tags: ["insurance", "renewal", "deadline"], timestamp: Date.now() - 86400000 * 4, metadata: { value: 1440 }, linkedEntities: ["Insurance"], sensitivity: "internal" as const, actionUrl: "/files" },
];

// ── Reserves ───────────────────────────────────────────────
export const DEMO_RESERVES = [
  { id: "1", name: "Emergency Fund", current_amount: 12000, target_amount: 15000, category: "emergency", contribution_amount: 500, notes: "Safety net", auto_contribute: true, priority: 1 },
  { id: "2", name: "Tax Reserve", current_amount: 8400, target_amount: 12000, category: "sinking", contribution_amount: 1200, notes: "Q2 estimated", auto_contribute: true, priority: 2 },
  { id: "3", name: "Equipment Fund", current_amount: 2800, target_amount: 5000, category: "sinking", contribution_amount: 400, notes: "Business capex", auto_contribute: false, priority: 3 },
  { id: "4", name: "Vacation Fund", current_amount: 1600, target_amount: 4000, category: "goal", contribution_amount: 300, notes: "Summer trip", auto_contribute: true, priority: 4 },
  { id: "5", name: "Kids Education", current_amount: 6200, target_amount: 25000, category: "goal", contribution_amount: 500, notes: "529 supplement", auto_contribute: true, priority: 5 },
];

// ── Mobile Alerts ──────────────────────────────────────────
export const DEMO_MOBILE_ALERTS = [
  { id: "alt-001", severity: "critical" as const, title: "Collections escalation required", message: "Invoice #892 is 92 days overdue. $8,400 outstanding — requires immediate action.", domain: "business", createdAt: new Date(Date.now() - 900000).toISOString(), read: false },
  { id: "alt-002", severity: "urgent" as const, title: "Subscription auto-renewing in 3 days", message: "Notion Teams ($200/mo) will auto-renew. Usage score: 12%. Consider cancellation.", domain: "finance", createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "alt-003", severity: "warning" as const, title: "Calendar conflict detected", message: "Client meeting and school pickup overlap on Thursday 3:30 PM. Needs resolution.", domain: "concierge", createdAt: new Date(Date.now() - 5400000).toISOString(), read: false },
  { id: "alt-004", severity: "warning" as const, title: "Reserve funding below target", message: "Emergency reserve at 67% of target. Monthly contribution may need increase.", domain: "finance", createdAt: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: "alt-005", severity: "info" as const, title: "4 leads promoted to qualified", message: "Lead scoring batch completed. 4 leads crossed qualification threshold.", domain: "business", createdAt: new Date(Date.now() - 10800000).toISOString(), read: true },
  { id: "alt-006", severity: "info" as const, title: "Travel prep checklist generated", message: "NYC trip Mar 15-17: 6 prep items created. 0/6 completed.", domain: "concierge", createdAt: new Date(Date.now() - 14400000).toISOString(), read: true },
];

// ── Mobile Approvals ───────────────────────────────────────
export const DEMO_MOBILE_APPROVALS = [
  { id: "apr-001", title: "Payment to vendor — Atlas Corp", domain: "finance", urgency: "high" as const, requestedAt: new Date(Date.now() - 3600000).toISOString(), summary: "Wire transfer $12,500 for Q2 consulting retainer", amountCents: 1250000 },
  { id: "apr-002", title: "Lead reassignment — 8 stale leads", domain: "business", urgency: "medium" as const, requestedAt: new Date(Date.now() - 7200000).toISOString(), summary: "Auto-detected 8 leads with 30+ days no contact. Reassigning to active reps." },
  { id: "apr-003", title: "Cancel subscription — Notion Teams", domain: "finance", urgency: "low" as const, requestedAt: new Date(Date.now() - 14400000).toISOString(), summary: "Detected low usage (12%). Annual renewal in 14 days. Potential savings: $2,400/yr", amountCents: 240000 },
  { id: "apr-004", title: "Travel booking — NYC client visit", domain: "concierge", urgency: "medium" as const, requestedAt: new Date(Date.now() - 21600000).toISOString(), summary: "Flight + hotel for March 15-17 client meeting. Budget: $1,800", amountCents: 180000 },
  { id: "apr-005", title: "Collections escalation — Invoice #892", domain: "business", urgency: "critical" as const, requestedAt: new Date(Date.now() - 1800000).toISOString(), summary: "Invoice 92 days overdue. $8,400 outstanding. Recommend payment plan offer.", amountCents: 840000 },
];

// ── Mobile Proof ───────────────────────────────────────────
export const DEMO_MOBILE_PROOFS = [
  { id: "prf-001", type: "receipt" as const, title: "Invoice #1042 payment processed", status: "verified" as const, timestamp: new Date(Date.now() - 1200000).toISOString(), domain: "Finance", hash: "a3f8c1d9e2b4567890abcdef12345678" },
  { id: "prf-002", type: "execution" as const, title: "Lead scoring batch completed", status: "verified" as const, timestamp: new Date(Date.now() - 3600000).toISOString(), domain: "Business", hash: "b7e2a4f1c3d8901234567890abcdef01" },
  { id: "prf-003", type: "verification" as const, title: "Reserve health assessment", status: "verified" as const, timestamp: new Date(Date.now() - 7200000).toISOString(), domain: "Finance", hash: "c9d1b3e5a7f2345678901234abcdef56" },
  { id: "prf-004", type: "execution" as const, title: "Grocery list auto-generated", status: "pending" as const, timestamp: new Date(Date.now() - 10800000).toISOString(), domain: "Concierge" },
  { id: "prf-005", type: "receipt" as const, title: "Subscription cancellation — Dropbox", status: "verified" as const, timestamp: new Date(Date.now() - 14400000).toISOString(), domain: "Finance", hash: "d2e4f6a8b0c1234567890abcdef78901" },
  { id: "prf-006", type: "verification" as const, title: "Calendar conflict resolution", status: "failed" as const, timestamp: new Date(Date.now() - 18000000).toISOString(), domain: "Concierge" },
  { id: "prf-007", type: "receipt" as const, title: "Collections notice sent — Invoice #892", status: "verified" as const, timestamp: new Date(Date.now() - 21600000).toISOString(), domain: "Business", hash: "e5f7a9b1c3d456789012345678abcdef" },
];

// ── Mobile Workflow Steps ──────────────────────────────────
export const DEMO_WORKFLOW_STEPS = [
  { id: 1, label: "Intent parsed", status: "completed" as const, time: "2m ago", detail: "Domain: business, Type: action" },
  { id: 2, label: "Policy check passed", status: "completed" as const, time: "2m ago", detail: "truth-boundary: within scope" },
  { id: 3, label: "Advisor consulted", status: "completed" as const, time: "1m ago", detail: "business-advisor, confidence: 82%" },
  { id: 4, label: "Approval requested", status: "active" as const, time: "now", detail: "Single approval required from owner" },
  { id: 5, label: "Execution", status: "pending" as const, detail: "Awaiting approval" },
  { id: 6, label: "Receipt generated", status: "pending" as const, detail: "Will generate immutable receipt" },
];
