// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Mock Data Module
// All demo/seed data lives here, imported only in dev mode.
// Pages should import from this module instead of defining inline.
// ═══════════════════════════════════════════════════════════════

import type {
  BusinessLead, Customer, PipelineOpportunity,
  CashflowEntry, Bill, Budget, Reserve, FinanceInvoice,
  Task, CalendarEvent, Routine, Errand, ConciergeHouseholdMember,
} from "@/packages/contracts";

// ── Re-exports from domain sub-modules ──────────────────────────

export * from "./activity";
export * from "./automation";
export * from "./inbox";
export * from "./search";
export * from "./admin";
export * from "./customers";
export * from "./mobile";
export * from "./collections";
export * from "./files";
export * from "./investment";
export * from "./reserves";
export * from "./workspace";
export * from "./owner";
export * from "./owner-center";
export * from "./revenue-autopilot";
export * from "./lease-dashboard";
export * from "./revenue-calling";
export * from "./workflows";
export * from "./calendar";
export * from "./admin-ops";
export * from "./advisor-mission-control";

// Legacy display mocks (simple format for use-sita-data hooks)
// NOT re-exported here to avoid collision with advisor-mission-control.
// Import directly from "@/lib/mock-data/legacy-display-mocks" or via "@/lib/mocks".

// ── Business Mock Data ──────────────────────────────────────────

