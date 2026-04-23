// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Projection Hooks (Phase 4)
// Wire Finance/Business/Concierge engines to real Supabase data
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeCashflow, assessBudgetHealth, assessReserves, analyzeInvoiceAging, assessFinancialHealth, analyzeBillCalendar } from "@/lib/domain-engines/finance-os";
import { assessBusinessHealth, analyzePipeline, scoreLead } from "@/lib/domain-engines/business-os";
import { prioritizeTasks } from "@/lib/domain-engines/concierge-os";
import {
  adaptMockLeads, adaptMockCustomers, adaptMockOpportunities, adaptMockBills,
  adaptMockInvoicesForAging, adaptMockHouseholdTasks, buildMockCashflowEntries,
  buildMockBudgets, buildMockReserves
} from "@/lib/domain-engines/adapters";
import type { CashflowAnalysis, BudgetHealthResult, ReserveAssessment, InvoiceAgingResult, FinancialHealthResult, BillCalendarResult } from "@/lib/domain-engines/finance-os";
import type { BusinessHealthResult, PipelineAnalysis, LeadScoreResult } from "@/lib/domain-engines/business-os";
import type { TaskPrioritization } from "@/lib/domain-engines/concierge-os";
// ── Finance Projection ──────────────────────────────────────
export interface FinanceProjection {
  cashflow: CashflowAnalysis;
  budgetHealth: BudgetHealthResult;
  reserves: ReserveAssessment;
  invoiceAging: InvoiceAgingResult;
  overallHealth: FinancialHealthResult;
  billCalendar: BillCalendarResult;
  lastUpdated: string;
}

function buildDemoFinance(): FinanceProjection {
  const entries = buildMockCashflowEntries();
  const budgets = buildMockBudgets();
  const reserves = buildMockReserves();
  const invoices = adaptMockInvoicesForAging(invoices);
  const bills = adaptMockBills(bills);
  const cashflow = analyzeCashflow(entries, 24500);
  const bh = assessBudgetHealth(budgets);
  const ra = assessReserves(reserves, 5000);
  const ia = analyzeInvoiceAging(invoices);
  return {
    cashflow,
    budgetHealth: bh,
    reserves: ra,
    invoiceAging: ia,
    overallHealth: assessFinancialHealth(cashflow, bh, ra, ia),
    billCalendar: analyzeBillCalendar(bills),
    lastUpdated: new Date().toISOString(),
  };
}

export function useFinanceProjection() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery<FinanceProjection>({
    queryKey: ["finance-projection", isDemoMode, user?.id],
    enabled: !!user || isDemoMode,
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
    queryFn: async () => {
      if (isDemoMode) return buildDemoFinance();

      const [invoiceRes, billRes, budgetRes, allocRes] = await Promise.all([
        fromTable("invoices").select("*").limit(200),
        fromTable("bills").select("*").limit(200),
        fromTable("budgets").select("*").limit(100),
        fromTable("capital_allocations").select("*").limit(50),
      ]);

      const rawInvoices = invoiceRes.data || [];
      const rawBills = billRes.data || [];
      const rawBudgets = budgetRes.data || [];
      const rawAllocations = allocRes.data || [];

      if (rawInvoices.length === 0 && rawBills.length === 0 && rawBudgets.length === 0) {
        return buildDemoFinance();
      }

      interface CashflowEntry {
        id: string;
        type: "inflow" | "outflow";
        category: string;
        amount: number;
        date: number;
        recurring: boolean;
        description: string;
      }

      const entries: CashflowEntry[] = [
        ...rawInvoices.map((i: Record<string, unknown>) => ({
          id: i.id as string, type: "inflow" as const, category: "revenue",
          amount: Math.abs(Number(i.amount) || 0), date: new Date(i.created_at as string).getTime(),
          recurring: false, description: (i.invoice_number as string) || "Invoice",
        })),
        ...rawBills.map((b: Record<string, unknown>) => ({
          id: b.id as string, type: "outflow" as const, category: (b.category as string) || "expense",
          amount: Math.abs(Number(b.amount) || 0), date: new Date(b.due_date as string).getTime(),
          recurring: !!(b.recurring), description: (b.payee as string) || "Bill",
        })),
      ];

      const balance = rawBudgets.reduce((s: number, b: any) => s + ((Number(b.allocated) || 0) - (Number(b.spent) || 0)), 0);
      const now = Date.now();
      const monthStart = now - 15 * 86400000;
      const monthEnd = now + 15 * 86400000;

      const budgets = rawBudgets.map((b: any) => ({
        id: b.id, name: b.category, category: b.category,
        period: b.period || "monthly", allocated: Number(b.allocated) || 0,
        spent: Number(b.spent) || 0, startDate: monthStart, endDate: monthEnd,
      }));

      const reserves = rawAllocations.length > 0
        ? rawAllocations.map((a: any) => ({
            id: a.id, name: a.category, type: "growth" as const,
            currentBalance: Number(a.amount) || 0, targetBalance: Number(a.amount) * 1.5,
            lastContribution: new Date(a.updated_at || a.created_at).getTime(),
          }))
        : buildMockReserves();

      const invoicesForAging = rawInvoices.map((i: any) => ({
        id: i.id, customerId: i.customer_id || "unknown", customerName: i.invoice_number || "Client",
        amount: Number(i.amount) || 0, issuedDate: new Date(i.created_at).getTime(),
        dueDate: new Date(i.due_date).getTime(), status: i.status as never,
        paidAmount: i.status === "paid" ? Number(i.amount) || 0 : 0, daysSinceIssued: 30,
      }));

      const billsForCalendar = rawBills.map((b: any) => ({
        id: b.id, vendor: b.payee, amount: Number(b.amount) || 0,
        dueDate: new Date(b.due_date).getTime(), category: b.category || "other",
        recurring: b.recurring || false, status: b.status as never, autopay: b.auto_pay || false,
      }));

      const cashflow = analyzeCashflow(entries, Math.max(balance, 0));
      const bh = assessBudgetHealth(budgets.length ? budgets : buildMockBudgets());
      const ra = assessReserves(reserves, Math.max(balance * 0.3, 3000));
      const ia = analyzeInvoiceAging(invoicesForAging.length ? invoicesForAging : adaptMockInvoicesForAging(invoices));

      return {
        cashflow, budgetHealth: bh, reserves: ra, invoiceAging: ia,
        overallHealth: assessFinancialHealth(cashflow, bh, ra, ia),
        billCalendar: analyzeBillCalendar(billsForCalendar.length ? billsForCalendar : adaptMockBills(bills)),
        lastUpdated: new Date().toISOString(),
      };
    },
  });
}

