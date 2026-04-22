import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  mockLeads, mockCustomers, mockOpportunities, mockQuotes, mockInvoices,
  mockCommunications, mockBills, mockSubscriptions, mockCashFlow,
  mockHouseholdTasks, mockFamilyEvents, mockGroceryList, mockTravel,
  mockActivity, mockOpportunityInsights, mockMemoryItems,
  mockAutomationRules, mockConnectors, mockAITeam, mockIncidents, mockCosts,
} from "@/data/fixtures/mock-data/legacy-display-mocks";

// ── Generic hook factory ─────────────────────────────────────
// Returns mock data ONLY in demo mode; queries Supabase in live mode.
// On Supabase error in live mode → returns empty array, NOT mock data.
function useSitaQuery<T>(
  key: string,
  mockData: T[],
  table: string,
  options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, unknown>;
    refetchInterval?: number;
  }
) {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  return useQuery({
    queryKey: [key, isDemoMode, user?.id],
    queryFn: async (): Promise<T[]> => {
      if (isDemoMode) return mockData;
      if (!user) return [];

      try {
        const { data, error } = await fromDynamicTable(table)
          .select(options?.select || "*")
          .order(options?.orderBy || "created_at", { ascending: options?.ascending ?? false })
          .limit(100);

        if (error) {
          console.error(`[use-sita-data] Error fetching ${table}:`, error);
          return [];
        }
        return (data as T[]) || [];
      } catch {
        return [];
      }
    },
    refetchInterval: isDemoMode ? undefined : (options?.refetchInterval ?? 30000),
    staleTime: isDemoMode ? Infinity : 10000,
  });
}

// ── Business Hooks ──
export function useLeads() {
  return useSitaQuery("leads", mockLeads, "leads", { orderBy: "created_at" });
}

export function useCustomers() {
  return useSitaQuery("customers", mockCustomers, "customers", { orderBy: "created_at" });
}

export function useOpportunities() {
  return useSitaQuery("opportunities", mockOpportunities, "opportunities", { orderBy: "created_at" });
}

export function useQuotes() {
  return useSitaQuery("quotes", mockQuotes, "quotes", { orderBy: "created_at" });
}

export function useInvoices() {
  return useSitaQuery("invoices", mockInvoices, "invoices", { orderBy: "created_at" });
}

export function useCommunications() {
  return useSitaQuery("communications", mockCommunications, "communications", { orderBy: "created_at" });
}

// ── Money Hooks ──
export function useBills() {
  return useSitaQuery("bills", mockBills, "bills", { orderBy: "due_date", ascending: true });
}

export function useSubscriptions() {
  return useSitaQuery("subscriptions", mockSubscriptions, "subscriptions");
}

export function useReserves() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const mockReserves = [
    { id: "R-001", name: "Emergency Fund", current_amount: 12000, target_amount: 15000, category: "emergency", contribution_amount: 500, auto_contribute: true, priority: 1 },
    { id: "R-002", name: "Tax Reserve", current_amount: 8400, target_amount: 12000, category: "sinking", contribution_amount: 1200, auto_contribute: true, priority: 2 },
    { id: "R-003", name: "Equipment Fund", current_amount: 2800, target_amount: 5000, category: "sinking", contribution_amount: 400, auto_contribute: false, priority: 3 },
  ];
  return useQuery({
    queryKey: ["reserves", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockReserves;
      if (!user) return [];
      const { data, error } = await fromTable("capital_allocations").select("*").order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
    staleTime: isDemoMode ? Infinity : 10000,
  });
}

export function useDeals() {
  const mockDeals = [
    { id: "D-001", name: "Acme Expansion", value: 48000, stage: "negotiation", probability: 75, customer_id: null },
    { id: "D-002", name: "Bloom Retainer", value: 14400, stage: "proposal", probability: 60, customer_id: null },
    { id: "D-003", name: "NovaTech Upgrade", value: 24000, stage: "discovery", probability: 40, customer_id: null },
  ];
  return useSitaQuery("deals", mockDeals, "deals", { orderBy: "created_at" });
}