export const MOCK_LEADS: BusinessLead[] = [
  { id: "lead-1", name: "Sarah Chen", email: "sarah@techcorp.com", source: "referral", engagementScore: 85, recencyDays: 2, fitScore: 90, estimatedValue: 45000, status: "qualified", createdAt: Date.now() - 864e5 * 14 },
  { id: "lead-2", name: "Marcus Johnson", email: "marcus@startup.io", source: "website", engagementScore: 62, recencyDays: 8, fitScore: 75, estimatedValue: 22000, status: "contacted", createdAt: Date.now() - 864e5 * 7 },
  { id: "lead-3", name: "Priya Patel", email: "priya@enterprise.co", source: "conference", engagementScore: 91, recencyDays: 1, fitScore: 95, estimatedValue: 120000, status: "new", createdAt: Date.now() - 864e5 * 2 },
  { id: "lead-4", name: "Tom Williams", source: "cold-outreach", engagementScore: 30, recencyDays: 21, fitScore: 55, estimatedValue: 8000, status: "nurturing", createdAt: Date.now() - 864e5 * 30 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Acme Corp", totalRevenue: 240000, invoiceCount: 12, overdueInvoices: 1, avgPayDays: 28, lastInteractionDays: 3, healthScore: 82, tier: "enterprise", status: "active", createdAt: Date.now() - 864e5 * 365 },
  { id: "cust-2", name: "TechStart LLC", totalRevenue: 45000, invoiceCount: 6, overdueInvoices: 2, avgPayDays: 45, lastInteractionDays: 14, healthScore: 58, churnRisk: 0.35, tier: "smb", status: "at-risk", createdAt: Date.now() - 864e5 * 180 },
  { id: "cust-3", name: "GlobalRetail Inc", totalRevenue: 520000, invoiceCount: 24, overdueInvoices: 0, avgPayDays: 15, lastInteractionDays: 1, healthScore: 95, tier: "enterprise", status: "active", createdAt: Date.now() - 864e5 * 730 },
];

export const MOCK_PIPELINE: PipelineOpportunity[] = [
  { id: "opp-1", name: "Acme Expansion", stage: "negotiation", valueCents: 15000000, probability: 0.7, expectedCloseDate: Date.now() + 864e5 * 14, daysInStage: 8, lastActivityDays: 2 },
  { id: "opp-2", name: "NewClient Onboarding", stage: "proposal", valueCents: 8500000, probability: 0.45, expectedCloseDate: Date.now() + 864e5 * 30, daysInStage: 12, lastActivityDays: 5 },
  { id: "opp-3", name: "Enterprise Renewal", stage: "closing", valueCents: 32000000, probability: 0.9, expectedCloseDate: Date.now() + 864e5 * 5, daysInStage: 3, lastActivityDays: 1 },
];

// ── Finance Mock Data ───────────────────────────────────────────

export const MOCK_CASHFLOW: CashflowEntry[] = [
  { id: "cf-1", type: "inflow", category: "revenue", amount: 45000, date: Date.now(), recurring: true, frequency: "monthly", description: "Subscription revenue" },
  { id: "cf-2", type: "outflow", category: "payroll", amount: 28000, date: Date.now(), recurring: true, frequency: "biweekly", description: "Team payroll" },
  { id: "cf-3", type: "outflow", category: "software", amount: 3200, date: Date.now(), recurring: true, frequency: "monthly", description: "SaaS stack" },
  { id: "cf-4", type: "inflow", category: "consulting", amount: 12000, date: Date.now(), recurring: false, description: "Advisory retainer" },
];

export const MOCK_BILLS: Bill[] = [
  { id: "bill-1", vendor: "AWS", amount: 4200, dueDate: Date.now() + 864e5 * 3, category: "infrastructure", recurring: true, frequency: "monthly", status: "upcoming", autopay: true },
  { id: "bill-2", vendor: "WeWork", amount: 3500, dueDate: Date.now() + 864e5 * 7, category: "rent", recurring: true, frequency: "monthly", status: "upcoming", autopay: false },
  { id: "bill-3", vendor: "Insurance Co", amount: 1800, dueDate: Date.now() - 864e5 * 2, category: "insurance", recurring: true, frequency: "quarterly", status: "overdue", autopay: false },
];

export const MOCK_BUDGETS: Budget[] = [
  { id: "bud-1", name: "Marketing", category: "marketing", period: "monthly", allocated: 15000, spent: 11200, startDate: Date.now() - 864e5 * 15, endDate: Date.now() + 864e5 * 15 },
  { id: "bud-2", name: "Engineering", category: "engineering", period: "monthly", allocated: 35000, spent: 32100, startDate: Date.now() - 864e5 * 15, endDate: Date.now() + 864e5 * 15 },
];

export const MOCK_RESERVES: Reserve[] = [
  { id: "res-1", name: "Emergency Fund", type: "emergency", currentBalance: 85000, targetBalance: 120000 },
  { id: "res-2", name: "Tax Reserve", type: "tax", currentBalance: 42000, targetBalance: 50000 },
  { id: "res-3", name: "Growth Fund", type: "growth", currentBalance: 25000, targetBalance: 100000 },
];

export const MOCK_INVOICES: FinanceInvoice[] = [
  { id: "inv-1", customerId: "cust-1", customerName: "Acme Corp", amount: 25000, issuedDate: Date.now() - 864e5 * 30, dueDate: Date.now() - 864e5 * 5, status: "overdue", paidAmount: 0, daysSinceIssued: 30 },
  { id: "inv-2", customerId: "cust-3", customerName: "GlobalRetail Inc", amount: 48000, issuedDate: Date.now() - 864e5 * 10, dueDate: Date.now() + 864e5 * 20, status: "sent", paidAmount: 0, daysSinceIssued: 10 },
  { id: "inv-3", customerId: "cust-2", customerName: "TechStart LLC", amount: 8500, issuedDate: Date.now() - 864e5 * 45, dueDate: Date.now() - 864e5 * 15, status: "overdue", paidAmount: 0, daysSinceIssued: 45 },
];

// ── Concierge Mock Data ─────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  { id: "task-1", title: "Schedule pediatrician appointment", category: "health", priority: "high", estimatedMinutes: 15, status: "pending", recurring: false, energyLevel: "low", dueDate: Date.now() + 864e5 * 2 },
  { id: "task-2", title: "Review quarterly tax documents", category: "admin", priority: "urgent", estimatedMinutes: 45, status: "pending", recurring: false, energyLevel: "high", dueDate: Date.now() + 864e5 },
  { id: "task-3", title: "Grocery shopping", category: "errands", priority: "medium", estimatedMinutes: 60, status: "pending", recurring: true, frequency: "weekly", energyLevel: "medium" },
  { id: "task-4", title: "Fix garage door sensor", category: "maintenance", priority: "low", estimatedMinutes: 30, status: "deferred", recurring: false, energyLevel: "medium" },
];

