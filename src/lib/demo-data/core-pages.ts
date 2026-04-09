// SITA OS — Demo Data: Core Pages

export const DEMO_CORE_AGENTS = [
  { id: "1", name: "Revenue Scout", role: "Lead Qualification", status: "active" as const, tasksCompleted: 142, trustScore: 94, costToday: 2.34 },
  { id: "2", name: "Invoice Guardian", role: "Payment Follow-up", status: "active" as const, tasksCompleted: 89, trustScore: 97, costToday: 1.12 },
  { id: "3", name: "Content Architect", role: "Content Generation", status: "paused" as const, tasksCompleted: 56, trustScore: 82, costToday: 0 },
  { id: "4", name: "Data Sentinel", role: "Anomaly Detection", status: "active" as const, tasksCompleted: 234, trustScore: 99, costToday: 0.87 },
  { id: "5", name: "Meeting Maestro", role: "Scheduling & Prep", status: "idle" as const, tasksCompleted: 67, trustScore: 91, costToday: 0.45 },
];

export const DEMO_ALLOCATIONS = [
  { asset: "US Equities", target: 40, current: 42.3, value: 423000, drift: 2.3, color: "bg-blue-500" },
  { asset: "International Equities", target: 20, current: 18.1, value: 181000, drift: -1.9, color: "bg-purple-500" },
  { asset: "Fixed Income", target: 25, current: 24.8, value: 248000, drift: -0.2, color: "bg-emerald-500" },
  { asset: "Real Estate", target: 10, current: 10.5, value: 105000, drift: 0.5, color: "bg-amber-500" },
  { asset: "Cash & Equivalents", target: 5, current: 4.3, value: 43000, drift: -0.7, color: "bg-gray-400" },
];

export const DEMO_CUSTOMERS_DATA: Record<string, {
  name: string; initials: string; email: string; phone: string; company?: string; location: string; website?: string;
  since: string; trust: "verified" | "review" | "degraded"; health: number; healthLabel: string; healthTrend: "up" | "down" | "flat";
  totalRevenue: string; invoicesPaid: number; invoicesTotal: number; outstanding: string; avgPayDays: number;
}> = {
  "marcus-johnson": {
    name: "Marcus Johnson", initials: "MJ", email: "marcus@johnson.co", phone: "(555) 234-5678", company: "Johnson Consulting",
    location: "Austin, TX", website: "johnson.co", since: "Jan 2023", trust: "verified", health: 92, healthLabel: "Excellent", healthTrend: "up",
    totalRevenue: "$12,400", invoicesPaid: 8, invoicesTotal: 9, outstanding: "$1,800", avgPayDays: 4,
  },
  "apex-corp": {
    name: "Apex Corp", initials: "AC", email: "billing@apexcorp.com", phone: "(555) 987-6543", company: "Apex Corporation",
    location: "San Francisco, CA", website: "apexcorp.com", since: "Mar 2023", trust: "verified", health: 88, healthLabel: "Strong", healthTrend: "flat",
    totalRevenue: "$28,600", invoicesPaid: 12, invoicesTotal: 12, outstanding: "$0", avgPayDays: 7,
  },
  "david-kim": {
    name: "David Kim", initials: "DK", email: "david@kimdesign.io", phone: "(555) 111-2233", company: "Kim Design Studio",
    location: "Seattle, WA", website: "kimdesign.io", since: "Aug 2023", trust: "degraded", health: 45, healthLabel: "At Risk", healthTrend: "down",
    totalRevenue: "$4,200", invoicesPaid: 2, invoicesTotal: 4, outstanding: "$3,600", avgPayDays: 22,
  },
  "sarah-chen": {
    name: "Sarah Chen", initials: "SC", email: "sarah@chenventures.com", phone: "(555) 444-7788", location: "Portland, OR",
    since: "Mar 2024", trust: "review", health: 60, healthLabel: "New", healthTrend: "flat",
    totalRevenue: "$0", invoicesPaid: 0, invoicesTotal: 0, outstanding: "$0", avgPayDays: 0,
  },
};

