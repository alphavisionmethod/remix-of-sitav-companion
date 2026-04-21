import businessAvatar from "@/assets/advisors/business-advisor.png";
import moneyAvatar from "@/assets/advisors/money-advisor.png";
import conciergeAvatar from "@/assets/advisors/concierge-advisor.png";
import boardroomAvatar from "@/assets/advisors/boardroom-advisor.png";
import growthAvatar from "@/assets/advisors/growth-advisor.png";
import trustAvatar from "@/assets/advisors/trust-advisor.png";

export const DEMO_APPS = [
  { id: "business", label: "Business", gradient: "from-blue-500 to-cyan-400", icon: "Briefcase" as const },
  { id: "finance", label: "Finance", gradient: "from-emerald-500 to-teal-400", icon: "DollarSign" as const },
  { id: "concierge", label: "Concierge", gradient: "from-violet-500 to-purple-400", icon: "Sparkles" as const },
  { id: "boardroom", label: "Boardroom", gradient: "from-amber-500 to-orange-400", icon: "Users" as const },
  { id: "investment", label: "Investment", gradient: "from-rose-500 to-pink-400", icon: "TrendingUp" as const },
  { id: "files", label: "Files", gradient: "from-sky-500 to-blue-400", icon: "FolderOpen" as const },
  { id: "notes", label: "Notes", gradient: "from-yellow-500 to-amber-400", icon: "FileText" as const },
  { id: "settings", label: "Settings", gradient: "from-slate-500 to-gray-400", icon: "Settings" as const },
] as const;

export type DemoAppId = (typeof DEMO_APPS)[number]["id"];

export const BUSINESS_DATA = {
  kpis: [
    { label: "Revenue", value: "$284k", trend: "+12%", up: true },
    { label: "Active Leads", value: "47", trend: "+5", up: true },
    { label: "Pipeline", value: "$1.2M", trend: "+18%", up: true },
    { label: "Win Rate", value: "34%", trend: "-2%", up: false },
  ],
  pipeline: [
    { name: "Acme Corp", stage: "Negotiation", value: "$180k", probability: 75 },
    { name: "TechStart Inc", stage: "Proposal", value: "$95k", probability: 50 },
    { name: "Global Media", stage: "Discovery", value: "$220k", probability: 25 },
    { name: "FinServ LLC", stage: "Closing", value: "$340k", probability: 90 },
  ],
  activity: [
    { time: "2h ago", text: "New lead: Sarah Chen from Quantum Labs" },
    { time: "4h ago", text: "Deal moved to Negotiation: Acme Corp" },
    { time: "6h ago", text: "Invoice #1847 paid — $24,500" },
    { time: "1d ago", text: "Proposal sent to TechStart Inc" },
  ],
  chartData: [35, 42, 28, 55, 48, 62, 58, 71, 65, 78, 72, 84],
};

export const FINANCE_DATA = {
  peaceScore: 78,
  accounts: [
    { name: "Operating Account", balance: "$142,380", type: "checking" },
    { name: "Savings Reserve", balance: "$85,200", type: "savings" },
    { name: "Tax Escrow", balance: "$34,100", type: "escrow" },
  ],
  spending: [
    { category: "Payroll", amount: 12400, pct: 42 },
    { category: "Software", amount: 3200, pct: 11 },
    { category: "Marketing", amount: 5800, pct: 20 },
    { category: "Office", amount: 2100, pct: 7 },
    { category: "Other", amount: 5900, pct: 20 },
  ],
  bills: [
    { name: "AWS Hosting", due: "Apr 28", amount: "$2,340", status: "upcoming" },
    { name: "Payroll Run", due: "May 1", amount: "$12,400", status: "scheduled" },
    { name: "Insurance", due: "May 5", amount: "$890", status: "upcoming" },
  ],
};

export const CONCIERGE_DATA = {
  schedule: [
    { time: "9:00 AM", title: "Team Standup", type: "meeting" },
    { time: "10:30 AM", title: "Client Call — Acme Corp", type: "call" },
    { time: "12:00 PM", title: "Lunch with Investor", type: "personal" },
    { time: "2:00 PM", title: "Product Review", type: "meeting" },
    { time: "4:30 PM", title: "School Pickup", type: "family" },
  ],
  tasks: [
    { title: "Review Q2 budget proposal", priority: "high", done: false },
    { title: "Sign vendor contract", priority: "high", done: false },
    { title: "Book flights for conference", priority: "medium", done: true },
    { title: "Update family calendar", priority: "low", done: false },
  ],
};