export const MOCK_CALENDAR: CalendarEvent[] = [
  { id: "evt-1", title: "Team standup", startTime: Date.now() + 36e5, endTime: Date.now() + 36e5 * 1.5, category: "work", isFixed: true, bufferMinutes: 5 },
  { id: "evt-2", title: "School pickup", startTime: Date.now() + 36e5 * 6, endTime: Date.now() + 36e5 * 6.5, category: "family", isFixed: true, bufferMinutes: 15 },
  { id: "evt-3", title: "Dinner with friends", startTime: Date.now() + 36e5 * 8, endTime: Date.now() + 36e5 * 10, category: "social", isFixed: false, bufferMinutes: 30 },
];

export const MOCK_ROUTINES: Routine[] = [
  { id: "rtn-1", name: "Morning routine", type: "morning", tasks: ["exercise", "meditate", "journal"], completionRate: 0.82, streakDays: 12, averageDurationMinutes: 45 },
  { id: "rtn-2", name: "Evening wind-down", type: "evening", tasks: ["read", "prep-tomorrow", "skincare"], completionRate: 0.65, streakDays: 3, averageDurationMinutes: 30 },
];

export const MOCK_ERRANDS: Errand[] = [
  { id: "err-1", name: "Pick up dry cleaning", location: "Main St Cleaners", estimatedMinutes: 10, priority: "medium", canBeCombined: true, category: "personal" },
  { id: "err-2", name: "Return Amazon package", location: "UPS Store", estimatedMinutes: 15, priority: "low", canBeCombined: true, category: "personal" },
];

export const MOCK_HOUSEHOLD: ConciergeHouseholdMember[] = [
  { id: "mem-1", name: "You", role: "adult", taskCapacity: 15, currentLoad: 8, preferences: ["morning-person"], availability: [{ dayOfWeek: 1, startHour: 6, endHour: 20 }] },
  { id: "mem-2", name: "Partner", role: "adult", taskCapacity: 12, currentLoad: 6, preferences: ["evening-person"], availability: [{ dayOfWeek: 1, startHour: 8, endHour: 22 }] },
];

// ── System / Admin Mock Data ────────────────────────────────────

export const MOCK_REVENUE_HISTORY = [38000, 41000, 39500, 43000, 45000, 47200];

export const MOCK_APPROVAL_ITEMS = [
  { id: "apr-1", title: "Transfer $15,000 to growth fund", domain: "finance", riskTier: "elevated", requestedAt: Date.now() - 36e5 * 2, status: "pending" as const },
  { id: "apr-2", title: "Enable Stripe integration", domain: "platform", riskTier: "standard", requestedAt: Date.now() - 36e5 * 5, status: "pending" as const },
  { id: "apr-3", title: "Send bulk invoice reminders", domain: "business", riskTier: "standard", requestedAt: Date.now() - 36e5 * 1, status: "pending" as const },
];

// ── Dev mode guard ──────────────────────────────────────────────

export const IS_DEV_MODE = import.meta.env.DEV;

/** Returns mock data in dev mode, empty array otherwise */
export function devOnly<T>(data: T[]): T[] {
  return IS_DEV_MODE ? data : [];
}

// ── Demo Source Classification ─────────────────────────────────
// All exports from this module are DEMO SCENARIO DATA.
// In real mode, pages should consume mode-aware data services.
// This classification is used by the Dual Reality system.
export { __DEMO_SOURCE__, __DATA_CLASSIFICATION__, isDemoViolation } from "./_demo-source-marker";