export const DEMO_CORE_TIMELINE = [
  { icon: CheckCircle, color: "text-trust-verified", title: "Invoice #1038 paid — $4,200", subtitle: "Payment received via Stripe", time: "2 hours ago" },
  { icon: FileText, color: "text-primary", title: "Quote #1037 sent — $3,200", subtitle: "Website maintenance package", time: "5 days ago" },
  { icon: Phone, color: "text-accent", title: "Follow-up call completed", subtitle: "Discussed Q2 projects — 18 min", time: "1 week ago" },
  { icon: Mail, color: "text-sita-purple-light", title: "Proposal email opened", subtitle: "Opened 3 times, spent 4 min reading", time: "1 week ago" },
  { icon: Calendar, color: "text-trust-review", title: "Onsite meeting — project kickoff", subtitle: "At client office, 2 attendees", time: "3 weeks ago" },
  { icon: DollarSign, color: "text-trust-verified", title: "Invoice #1032 paid — $2,800", subtitle: "On time — 3 days early", time: "1 month ago" },
  { icon: Briefcase, color: "text-primary", title: "Customer onboarded", subtitle: "Referred by Lisa Thompson", time: "Jan 2023" },
];

export const DEMO_ACTIONS = [
  { title: "Send follow-up on Quote #1037", priority: "high", state: "queued" as const, reason: "Quote viewed 3x but no response in 5 days" },
  { title: "Schedule Q2 planning call", priority: "medium", state: "proposed" as const, reason: "Annual review cycle — relationship maintenance" },
  { title: "Collect on Invoice #1035", priority: "high", state: "escalated" as const, reason: "7 days overdue, 2 reminders sent" },
];

export const DEMO_DOCUMENTS = [
  { name: "Invoice_1038.pdf", type: "Invoice", date: "Mar 28", trust: "verified" as const },
  { name: "Quote_1037_Maintenance.pdf", type: "Quote", date: "Mar 23", trust: "verified" as const },
  { name: "Service_Agreement_v2.pdf", type: "Contract", date: "Jan 15", trust: "verified" as const },
  { name: "Meeting_Notes_Q1.docx", type: "Notes", date: "Mar 15", trust: "review" as const },
  { name: "Invoice_1032.pdf", type: "Invoice", date: "Feb 28", trust: "verified" as const },
];

export const DEMO_CORE_CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "money", label: "Money", icon: BarChart3 },
  { id: "productivity", label: "Productivity", icon: Zap },
  { id: "family", label: "Family", icon: Users },
  { id: "operations", label: "Operations", icon: Package },
] as const;

export const DEMO_CORE_BUNDLES = [
  { id: "founder-productivity", name: "Founder Productivity Bundle", useCases: ["founder-productivity", "lead-recovery"], icon: "🚀", description: "Gmail, Calendar, and lead recovery for founders", savings: "5+ hrs/week" },
  { id: "lead-recovery-bundle", name: "Lead Recovery Bundle", useCases: ["lead-recovery", "crm-recovery", "campaign-to-cash"], icon: "💰", description: "Recover missed leads and track campaign ROI", savings: "$2k-10k/mo" },
  { id: "money-os-bundle", name: "QuickBooks Money OS Bundle", useCases: ["invoice-cash-timing"], icon: "📊", description: "Invoices, cash flow, and expense tracking", savings: "30-day forecast" },
  { id: "family-bundle", name: "Family Calendar Bundle", useCases: ["family-calendar"], icon: "👨‍👩‍👧‍👦", description: "Family schedule coordination and prep reminders", savings: "Zero conflicts" },
  { id: "service-ops-bundle", name: "Service Business Ops", useCases: ["founder-productivity", "invoice-cash-timing", "lead-recovery"], icon: "🏗️", description: "End-to-end ops for service businesses", savings: "Full pipeline" },
];

