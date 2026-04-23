// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Engine Adapters
// Transform mock/live data shapes into domain engine input types
// ═══════════════════════════════════════════════════════════════

import type { Customer, PipelineOpportunity, BusinessLead as BizLead } from "@/lib/domain-engines/business-os";
import type { CashflowEntry, Bill as FinBill, Budget, Reserve, FinanceInvoice as FinInvoice } from "@/lib/domain-engines/finance-os";
import type { Task } from "@/lib/domain-engines/concierge-os";

// ── Business Adapters ────────────────────────────────────────

export function adaptMockLeads(leads: any[]): BizLead[] {
  return leads.map((l, i) => ({
    id: l.id,
    name: l.name,
    email: l.email || `${l.name.toLowerCase().replace(/\s/g, ".")}@example.com`,
    source: l.source?.toLowerCase() || "website",
    engagementScore: l.score || 50,
    recencyDays: parseRecency(l.lastTouch),
    fitScore: Math.min(100, (l.score || 50) + 10),
    estimatedValue: parseDollarAmount(l.value) || 5000,
    status: mapLeadStatus(l.status),
    createdAt: Date.now() - (i + 1) * 86400000 * 3,
    lastContactAt: Date.now() - parseRecency(l.lastTouch) * 86400000,
  }));
}

export function adaptMockCustomers(customers: any[]): Customer[] {
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    totalRevenue: parseDollarAmount(c.mrr) * 12 || 24000,
    invoiceCount: 6,
    overdueInvoices: c.health === "at-risk" ? 1 : 0,
    avgPayDays: c.health === "healthy" ? 14 : 35,
    lastInteractionDays: c.lastInteraction === "Today" ? 0 : c.lastInteraction === "Yesterday" ? 1 : 14,
    tier: "mid-market" as const,
    status: c.health === "healthy" ? "active" as const : "at-risk" as const,
    createdAt: Date.now() - 180 * 86400000,
  }));
}

export function adaptMockOpportunities(opps: any[]): PipelineOpportunity[] {
  return opps.map((o) => ({
    id: o.id,
    name: o.name,
    stage: mapOppStage(o.stage),
    valueCents: parseDollarAmount(o.value) * 100 || 1000000,
    probability: (o.probability || 50) / 100,
    expectedCloseDate: Date.now() + 30 * 86400000,
    daysInStage: o.daysOpen || 10,
    lastActivityDays: Math.max(1, Math.floor((o.daysOpen || 10) / 3)),
  }));
}

// ── Finance Adapters ─────────────────────────────────────────

export function adaptMockBills(bills: any[]): FinBill[] {
  return bills.map((b) => ({
    id: b.id,
    vendor: b.name,
    amount: parseDollarAmount(b.amount) || 500,
    dueDate: parseFutureDate(b.dueDate),
    category: b.category || "General",
    recurring: b.recurring || false,
    status: mapBillStatus(b.status),
    autopay: false,
  }));
}

export function buildMockCashflowEntries(): CashflowEntry[] {
  const now = Date.now();
  return [
    { id: "cf-1", type: "inflow", category: "Revenue", amount: 8420, date: now - 86400000 * 2, recurring: true, frequency: "monthly", description: "Client payments" },
    { id: "cf-2", type: "inflow", category: "Revenue", amount: 4200, date: now - 86400000 * 5, recurring: false, description: "Invoice #1038 payment" },
    { id: "cf-3", type: "outflow", category: "Rent", amount: 2500, date: now - 86400000, recurring: true, frequency: "monthly", description: "Office rent" },
    { id: "cf-4", type: "outflow", category: "Infrastructure", amount: 342, date: now - 86400000 * 3, recurring: true, frequency: "monthly", description: "AWS hosting" },
    { id: "cf-5", type: "outflow", category: "Insurance", amount: 890, date: now - 86400000 * 4, recurring: true, frequency: "monthly", description: "Insurance premium" },
    { id: "cf-6", type: "outflow", category: "Software", amount: 212, date: now - 86400000 * 2, recurring: true, frequency: "monthly", description: "SaaS subscriptions" },
    { id: "cf-7", type: "outflow", category: "Payroll", amount: 3500, date: now - 86400000 * 7, recurring: true, frequency: "biweekly", description: "Payroll" },
  ];
}

export function buildMockBudgets(): Budget[] {
  const now = Date.now();
  const monthStart = now - 15 * 86400000;
  const monthEnd = now + 15 * 86400000;
  return [
    { id: "bud-1", name: "Infrastructure", category: "Tech", period: "monthly", allocated: 1500, spent: 342, startDate: monthStart, endDate: monthEnd },
    { id: "bud-2", name: "Marketing", category: "Growth", period: "monthly", allocated: 2000, spent: 850, startDate: monthStart, endDate: monthEnd },
    { id: "bud-3", name: "Office", category: "Operations", period: "monthly", allocated: 3000, spent: 2500, startDate: monthStart, endDate: monthEnd },
    { id: "bud-4", name: "Software", category: "Tech", period: "monthly", allocated: 500, spent: 212, startDate: monthStart, endDate: monthEnd },
  ];
}