export function useFinancialDocuments() {
  const mockDocs = [
    { id: "FD-001", filename: "Q1-2026-PnL.pdf", category: "financial_statement", sensitivity: "confidential", status: "processed" },
    { id: "FD-002", filename: "W2-2025.pdf", category: "tax", sensitivity: "restricted", status: "processed" },
    { id: "FD-003", filename: "Insurance-Policy-2026.pdf", category: "insurance", sensitivity: "internal", status: "uploaded" },
  ];
  return useSitaQuery("financial-documents", mockDocs, "financial_documents", { orderBy: "created_at" });
}

export function useCashFlow() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cash-flow", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockCashFlow;
      if (!user) return mockCashFlow;

      // Try backend edge function first for server-computed analysis
      try {
        const { data, error } = await supabase.functions.invoke("cashflow-calculate", {
          body: { action: "analyze" },
        });
        if (!error && data && data.accounts_count > 0) {
          const liquid = data.total_liquid_cents || 0;
          const receivable = data.total_receivable_cents || 0;
          const overdue = data.overdue_cents || 0;
          const inflows = data.inflows_30d_cents || 0;
          const net = data.net_position_cents || 0;
          const safeToSpend = Math.max(0, liquid - overdue);

          return {
            available: `$${(liquid / 100).toLocaleString()}`,
            incoming: `$${(receivable / 100).toLocaleString()}`,
            outgoing: `$${(overdue / 100).toLocaleString()}`,
            safeToSpend: `$${(safeToSpend / 100).toLocaleString()}`,
            runway: liquid > 0 && overdue > 0 ? `${Math.round(liquid / overdue)} months` : "∞",
            nextBigExpense: { name: "Overdue receivables", amount: `$${(overdue / 100).toLocaleString()}`, date: "Now" },
          };
        }
      } catch {
        // Edge function unavailable — fall back to local computation
      }

      // Fallback: compute from real invoices + bills
      const [invoiceRes, billRes, budgetRes] = await Promise.all([
        fromTable("invoices").select("amount, status").limit(200),
        fromTable("bills").select("amount, status, due_date").limit(200),
        fromTable("budgets").select("allocated, spent, category").limit(50),
      ]);
      const invoices = invoiceRes.data || [];
      const bills = billRes.data || [];
      const budgets = budgetRes.data || [];

      const totalReceivable = invoices
        .filter((i: any) => i.status === "pending" || i.status === "sent")
        .reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
      const totalPayable = bills
        .filter((b: any) => b.status === "pending" || b.status === "upcoming")
        .reduce((s: number, b: any) => s + (Number(b.amount) || 0), 0);
      const totalBudget = budgets.reduce((s: number, b: any) => s + (Number(b.allocated) || 0), 0);
      const totalSpent = budgets.reduce((s: number, b: any) => s + (Number(b.spent) || 0), 0);
      const available = totalBudget - totalSpent;
      const safeToSpend = Math.max(0, available - totalPayable);

      if (invoices.length === 0 && bills.length === 0 && budgets.length === 0) {
        return mockCashFlow;
      }

      return {
        available: `$${available.toLocaleString()}`,
        incoming: `$${totalReceivable.toLocaleString()}`,
        outgoing: `$${totalPayable.toLocaleString()}`,
        safeToSpend: `$${safeToSpend.toLocaleString()}`,
        runway: available > 0 ? `${Math.round(available / Math.max(totalPayable, 1))} months` : "< 1 month",
        nextBigExpense: { name: "Next bill", amount: `$${totalPayable.toLocaleString()}`, date: "This month" },
      };
    },
    staleTime: isDemoMode ? Infinity : 15000,
  });
}

// ── Concierge Hooks ──
export function useHouseholdTasks() {
  return useSitaQuery("household-tasks", mockHouseholdTasks, "household_tasks", { orderBy: "created_at" });
}

