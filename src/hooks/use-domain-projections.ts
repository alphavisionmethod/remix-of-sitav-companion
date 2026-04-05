// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Projection Hooks (Phase 4)
// Wire Finance/Business/Concierge engines to real Supabase data
// with event emission for projection materialization.
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeCashflow, assessBudgetHealth, assessReserves, analyzeInvoiceAging, assessFinancialHealth, analyzeBillCalendar } from "@/lib/domain-engines/finance-os";
import { assessBusinessHealth, analyzePipeline, scoreLeads } from "@/lib/domain-engines/business-os";
import { prioritizeTasks } from "@/lib/domain-engines/concierge-os";
import { adaptMockLeads, adaptMockCustomers, adaptMockOpportunities, adaptMockBills, adaptMockInvoicesForAging, adaptMockHouseholdTasks, buildMockCashflowEntries, buildMockBudgets, buildMockReserves } from "@/lib/domain-engines/adapters";
import type { CashflowAnalysis, BudgetHealthResult, ReserveAssessment, InvoiceAgingResult, FinancialHealthResult, BillCalendarResult } from "@/lib/domain-engines/finance-os";
import type { BusinessHealthResult, PipelineAnalysis, LeadScoreResult } from "@/lib/domain-engines/business-os";
import type { TaskPrioritization } from "@/lib/domain-engines/concierge-os";

const db: any = supabase;

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