export function buildMockReserves(): Reserve[] {
  return [
    { id: "res-1", name: "Emergency Fund", type: "emergency", currentBalance: 15000, targetBalance: 25000, lastContribution: Date.now() - 30 * 86400000 },
    { id: "res-2", name: "Tax Reserve", type: "tax", currentBalance: 8400, targetBalance: 12000, lastContribution: Date.now() - 15 * 86400000 },
    { id: "res-3", name: "Growth Fund", type: "growth", currentBalance: 5000, targetBalance: 10000, lastContribution: Date.now() - 45 * 86400000 },
  ];
}

export function adaptMockInvoicesForAging(invoices: any[]): FinInvoice[] {
  const now = Date.now();
  return invoices.map((inv) => ({
    id: inv.id,
    customerId: inv.client?.replace(/\s/g, "-").toLowerCase() || "unknown",
    customerName: inv.client || "Unknown",
    amount: parseDollarAmount(inv.amount) || 1000,
    issuedDate: now - 30 * 86400000,
    dueDate: parseFutureDate(inv.dueDate),
    status: mapInvoiceStatus(inv.status),
    paidAmount: inv.status === "paid" ? parseDollarAmount(inv.amount) || 1000 : 0,
    daysSinceIssued: 30,
  }));
}

// ── Concierge Adapters ───────────────────────────────────────

export function adaptMockHouseholdTasks(tasks: any[]): Task[] {
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    category: "household" as const,
    priority: mapPriority(t.priority),
    dueDate: parseDueLabel(t.due),
    estimatedMinutes: 30,
    assignedTo: t.assignee === "You" ? "owner" : t.assignee,
    status: mapTaskStatus(t.status),
    dependencies: [],
    recurring: false,
    energyLevel: t.priority === "high" ? "high" as const : "medium" as const,
  }));
}

// ── Helpers ──────────────────────────────────────────────────

function parseRecency(label?: string): number {
  if (!label) return 7;
  if (label.includes("h ago")) return 0;
  const match = label.match(/(\d+)d/);
  return match ? parseInt(match[1]) : 3;
}

function parseDollarAmount(str?: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, "")) || 0;
}

function parseFutureDate(dateStr?: string): number {
  if (!dateStr) return Date.now() + 7 * 86400000;
  // Simple: treat as upcoming
  const now = new Date();
  const match = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/);
  if (match) {
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const d = new Date(now.getFullYear(), months[match[1]], parseInt(match[2]));
    return d.getTime();
  }
  return Date.now() + 7 * 86400000;
}

function parseDueLabel(label?: string): number | undefined {
  if (!label) return undefined;
  const now = Date.now();
  if (label === "Today") return now + 8 * 3600000;
  if (label === "Tomorrow") return now + 24 * 3600000;
  if (label.includes("This week")) return now + 5 * 86400000;
  const match = label.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/);
  if (match) return parseFutureDate(label);
  return now + 7 * 86400000;
}

function mapLeadStatus(s?: string): BizLead["status"] {
  const map: Record<string, BizLead["status"]> = { new: "new", contacted: "contacted", qualified: "qualified", cooling: "nurturing", lost: "lost" };
  return map[s || "new"] || "new";
}

function mapOppStage(s?: string): PipelineOpportunity["stage"] {
  const map: Record<string, PipelineOpportunity["stage"]> = { discovery: "discovery", qualification: "qualification", proposal: "proposal", negotiation: "negotiation", closing: "closing", won: "won", lost: "lost" };
  return map[s || "discovery"] || "discovery";
}

function mapBillStatus(s?: string): FinBill["status"] {
  const map: Record<string, FinBill["status"]> = { upcoming: "upcoming", overdue: "overdue", scheduled: "upcoming", paid: "paid" };
  return map[s || "upcoming"] || "upcoming";
}

function mapInvoiceStatus(s?: string): FinInvoice["status"] {
  const map: Record<string, FinInvoice["status"]> = { paid: "paid", overdue: "overdue", pending: "sent", draft: "draft" };
  return map[s || "sent"] || "sent";
}

function mapPriority(p?: string): Task["priority"] {
  const map: Record<string, Task["priority"]> = { high: "high", medium: "medium", low: "low", urgent: "urgent" };
  return map[p || "medium"] || "medium";
}

function mapTaskStatus(s?: string): Task["status"] {
  const map: Record<string, Task["status"]> = { pending: "pending", "in-progress": "in-progress", done: "done", blocked: "blocked", deferred: "deferred" };
  return map[s || "pending"] || "pending";
}