export const DEMO_DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export const DEMO_FEATURES = [
  { key: "brain", label: "Brain / AI", icon: Brain, color: "text-primary" },
  { key: "business", label: "Business", icon: Briefcase, color: "text-primary" },
  { key: "money", label: "Finance", icon: DollarSign, color: "text-[hsl(var(--trust-safe))]" },
  { key: "concierge", label: "Concierge", icon: Headphones, color: "text-[hsl(var(--sita-gold))]" },
  { key: "boardroom", label: "Boardroom", icon: BarChart3, color: "text-muted-foreground" },
];

export const DEMO_ENGINE_COSTS = [
  { service: "AI Model Calls", cost: "$12.40", percentage: 45, trend: "up" as const },
  { service: "Database", cost: "$3.20", percentage: 12, trend: "flat" as const },
  { service: "Edge Functions", cost: "$2.10", percentage: 8, trend: "down" as const },
  { service: "Storage", cost: "$0.80", percentage: 3, trend: "flat" as const },
  { service: "Connectors", cost: "$8.90", percentage: 32, trend: "up" as const },
];

export const DEMO_CORE_CATEGORIES_POLICY_EDITOR = ["general", "financial", "business", "household", "advisor", "device"];

export const DEMO_RECENT_DOCS = [
  { id: "d1", title: "Q2 Revenue Forecast", type: "doc", updated: "2h ago", icon: FileText },
  { id: "d2", title: "Client Pipeline Tracker", type: "sheet", updated: "4h ago", icon: Table2 },
  { id: "d3", title: "Board Deck — April", type: "slides", updated: "1d ago", icon: Presentation },
  { id: "d4", title: "Hiring Plan 2024", type: "doc", updated: "2d ago", icon: FileText },
  { id: "d5", title: "Monthly Budget", type: "sheet", updated: "3d ago", icon: Table2 },
  { id: "d6", title: "Investor Update", type: "slides", updated: "5d ago", icon: Presentation },
];