export function useFamilyEvents() {
  return useSitaQuery("family-events", mockFamilyEvents, "events", { orderBy: "created_at" });
}

export function useGroceryList() {
  return useSitaQuery("grocery-list", mockGroceryList, "household_shared_items");
}

export function useTravel() {
  return useSitaQuery("travel", mockTravel, "bookings", { orderBy: "created_at" });
}

// ── Activity & Intelligence ──
export function useActivityStream() {
  return useSitaQuery("activity", mockActivity, "events", {
    orderBy: "created_at",
    refetchInterval: 10000,
  });
}

export function useOpportunityInsights() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["opportunity-insights", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockOpportunityInsights;
      if (!user) return [];
      const { data, error } = await fromTable("opportunities").select("*").order("created_at", { ascending: false }).limit(20);
      if (error || !data?.length) return mockOpportunityInsights;
      return data.map((o: any) => ({
        id: o.id,
        title: o.title,
        domain: "business",
        description: o.next_action || "Follow up",
        impact: (o.confidence || 0) > 70 ? "high" : "medium",
        savings: o.value ? `$${Number(o.value).toLocaleString()}` : "$0",
        confidence: o.confidence || 50,
      }));
    },
    staleTime: isDemoMode ? Infinity : 60000,
  });
}

// ── Memory ──
export function useMemoryItems() {
  return useSitaQuery("memory", mockMemoryItems, "events", { orderBy: "created_at" });
}

// ── Goals ──
export function useGoals() {
  const mockGoals = [
    { id: "G-001", title: "Stabilize monthly cash flow", domain: "money", target_value: 10000, current_value: 7200, unit: "USD", status: "active" },
    { id: "G-002", title: "Close 5 new clients this quarter", domain: "business", target_value: 5, current_value: 2, unit: "clients", status: "active" },
    { id: "G-003", title: "Reduce household task overdue rate", domain: "concierge", target_value: 0, current_value: 3, unit: "overdue tasks", status: "active" },
  ];
  return useSitaQuery("goals", mockGoals, "goals", { orderBy: "created_at" });
}

// ── Workflows ──
export function useWorkflows() {
  const mockWorkflows = [
    { id: "WF-001", name: "Lead Follow-Up Sequence", domain: "business", status: "active", trigger_type: "event", steps: [] },
    { id: "WF-002", name: "Bill Payment Automation", domain: "money", status: "active", trigger_type: "schedule", steps: [] },
    { id: "WF-003", name: "Weekly Family Sync", domain: "concierge", status: "paused", trigger_type: "schedule", steps: [] },
  ];
  return useSitaQuery("workflows", mockWorkflows, "workflow_runs", { orderBy: "created_at" });
}

// ── Policies ──
export function usePolicies() {
  const mockPolicies = [
    { id: "POL-001", name: "Auto-approve payments under $100", domain: "money", rule_type: "threshold", enabled: true },
    { id: "POL-002", name: "Require approval for new subscriptions", domain: "money", rule_type: "approval", enabled: true },
    { id: "POL-003", name: "Flag leads inactive > 48h", domain: "business", rule_type: "alert", enabled: true },
  ];
  return useSitaQuery("policies", mockPolicies, "policies", { orderBy: "created_at" });
}

// ── System ──
export function useAutomationRules() {
  return useSitaQuery("automation-rules", mockAutomationRules, "workflow_runs");
}

export function useSystemConnectors() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["system-connectors", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockConnectors;
      if (!user) return [];
      const { data } = await fromTable("connector_configs").select("*").limit(20);
      return data?.length ? data : [];
    },
    staleTime: isDemoMode ? Infinity : 30000,
  });
}

export function useAITeam() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ai-team", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockAITeam;
      if (!user) return [];
      const { data } = await fromTable("advisor_registry").select("*").limit(20);
      return data?.length ? data : [];
    },
  });
}