// ── Business Projection ─────────────────────────────────────
export interface BusinessProjection {
  health: BusinessHealthResult;
  pipeline: PipelineAnalysis;
  leadScores: LeadScoreResult[];
  lastUpdated: string;
}

function buildDemoBusiness(): BusinessProjection {
  const customers = adaptMockCustomers(customers);
  const opportunities = adaptMockOpportunities(opportunities);
  const leads = adaptMockLeads(leads);
  return {
    health: assessBusinessHealth(customers, opportunities, [8000, 9000, 8500, 10000, 11000, 12000]),
    pipeline: analyzePipeline(opportunities),
    leadScores: leads.map(l => scoreLead(l)),
    lastUpdated: new Date().toISOString(),
  };
}

export function useBusinessProjection() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery<BusinessProjection>({
    queryKey: ["business-projection", isDemoMode, user?.id],
    enabled: !!user || isDemoMode,
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
    queryFn: async () => {
      if (isDemoMode) return buildDemoBusiness();

      const [leadRes, custRes, oppRes] = await Promise.all([
        fromTable("leads").select("*").limit(200),
        fromTable("customers").select("*").limit(200),
        fromTable("opportunities").select("*").limit(200),
      ]);

      const rawLeads = leadRes.data || [];
      const rawCustomers = custRes.data || [];
      const rawOpps = oppRes.data || [];

      if (rawLeads.length === 0 && rawCustomers.length === 0) return buildDemoBusiness();

      const customers = rawCustomers.map((c: any) => ({
        id: c.id, name: c.name, totalRevenue: Number(c.lifetime_revenue) || 0,
        invoiceCount: 6, overdueInvoices: 0, avgPayDays: 14,
        lastInteractionDays: c.last_contact_at ? Math.round((Date.now() - new Date(c.last_contact_at).getTime()) / 86400000) : 30,
        tier: "mid-market" as const, status: (c.status === "active" ? "active" : "at-risk") as never,
        createdAt: new Date(c.created_at).getTime(),
      }));

      const opportunities = rawOpps.map((o: any) => ({
        id: o.id, name: o.title, stage: (o.stage || "discovery") as never,
        valueCents: (Number(o.value) || 0) * 100, probability: (Number(o.confidence) || 50) / 100,
        expectedCloseDate: Date.now() + 30 * 86400000,
        daysInStage: o.last_movement_at ? Math.round((Date.now() - new Date(o.last_movement_at).getTime()) / 86400000) : 10,
        lastActivityDays: 5,
      }));

      const leads = rawLeads.map((l: any) => ({
        id: l.id, name: l.name, email: l.email || "",
        source: (l.source || "direct") as never, engagementScore: l.opportunity_score || 50,
        recencyDays: l.last_contact_at ? Math.round((Date.now() - new Date(l.last_contact_at).getTime()) / 86400000) : 7,
        fitScore: Math.min(100, (l.opportunity_score || 50) + 10),
        estimatedValue: Number(l.likely_value) || 5000,
        status: (l.status || "new") as never,
        createdAt: new Date(l.created_at).getTime(),
        lastContactAt: l.last_contact_at ? new Date(l.last_contact_at).getTime() : Date.now() - 7 * 86400000,
      }));

      return {
        health: assessBusinessHealth(customers, opportunities, [8000, 9000, 8500, 10000, 11000, 12000]),
        pipeline: analyzePipeline(opportunities),
        leadScores: leads.map(l => scoreLead(l)),
        lastUpdated: new Date().toISOString(),
      };
    },
  });
}

// ── Concierge Projection ────────────────────────────────────
export interface ConciergeProjection {
  taskPrioritization: TaskPrioritization;
  lastUpdated: string;
}

export function useConciergeProjection() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery<ConciergeProjection>({
    queryKey: ["concierge-projection", isDemoMode, user?.id],
    enabled: !!user || isDemoMode,
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
    queryFn: async () => {
      if (isDemoMode) {
        const tasks = adaptMockHouseholdTasks(householdTasks);
        return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
      }

      const { data } = await fromTable("household_tasks").select("*").limit(200);
      if (!data?.length) {
        const tasks = adaptMockHouseholdTasks(householdTasks);
        return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
      }

      const tasks = data.map((t: any) => ({
        id: t.id, title: t.title, category: "household" as const,
        priority: (t.priority || "medium") as never, dueDate: new Date(t.due_date || Date.now()).getTime(),
        estimatedMinutes: 30, assignedTo: t.assigned_to || "owner",
        status: (t.status || "pending") as never, dependencies: [], recurring: false,
        energyLevel: t.priority === "high" ? "high" as const : "medium" as const,
      }));

      return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
    },
  });
}