export const DEMO_REVENUE_DATA = [
  { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
  { month: "Feb", revenue: 38000, expenses: 26000, profit: 12000 },
  { month: "Mar", revenue: 51000, expenses: 30000, profit: 21000 },
  { month: "Apr", revenue: 47000, expenses: 29000, profit: 18000 },
  { month: "May", revenue: 55000, expenses: 32000, profit: 23000 },
  { month: "Jun", revenue: 62000, expenses: 35000, profit: 27000 },
];

export const DEMO_PIPELINE_DATA = [
  { stage: "Lead", count: 24, value: 180000 },
  { stage: "Qualified", count: 12, value: 120000 },
  { stage: "Proposal", count: 8, value: 95000 },
  { stage: "Negotiation", count: 4, value: 60000 },
  { stage: "Closed", count: 6, value: 85000 },
];

export const DEMO_DOMAIN_BREAKDOWN = [
  { name: "Business", value: 45, color: "hsl(var(--primary))" },
  { name: "Finance", value: 25, color: "#10b981" },
  { name: "Household", value: 15, color: "#f59e0b" },
  { name: "Personal", value: 15, color: "#8b5cf6" },
];

export const DEMO_COMPLETION_TREND = [
  { week: "W1", tasks: 18, workflows: 5 },
  { week: "W2", tasks: 22, workflows: 7 },
  { week: "W3", tasks: 15, workflows: 4 },
  { week: "W4", tasks: 28, workflows: 9 },
  { week: "W5", tasks: 24, workflows: 6 },
  { week: "W6", tasks: 31, workflows: 8 },
];

export const DEMO_EXPORTABLE_TABLES = [
  { name: "Profiles", rows: 1, size: "2 KB" },
  { name: "Connector Configs", rows: 5, size: "8 KB" },
  { name: "Workflows", rows: 34, size: "45 KB" },
  { name: "Receipts & Proofs", rows: 128, size: "156 KB" },
  { name: "Approvals", rows: 23, size: "18 KB" },
  { name: "Memory Store", rows: 67, size: "89 KB" },
  { name: "AI Agent Tasks", rows: 234, size: "312 KB" },
  { name: "Communication Log", rows: 89, size: "67 KB" },
];

export const DEMO_PAST_EXPORTS = [
  { id: "1", date: "2026-03-28", format: "JSON", size: "1.2 MB", status: "completed" as const },
  { id: "2", date: "2026-02-15", format: "CSV", size: "890 KB", status: "completed" as const },
];

export const DEMO_ACTIVE_SPILLOVERS = [
  {
    from: "concierge" as const,
    to: "business" as const,
    impact: "high" as const,
    title: "Thursday overload hurting callbacks",
    description: "3 scheduling conflicts on Thursday are blocking your best callback window. 2 high-value leads have gone 5+ days without follow-up.",
    intervention: "Reschedule dentist to Monday — opens Thursday 10am-12pm for callbacks",
  },
  {
    from: "money" as const,
    to: "business" as const,
    impact: "medium" as const,
    title: "Overdue invoice creating collection anxiety",
    description: "Bloom Studio's overdue INV-002 is occupying mental bandwidth that could go toward pipeline development.",
    intervention: "Send auto-reminder now — 78% collection probability within 48h",
  },
  {
    from: "business" as const,
    to: "household" as const,
    impact: "medium" as const,
    title: "Late-evening work from lead backlog",
    description: "Stale lead queue is causing after-hours catch-up work 3 days this week, reducing family time.",
    intervention: "Delegate morning lead triage to SITA — ready for approve-execute",
  },
  {
    from: "household" as const,
    to: "money" as const,
    impact: "low" as const,
    title: "Grocery spend creeping up",
    description: "No weekly list optimization for 3 weeks. Impulse additions up 22% vs structured weeks.",
    intervention: "Re-enable weekly grocery compilation automation",
  },
  {
    from: "money" as const,
    to: "concierge" as const,
    impact: "low" as const,
    title: "Budget anxiety delaying travel booking",
    description: "Beach weekend hotel search paused because cash flow confidence dropped after overdue invoice.",
    intervention: "Resolve INV-002 collection to unlock travel planning confidence",
  },
];

export const DEMO_TOP_INTERVENTIONS = [
  {
    title: "Unblock Thursday — one reschedule fixes 3 domains",
    description: "Moving Maya's dentist from Thursday 10am to Monday 2pm clears the schedule conflict, opens a callback window for 2 cooling leads, and reduces household stress.",
    impact: "3 domains unblocked, 2h recovered, $24K pipeline re-engaged",
    affectedDomains: ["business", "concierge", "household"],
    urgency: "today" as const,
    effort: "quick" as const,
  },
  {
    title: "Collect overdue invoice — cascading cash confidence fix",
    description: "Resolving INV-002 ($1,200) improves cash flow metrics, unblocks travel planning, and reduces the mental weight on pipeline work.",
    impact: "$1,200 recovered + 2 spillovers resolved",
    affectedDomains: ["money", "business", "concierge"],
    urgency: "now" as const,
    effort: "quick" as const,
  },
];

export const DEMO_CORE_DOMAINS = [
  { id: "business", label: "Business", color: "hsl(var(--primary))", x: 50, y: 15 },
  { id: "money", label: "Money", color: "hsl(var(--sita-gold))", x: 85, y: 55 },
  { id: "concierge", label: "Concierge", color: "hsl(var(--trust-safe))", x: 15, y: 55 },
  { id: "household", label: "Household", color: "hsl(var(--state-proposed))", x: 50, y: 85 },
];

export const DEMO_ENGINE_CONNECTORS = [
  { id: "slack", name: "Slack", status: "connected" as const, lastSync: "2 min ago", category: "communication" },
  { id: "resend", name: "Resend", status: "connected" as const, lastSync: "Just now", category: "email" },
  { id: "twilio", name: "Twilio", status: "connected" as const, lastSync: "5 min ago", category: "sms" },
  { id: "stripe", name: "Stripe", status: "connected" as const, lastSync: "1 min ago", category: "payments" },
  { id: "google-calendar", name: "Google Calendar", status: "connected" as const, lastSync: "3 min ago", category: "calendar" },
  { id: "quickbooks", name: "QuickBooks", status: "degraded" as const, lastSync: "2h ago", category: "accounting" },
];

export const DEMO_FALLBACK_APPROVALS = [
  { action: "Bill payment: AWS — $340", result: "Auto-approved", time: "1h ago", trust: "verified" as const },
  { action: "Quote #1042 to Sarah Chen — $2,500", result: "User approved", time: "3h ago", trust: "verified" as const },
  { action: "Follow-up email to Emily Watson", result: "Pending review", time: "4h ago", trust: "review" as const },
  { action: "Subscription cancellation: Adobe CC", result: "Awaiting approval", time: "Yesterday", trust: "approval" as const },
];

export const DEMO_ADVISOR_SCORECARDS = [
  {
    id: "business-lead", name: "Business Advisor", council: "business",
    icon: "💼", grade: "A" as const, confidence: 87,
    metrics: { totalRecs: 48, accepted: 42, corrected: 2, calibrationError: 8.2, outcomeQuality: 84 },
    trend: "up" as const, promotionEligible: true, demotionRisk: false,
    kpis: [
      { label: "Pipeline Accuracy", value: 91, target: 85 },
      { label: "Revenue Forecast", value: 87, target: 80 },
      { label: "Client Health", value: 83, target: 75 },
    ],
  },
  {
    id: "money-lead", name: "Money Advisor", council: "finance",
    icon: "💰", grade: "A" as const, confidence: 92,
    metrics: { totalRecs: 36, accepted: 33, corrected: 1, calibrationError: 5.4, outcomeQuality: 91 },
    trend: "up" as const, promotionEligible: true, demotionRisk: false,
    kpis: [
      { label: "Cashflow Prediction", value: 94, target: 85 },
      { label: "Waste Detection", value: 88, target: 80 },
      { label: "Reserve Quality", value: 90, target: 82 },
    ],
  },
  {
    id: "concierge-lead", name: "Concierge Advisor", council: "concierge",
    icon: "🎧", grade: "B" as const, confidence: 84,
    metrics: { totalRecs: 29, accepted: 22, corrected: 3, calibrationError: 14.1, outcomeQuality: 76 },
    trend: "stable" as const, promotionEligible: false, demotionRisk: false,
    kpis: [
      { label: "Task Completion", value: 78, target: 80 },
      { label: "Booking Satisfaction", value: 82, target: 75 },
      { label: "Conflict Prevention", value: 71, target: 70 },
    ],
  },
  {
    id: "strategy-advisor", name: "Strategy Advisor", council: "meta",
    icon: "🧠", grade: "B" as const, confidence: 79,
    metrics: { totalRecs: 12, accepted: 9, corrected: 1, calibrationError: 18.3, outcomeQuality: 72 },
    trend: "up" as const, promotionEligible: false, demotionRisk: false,
    kpis: [
      { label: "Cross-Domain Insight", value: 81, target: 75 },
      { label: "Risk Prediction", value: 76, target: 70 },
      { label: "Strategic Acceptance", value: 75, target: 70 },
    ],
  },
];

export const DEMO_ESCALATION_LOG = [
  { id: "esc-1", trigger: "confidence-below-threshold", severity: "standard", source: "Concierge Advisor", target: "Chief of Staff", status: "resolved", council: "concierge", resolution: "Additional calendar data gathered", timestamp: "2h ago" },
  { id: "esc-2", trigger: "consensus-failure", severity: "urgent", source: "Business Council", target: "Strategy Advisor", status: "acknowledged", council: "business", resolution: "Waiting on owner input", timestamp: "4h ago" },
  { id: "esc-3", trigger: "policy-violation", severity: "critical", source: "Money Advisor", target: "Trust Policy Advisor", status: "resolved", council: "finance", resolution: "Payment blocked per daily limit policy", timestamp: "1d ago" },
  { id: "esc-4", trigger: "autonomy-ceiling-reached", severity: "standard", source: "Business Advisor", target: "Owner", status: "resolved", council: "business", resolution: "Owner approved communication send", timestamp: "1d ago" },
  { id: "esc-5", trigger: "blocking-disagreement", severity: "urgent", source: "Finance Council", target: "Owner", status: "pending", council: "finance", resolution: "", timestamp: "30m ago" },
];

export const DEMO_HANDOFF_LOG = [
  { id: "h-1", from: "Business Advisor", to: "Money Advisor", reason: "cross-domain-required", status: "completed", context: "Revenue impact on cashflow", urgency: "standard", timestamp: "3h ago" },
  { id: "h-2", from: "Money Advisor", to: "Strategy Advisor", reason: "specialist-needed", status: "accepted", context: "Investment thesis review", urgency: "low", timestamp: "5h ago" },
  { id: "h-3", from: "Concierge Advisor", to: "Business Advisor", reason: "cross-domain-required", status: "completed", context: "Client meeting prep needs pipeline data", urgency: "high", timestamp: "1d ago" },
  { id: "h-4", from: "Strategy Advisor", to: "Money Advisor", reason: "confidence-below-threshold", status: "rejected", context: "Tax optimization requires specialist review", urgency: "standard", timestamp: "2d ago" },
];

export const DEMO_AUTONOMY_LEVELS = ["L0-observe", "L1-diagnose", "L2-recommend", "L3-draft", "L4-simulate", "L5-approval-ready", "L6-constrained-action"];

export const DEMO_APP_SLOTS = [
  { id: "browser", label: "Default Browser", icon: Globe, currentApp: "chrome", candidates: ["chrome", "firefox"] },
  { id: "email", label: "Default Email", icon: Mail, currentApp: "gmail", candidates: ["gmail"] },
  { id: "calendar", label: "Default Calendar", icon: Calendar, currentApp: null, candidates: [] },
  { id: "pdf", label: "PDF Viewer", icon: FileText, currentApp: null, candidates: [] },
  { id: "images", label: "Image Viewer", icon: Image, currentApp: null, candidates: [] },
  { id: "code", label: "Code Editor", icon: FileCode, currentApp: "vscode", candidates: ["vscode", "obsidian"] },
];

export const DEMO_FILE_TYPES = [
  { ext: ".html", label: "HTML files", apps: ["chrome", "firefox", "vscode"] },
  { ext: ".js", label: "JavaScript", apps: ["vscode"] },
  { ext: ".ts", label: "TypeScript", apps: ["vscode"] },
  { ext: ".md", label: "Markdown", apps: ["vscode", "obsidian"] },
  { ext: ".json", label: "JSON", apps: ["vscode"] },
  { ext: ".py", label: "Python", apps: ["vscode"] },
  { ext: ".fig", label: "Figma files", apps: ["figma"] },
  { ext: ".sh", label: "Shell scripts", apps: ["terminal"] },
  { ext: ".eml", label: "Email files", apps: ["gmail"] },
  { ext: ".svg", label: "SVG files", apps: ["chrome", "figma"] },
];

export const DEMO_COMPARE_PAIRS = [
  { label: "Browsers", ids: ["chrome", "firefox"] },
  { label: "Git Clients", ids: ["github-desktop", "github-web"] },
  { label: "Note Taking", ids: ["notion", "obsidian"] },
  { label: "Design", ids: ["figma", "canva"] },
];

export const DEMO_PERMISSION_DOMAINS = [
  { id: "files", label: "Files & Folders", icon: FolderOpen, description: "Access to read/write files" },
  { id: "camera", label: "Camera", icon: Camera, description: "Access to camera hardware" },
  { id: "microphone", label: "Microphone", icon: Mic, description: "Access to microphone" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Send notifications" },
  { id: "clipboard", label: "Clipboard", icon: Clipboard, description: "Access clipboard contents" },
  { id: "network", label: "Network", icon: Network, description: "Network access behavior" },
  { id: "calendar", label: "Calendar", icon: Calendar, description: "Calendar integration" },
  { id: "contacts", label: "Contacts", icon: Shield, description: "Access contacts" },
];

export const DEMO_DEV_CATEGORIES = [
  { id: "all", label: "All", icon: Code },
  { id: "editors", label: "Editors", icon: Code },
  { id: "git", label: "Git & SCM", icon: GitBranch },
  { id: "api", label: "API Tools", icon: Globe },
  { id: "containers", label: "Containers", icon: Database },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "utilities", label: "Utilities", icon: Wrench },
];

export const DEMO_ENTERPRISE_APPS = [
  { id: "ent-crm", name: "Internal CRM", publisher: "Your Organization", icon: "📊", iconBg: "from-blue-600 to-blue-400", version: "3.2.1", description: "Customer relationship management tool", status: "available", roles: ["Sales", "Support"], managed: true },
  { id: "ent-hr", name: "HR Portal", publisher: "Your Organization", icon: "👥", iconBg: "from-green-600 to-green-400", version: "2.0.0", description: "Employee self-service and HR management", status: "available", roles: ["All employees"], managed: true },
  { id: "ent-wiki", name: "Internal Wiki", publisher: "Your Organization", icon: "📚", iconBg: "from-purple-600 to-purple-400", version: "1.8.0", description: "Company knowledge base and documentation", status: "installed", roles: ["All employees"], managed: true },
  { id: "ent-vpn", name: "Secure VPN", publisher: "IT Department", icon: "🔒", iconBg: "from-gray-700 to-gray-500", version: "5.1.0", description: "Enterprise VPN for secure access", status: "required", roles: ["Remote workers"], managed: true },
  { id: "ent-analytics", name: "Business Analytics", publisher: "Your Organization", icon: "📈", iconBg: "from-indigo-600 to-indigo-400", version: "4.0.0", description: "Data analytics and reporting dashboard", status: "restricted", roles: ["Managers", "Analysts"], managed: true },
  { id: "ent-deploy", name: "Deploy Pipeline", publisher: "DevOps Team", icon: "🚀", iconBg: "from-orange-600 to-orange-400", version: "2.3.0", description: "CI/CD pipeline management", status: "available", roles: ["Engineering"], managed: true },
];

export const DEMO_FILES = [
  { name: "report.html", ext: ".html", candidates: ["chrome", "firefox", "vscode"] },
  { name: "project.md", ext: ".md", candidates: ["vscode", "obsidian"] },
  { name: "design.fig", ext: ".fig", candidates: ["figma"] },
  { name: "deploy.sh", ext: ".sh", candidates: ["terminal", "vscode"] },
  { name: "data.json", ext: ".json", candidates: ["vscode"] },
  { name: "invoice.eml", ext: ".eml", candidates: ["gmail"] },
];

export const DEMO_DETECTED_SITES = [
  { url: "https://mail.google.com", name: "Gmail", icon: "📧", trustLevel: "sita-verified" as const, installable: true },
  { url: "https://github.com", name: "GitHub", icon: "🐙", trustLevel: "sita-verified" as const, installable: true },
  { url: "https://linear.app", name: "Linear", icon: "📐", trustLevel: "sita-verified" as const, installable: true },
  { url: "https://notion.so", name: "Notion", icon: "📝", trustLevel: "sita-verified" as const, installable: true },
  { url: "https://figma.com", name: "Figma", icon: "🎨", trustLevel: "sita-verified" as const, installable: true },
  { url: "https://canva.com", name: "Canva", icon: "🖌️", trustLevel: "sita-verified" as const, installable: true },
];

export const DEMO_SESSIONS = [
  { id: "demo-1", title: "Weekly Executive Review", session_type: "weekly", status: "completed", confidence_score: 87, started_at: new Date(Date.now() - 86400000 * 2).toISOString(), completed_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(), decisions_count: 4 },
  { id: "demo-2", title: "Financial Health Check", session_type: "financial-health", status: "completed", confidence_score: 92, started_at: new Date(Date.now() - 86400000 * 5).toISOString(), completed_at: new Date(Date.now() - 86400000 * 5 + 1200000).toISOString(), decisions_count: 2 },
  { id: "demo-3", title: "Pipeline Review", session_type: "pipeline-review", status: "completed", confidence_score: 79, started_at: new Date(Date.now() - 86400000 * 9).toISOString(), completed_at: new Date(Date.now() - 86400000 * 9 + 2400000).toISOString(), decisions_count: 5 },
  { id: "demo-4", title: "Morning Briefing", session_type: "morning-briefing", status: "active", confidence_score: 81, started_at: new Date().toISOString(), completed_at: null, decisions_count: 0 },
];

export const DEMO_CORE_CONNECTORS = [
  { name: "Chase Business", type: "Banking", status: "connected" as const, lastSync: "2 hours ago" },
  { name: "Wells Fargo", type: "Banking", status: "connected" as const, lastSync: "2 hours ago" },
  { name: "Ally Savings", type: "Banking", status: "connected" as const, lastSync: "3 hours ago" },
  { name: "QuickBooks", type: "Accounting", status: "connected" as const, lastSync: "1 hour ago" },
  { name: "Stripe", type: "Payments", status: "connected" as const, lastSync: "Real-time" },
  { name: "Google Drive", type: "Documents", status: "not-connected" as const, lastSync: "" },
  { name: "Payroll Provider", type: "Payroll", status: "not-connected" as const, lastSync: "" },
];

export const DEMO_EXAMPLE_RULES = [
  "Never bother me after 8pm",
  "My spouse must approve transfers above $500",
  "When I'm overwhelmed, reduce options",
  "Do not negotiate aggressively with family vendors",
  "Limit daily spending to $200 without approval",
  "Always require simulation before paying bills over $1000",
  "Never share financial data with third-party apps",
  "Batch all non-urgent notifications",
];

export const DEMO_CORE_CATEGORIES_NOTIFICATION_PREFERENCES = [
  { key: "incident", label: "Incidents & Alerts", description: "Critical system issues and security alerts" },
  { key: "approval", label: "Approvals", description: "Pending approval requests and decisions" },
  { key: "ai_activity", label: "AI Activity", description: "Agent completions, learning events, and recommendations" },
  { key: "connector", label: "Connectors", description: "Connection status changes and sync updates" },
  { key: "workflow", label: "Workflows", description: "Workflow completions and failures" },
  { key: "system", label: "System", description: "Maintenance, updates, and general system notifications" },
];

export const DEMO_REVENUE_TREND = [
  { month: "Oct", revenue: 18200, installs: 420 },
  { month: "Nov", revenue: 22800, installs: 510 },
  { month: "Dec", revenue: 19500, installs: 380 },
  { month: "Jan", revenue: 28400, installs: 620 },
  { month: "Feb", revenue: 32100, installs: 710 },
  { month: "Mar", revenue: 38500, installs: 840 },
];

export const DEMO_CATEGORY_REVENUE = [
  { name: "Founders", value: 100310, color: "hsl(var(--accent))" },
  { name: "Families", value: 38400, color: "hsl(var(--trust-safe))" },
  { name: "Service Biz", value: 22620, color: "hsl(var(--primary))" },
  { name: "Finance", value: 22120, color: "hsl(212, 70%, 55%)" },
  { name: "Workflows", value: 66900, color: "hsl(var(--trust-review))" },
];

export const DEMO_RETENTION_DATA = [
  { month: "M0", withPack: 100, withoutPack: 100 },
  { month: "M1", withPack: 92, withoutPack: 78 },
  { month: "M2", withPack: 87, withoutPack: 65 },
  { month: "M3", withPack: 84, withoutPack: 55 },
  { month: "M6", withPack: 78, withoutPack: 42 },
  { month: "M12", withPack: 72, withoutPack: 30 },
];