export function useIncidents() {
  return useSitaQuery("incidents", mockIncidents, "incidents", { orderBy: "created_at" });
}

export function useCosts() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["costs", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockCosts;
      if (!user) return mockCosts;
      const { data } = await fromTable("ai_cost_ledger").select("*").order("created_at", { ascending: false }).limit(50);
      if (!data?.length) return mockCosts;
      const totalCents = data.reduce((s: number, d: any) => s + (d.cost_cents || 0), 0);
      return {
        totalSpend: `$${(totalCents / 100).toFixed(2)}`,
        todaySpend: `$${(data.filter((d: any) => new Date(d.created_at).toDateString() === new Date().toDateString()).reduce((s: number, d: any) => s + (d.cost_cents || 0), 0) / 100).toFixed(2)}`,
        topModel: data[0]?.model || "gpt-4o",
        callCount: data.length,
      };
    },
  });
}

// ── Approvals (live-only, from existing hook) ──
export function useApprovals() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  const mockApprovals = [
    { id: "APR-001", action_summary: "Send follow-up email to Sarah Chen", status: "pending", created_at: "2026-04-02T10:00:00Z", proposed_action: { actions: [{ type: "send_email", description: "Follow-up email" }], confidence: 0.72 }, risk_level: "low", domain: "business" },
    { id: "APR-002", action_summary: "Auto-pay AWS hosting bill — $342", status: "pending", created_at: "2026-04-02T09:00:00Z", proposed_action: { actions: [{ type: "pay_bill", description: "Pay AWS bill" }], confidence: 0.95 }, risk_level: "medium", domain: "money" },
    { id: "APR-003", action_summary: "Cancel Adobe CC subscription — underused", status: "pending", created_at: "2026-04-01T15:00:00Z", proposed_action: { actions: [{ type: "cancel_subscription", description: "Cancel Adobe CC" }], confidence: 0.88 }, risk_level: "high", domain: "money" },
  ];

  return useQuery({
    queryKey: ["approvals", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockApprovals;
      if (!user) return [];
      // Read from canonical table directly (no phantom approval_queue)
      const { data, error } = await (supabase as any)
        .from("ai_workforce_approval_queue")
        .select("*, ai_workforce_recommendations(domain, severity, confidence, role_key, execution_required, flagship_loop_key, evidence)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[useApprovals] fetch failed:", error);
        return [];
      }
      // Map to the legacy shape the UI expects
      return (data ?? []).map((row: Record<string, any>) => {
        const rec = row.ai_workforce_recommendations || {};
        const priority: string = row.priority || "normal";
        const risk_level =
          priority === "urgent" || priority === "high" ? "high"
          : priority === "low" ? "low" : "medium";
        return {
          id: row.id,
          action_summary: row.title,
          status: row.status,
          created_at: row.created_at,
          decided_at: row.decision_at,
          decision_reason: row.reviewer_comments,
          domain: rec.domain || "general",
          action_type: rec.role_key || "system",
          risk_level,
          priority,
          recommendation_id: row.recommendation_id,
          execution_required: !!rec.execution_required,
          flagship_loop_key: rec.flagship_loop_key,
          evidence: row.evidence_links,
          cost_implications: row.cost_implications,
          launch_implications: row.launch_implications,
          proposed_action: {
            confidence: rec.confidence ?? 0.7,
            actions: [{ type: rec.role_key || "system", description: row.summary }],
          },
        };
      });
    },
    refetchInterval: isDemoMode ? undefined : 15000,
  });
}