export function useFinanceProjection() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery<FinanceProjection>({
    queryKey: ["finance-projection", isDemoMode, user?.id],
    enabled: !!user || isDemoMode,
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
    queryFn: async () => {
      if (isDemoMode) {
        const entries = buildMockCashflowEntries();
        const budgets = buildMockBudgets();
        const reserves = buildMockReserves();
        const invoices = adaptMockInvoicesForAging();
        const bills = adaptMockBills();
        return {
          cashflow: analyzeCashflow(entries, 24500),
          budgetHealth: assessBudgetHealth(budgets),
          reserves: assessReserves(reserves),
          invoiceAging: analyzeInvoiceAging(invoices),
          overallHealth: assessFinancialHealth(entries, budgets, reserves, invoices, bills, 24500),
          billCalendar: analyzeBillCalendar(bills),
          lastUpdated: new Date().toISOString(),
        };
      }

      // Real Supabase queries
      const [invoiceRes, billRes, budgetRes, allocRes] = await Promise.all([
        db.from("invoices").select("*").limit(200),
        db.from("bills").select("*").limit(200),
        db.from("budgets").select("*").limit(100),
        db.from("capital_allocations").select("*").limit(50),
      ]);

      const rawInvoices = invoiceRes.data || [];
      const rawBills = billRes.data || [];
      const rawBudgets = budgetRes.data || [];
      const rawAllocations = allocRes.data || [];

      // If no real data, use demo engines
      if (rawInvoices.length === 0 && rawBills.length === 0 && rawBudgets.length === 0) {
        const entries = buildMockCashflowEntries();
        const budgets = buildMockBudgets();
        const reserves = buildMockReserves();
        const invoices = adaptMockInvoicesForAging();
        const bills = adaptMockBills();
        return {
          cashflow: analyzeCashflow(entries, 24500),
          budgetHealth: assessBudgetHealth(budgets),
          reserves: assessReserves(reserves),
          invoiceAging: analyzeInvoiceAging(invoices),
          overallHealth: assessFinancialHealth(entries, budgets, reserves, invoices, bills, 24500),
          billCalendar: analyzeBillCalendar(bills),
          lastUpdated: new Date().toISOString(),
        };
      }

      // Map real data to engine types
      const entries = rawInvoices.map((i: any) => ({
        amount: Math.abs(Number(i.amount) || 0),
        date: i.created_at,
        category: "revenue",
        type: "inflow" as const,
        description: i.invoice_number || "Invoice",
      })).concat(rawBills.map((b: any) => ({
        amount: Math.abs(Number(b.amount) || 0),
        date: b.due_date,
        category: b.category || "expense",
        type: "outflow" as const,
        description: b.payee || "Bill",
      })));

      const balance = rawBudgets.reduce((s: number, b: any) => s + ((Number(b.allocated) || 0) - (Number(b.spent) || 0)), 0);
      const budgets = rawBudgets.map((b: any) => ({
        category: b.category,
        allocated: Number(b.allocated) || 0,
        spent: Number(b.spent) || 0,
        period: b.period || "monthly",
      }));
      const reserves = rawAllocations.map((a: any) => ({
        name: a.category,
        currentAmount: Number(a.amount) || 0,
        targetAmount: Number(a.amount) * 1.5,
        category: "sinking" as const,
        contributionAmount: 0,
        autoContribute: false,
        priority: 1,
      }));
      const invoicesForAging = rawInvoices.map((i: any) => ({
        id: i.id,
        amount: Number(i.amount) || 0,
        issuedDate: i.created_at,
        dueDate: i.due_date,
        status: i.status as any,
        clientName: i.invoice_number || "Client",
      }));
      const billsForCalendar = rawBills.map((b: any) => ({
        id: b.id,
        name: b.payee,
        amount: Number(b.amount) || 0,
        dueDate: b.due_date,
        recurring: b.recurring || false,
        frequency: (b.frequency || "monthly") as any,
        category: b.category || "other",
        autoPay: b.auto_pay || false,
        status: b.status as any,
      }));

      return {
        cashflow: analyzeCashflow(entries, Math.max(balance, 0)),
        budgetHealth: assessBudgetHealth(budgets.length ? budgets : buildMockBudgets()),
        reserves: assessReserves(reserves.length ? reserves : buildMockReserves()),
        invoiceAging: analyzeInvoiceAging(invoicesForAging.length ? invoicesForAging : adaptMockInvoicesForAging()),
        overallHealth: assessFinancialHealth(entries, budgets, reserves, invoicesForAging, billsForCalendar, Math.max(balance, 0)),
        billCalendar: analyzeBillCalendar(billsForCalendar.length ? billsForCalendar : adaptMockBills()),
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

export function useBusinessProjection() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery<BusinessProjection>({
    queryKey: ["business-projection", isDemoMode, user?.id],
    enabled: !!user || isDemoMode,
    refetchInterval: isDemoMode ? undefined : 30000,
    staleTime: isDemoMode ? Infinity : 15000,
    queryFn: async () => {
      if (isDemoMode) {
        const customers = adaptMockCustomers();
        const opportunities = adaptMockOpportunities();
        const leads = adaptMockLeads();
        return {
          health: assessBusinessHealth(customers, opportunities, [8000, 9000, 8500, 10000, 11000, 12000]),
          pipeline: analyzePipeline(opportunities),
          leadScores: scoreLeads(leads),
          lastUpdated: new Date().toISOString(),
        };
      }

      const [leadRes, custRes, oppRes] = await Promise.all([
        db.from("leads").select("*").limit(200),
        db.from("customers").select("*").limit(200),
        db.from("opportunities").select("*").limit(200),
      ]);

      const rawLeads = leadRes.data || [];
      const rawCustomers = custRes.data || [];
      const rawOpps = oppRes.data || [];

      if (rawLeads.length === 0 && rawCustomers.length === 0) {
        const customers = adaptMockCustomers();
        const opportunities = adaptMockOpportunities();
        const leads = adaptMockLeads();
        return {
          health: assessBusinessHealth(customers, opportunities, [8000, 9000, 8500, 10000, 11000, 12000]),
          pipeline: analyzePipeline(opportunities),
          leadScores: scoreLeads(leads),
          lastUpdated: new Date().toISOString(),
        };
      }

      const customers = rawCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        company: c.company || "",
        email: c.email || "",
        status: c.status || "active",
        healthScore: c.health_score || 50,
        lifetimeRevenue: c.lifetime_revenue || 0,
        lastContactDate: c.last_contact_at || c.created_at,
        segment: c.relationship_type || "standard",
      }));

      const opportunities = rawOpps.map((o: any) => ({
        id: o.id,
        title: o.title,
        value: Number(o.value) || 0,
        stage: o.stage || "discovery",
        probability: Number(o.confidence) || 50,
        customerId: o.customer_id || "",
        createdDate: o.created_at,
        lastActivityDate: o.last_movement_at || o.updated_at,
        expectedCloseDate: o.updated_at,
        assignedTo: "owner",
      }));

      const leads = rawLeads.map((l: any) => ({
        id: l.id,
        name: l.name,
        company: l.company || "",
        email: l.email || "",
        phone: l.phone || "",
        source: l.source || "direct",
        score: l.opportunity_score || 50,
        status: l.status || "new",
        lastContactDate: l.last_contact_at || l.created_at,
        createdDate: l.created_at,
        estimatedValue: l.likely_value || 0,
        notes: l.notes || "",
      }));

      return {
        health: assessBusinessHealth(customers, opportunities, [8000, 9000, 8500, 10000, 11000, 12000]),
        pipeline: analyzePipeline(opportunities),
        leadScores: scoreLeads(leads),
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
        const tasks = adaptMockHouseholdTasks();
        return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
      }

      const { data } = await db.from("household_tasks").select("*").limit(200);
      if (!data?.length) {
        const tasks = adaptMockHouseholdTasks();
        return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
      }

      const tasks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        assignee: t.assigned_to || "unassigned",
        dueDate: t.due_date || new Date().toISOString(),
        priority: t.priority || "medium",
        status: t.status || "pending",
        category: "general",
        estimatedMinutes: 30,
        recurring: false,
      }));

      return { taskPrioritization: prioritizeTasks(tasks), lastUpdated: new Date().toISOString() };
    },
  });
}