export const BOARDROOM_DATA = {
  advisors: [
    { id: "biz", name: "Business Advisor", domain: "Business Strategy", avatar: businessAvatar, confidence: 92 },
    { id: "fin", name: "Finance Advisor", domain: "Financial Planning", avatar: moneyAvatar, confidence: 87 },
    { id: "con", name: "Concierge Advisor", domain: "Life Management", avatar: conciergeAvatar, confidence: 95 },
    { id: "board", name: "Board Chair", domain: "Strategic Oversight", avatar: boardroomAvatar, confidence: 89 },
    { id: "growth", name: "Growth Advisor", domain: "Growth & Scale", avatar: growthAvatar, confidence: 84 },
    { id: "trust", name: "Trust Advisor", domain: "Risk & Compliance", avatar: trustAvatar, confidence: 91 },
  ],
  consensus: 87,
  activeDebate: {
    topic: "Should we pursue the Quantum Labs partnership?",
    for: 4,
    against: 1,
    abstain: 1,
  },
};

export const INVESTMENT_DATA = {
  totalValue: "$847,200",
  dayChange: "+$3,420 (+0.41%)",
  positions: [
    { symbol: "VOO", name: "Vanguard S&P 500", value: "$312,400", change: "+1.2%", up: true },
    { symbol: "QQQ", name: "Invesco NASDAQ", value: "$198,600", change: "+0.8%", up: true },
    { symbol: "BND", name: "Vanguard Bonds", value: "$124,800", change: "-0.1%", up: false },
    { symbol: "VNQ", name: "Vanguard REIT", value: "$89,200", change: "+0.3%", up: true },
    { symbol: "GLD", name: "SPDR Gold", value: "$122,200", change: "+1.5%", up: true },
  ],
  allocation: [
    { label: "US Equities", pct: 45, color: "hsl(210,80%,60%)" },
    { label: "Int'l Equities", pct: 20, color: "hsl(160,60%,50%)" },
    { label: "Bonds", pct: 20, color: "hsl(45,80%,55%)" },
    { label: "Real Estate", pct: 10, color: "hsl(280,60%,60%)" },
    { label: "Commodities", pct: 5, color: "hsl(0,70%,60%)" },
  ],
  sparkline: [42, 44, 41, 46, 48, 45, 50, 49, 52, 54, 51, 55],
};

export const FILES_DATA = {
  folders: [
    { name: "Documents", items: 24 },
    { name: "Business", items: 18 },
    { name: "Finance", items: 12 },
    { name: "Legal", items: 8 },
    { name: "Personal", items: 15 },
  ],
  files: [
    { name: "Q2 Budget.xlsx", size: "245 KB", modified: "Apr 18", type: "spreadsheet" },
    { name: "Contract — Acme.pdf", size: "1.2 MB", modified: "Apr 15", type: "pdf" },
    { name: "Team Photo.jpg", size: "3.8 MB", modified: "Apr 12", type: "image" },
    { name: "Meeting Notes.md", size: "12 KB", modified: "Apr 20", type: "document" },
    { name: "Invoice #1847.pdf", size: "89 KB", modified: "Apr 19", type: "pdf" },
    { name: "Presentation.pptx", size: "5.4 MB", modified: "Apr 10", type: "presentation" },
  ],
};

export const NOTES_DATA = [
  { id: "1", title: "Q2 Strategy Notes", preview: "Focus areas: expand APAC market, hire 3 senior engineers...", date: "Apr 20", folder: "Business" },
  { id: "2", title: "Meeting with Acme Corp", preview: "Key takeaways: they want 30-day pilot, budget approved...", date: "Apr 18", folder: "Business" },
  { id: "3", title: "Personal Goals 2026", preview: "1. Marathon training 2. Learn piano 3. Family vacation...", date: "Apr 15", folder: "Personal" },
  { id: "4", title: "Investment Thesis", preview: "Core allocation: 60/20/20 split with rebalancing every...", date: "Apr 12", folder: "Finance" },
  { id: "5", title: "Recipe — Pasta Carbonara", preview: "Ingredients: guanciale, eggs, pecorino, black pepper...", date: "Apr 8", folder: "Personal" },
];

export const SETTINGS_DATA = [
  { category: "General", items: [
    { label: "Dark Mode", type: "toggle" as const, value: true },
    { label: "Language", type: "select" as const, value: "English" },
    { label: "Time Zone", type: "select" as const, value: "UTC-5 (EST)" },
  ]},
  { category: "Notifications", items: [
    { label: "Email Alerts", type: "toggle" as const, value: true },
    { label: "Push Notifications", type: "toggle" as const, value: false },
    { label: "Sound Effects", type: "toggle" as const, value: true },
  ]},
  { category: "Privacy", items: [
    { label: "Analytics", type: "toggle" as const, value: true },
    { label: "Data Sharing", type: "toggle" as const, value: false },
  ]},
];