// ── Proof Records ──
export function useProofRecords() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();

  const mockProof = [
    { id: "P-001", action_summary: "Invoice #1038 payment received", result: "completed", verification: "system-verified", category: "money", created_at: "2026-04-02T08:00:00Z", artifact: "Stripe payment confirmation — $4,200" },
    { id: "P-002", action_summary: "Quote #1042 sent to Sarah Chen", result: "completed", verification: "system-verified", category: "business", created_at: "2026-04-02T06:00:00Z", artifact: "Email delivery confirmed via SendGrid" },
    { id: "P-003", action_summary: "Callback completed: James Rodriguez", result: "completed", verification: "system-verified", category: "business", created_at: "2026-04-01T12:00:00Z", artifact: "Call log — 12 min duration, notes attached" },
    { id: "P-004", action_summary: "Rent transfer $2,400 initiated", result: "executing", verification: "pending", category: "money", created_at: "2026-04-01T10:00:00Z", artifact: "Bank transfer pending — Chase → Landlord" },
    { id: "P-005", action_summary: "AWS charge flagged — $180 anomaly", result: "escalated", verification: "pending", category: "money", created_at: "2026-03-31T14:00:00Z", artifact: "Cost anomaly report — 3x normal spend" },
  ];

  return useQuery({
    queryKey: ["proof-records", isDemoMode, user?.id],
    queryFn: async () => {
      if (isDemoMode) return mockProof;
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("proof_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    },
    refetchInterval: isDemoMode ? undefined : 30000,
  });
}

// ── Receipts ──
export function useReceipts() {
  const mockReceipts = [
    { id: "R-001", type: "payment_received", domain: "business", entity_id: "INV-1038", payload: { amount: 4200, method: "stripe" } },
    { id: "R-002", type: "bill_paid", domain: "finance", entity_id: "BILL-rent", payload: { amount: 2400, method: "ach" } },
    { id: "R-003", type: "subscription_renewed", domain: "finance", entity_id: "SUB-slack", payload: { amount: 62.50, service: "Slack" } },
  ];
  return useSitaQuery("receipts", mockReceipts, "proof_records", { orderBy: "created_at" });
}

// ── Execution Envelopes ──
export function useExecutionEnvelopes() {
  const mockEnvelopes = [
    { id: "EE-001", capability_id: "send_email", status: "completed", intent: { action: "follow_up", target: "Sarah Chen" } },
    { id: "EE-002", capability_id: "pay_bill", status: "pending", intent: { action: "auto_pay", target: "AWS" } },
  ];
  return useSitaQuery("execution-envelopes", mockEnvelopes, "execution_envelopes", { orderBy: "created_at" });
}

// ── Trust State ──
export function useTrustState() {
  const mockTrust = [
    { id: "TS-001", entity_type: "advisor", entity_id: "business-advisor", trust_level: "verified", score: 92 },
    { id: "TS-002", entity_type: "connector", entity_id: "stripe", trust_level: "verified", score: 98 },
    { id: "TS-003", entity_type: "advisor", entity_id: "finance-advisor", trust_level: "review", score: 78 },
  ];
  return useSitaQuery("trust-state", mockTrust, "metrics_snapshots", { orderBy: "snapshot_at" });
}

// ── Budgets ──
export function useBudgets() {
  const mockBudgets = [
    { id: "BU-001", category: "Infrastructure", allocated: 5000, spent: 3420, period: "monthly" },
    { id: "BU-002", category: "Marketing", allocated: 3000, spent: 1850, period: "monthly" },
    { id: "BU-003", category: "Operations", allocated: 8000, spent: 7200, period: "monthly" },
  ];
  return useSitaQuery("budgets", mockBudgets, "budgets", { orderBy: "created_at" });
}

// ── Council Decisions ──
export function useCouncilDecisions() {
  const mockDecisions = [
    { id: "CD-001", topic: "Q2 Revenue Strategy", council_type: "business", status: "decided", confidence: 0.87, recommendation: "Increase outbound cadence by 20%" },
    { id: "CD-002", topic: "Emergency Fund Allocation", council_type: "finance", status: "pending", confidence: 0.72, recommendation: "Redirect $500/mo from equipment to emergency" },
  ];
  return useSitaQuery("council-decisions", mockDecisions, "council_decisions", { orderBy: "created_at" });
}
