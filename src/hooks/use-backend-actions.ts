// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Action Hooks
// Typed hooks for all domain edge functions.
// Each returns a useMutation or useQuery calling supabase.functions.invoke.
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────

function isDemoSession(): boolean {
  return localStorage.getItem("sita-demo-session") === "true";
}

async function invokeEdge<T = unknown>(name: string, body: Record<string, unknown>): Promise<T> {
  // In demo mode there's no real auth token — return empty mock data
  if (isDemoSession()) {
    console.log(`[demo] Skipping edge call: ${name}`);
    return {} as T;
  }

  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const status = (error as Record<string, unknown>)?.status;
    if (status === 429) throw new Error("Rate limited — try again in a moment.");
    if (status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
    throw new Error(error.message || "Edge function error");
  }
  return data as T;
}

// ── CRM Sync ────────────────────────────────────────────────────

export function useCRMSync() {
  const qc = useQueryClient();
  const syncLeads = useMutation({
    mutationFn: (leads: Array<{ name: string; email?: string; phone?: string; source?: string; status?: string }>) =>
      invokeEdge("crm-sync", { action: "sync-leads", leads }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); toast.success("Leads synced"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const syncCustomers = useMutation({
    mutationFn: (customers: Array<{ name: string; email: string; phone?: string; company?: string }>) =>
      invokeEdge("crm-sync", { action: "sync-customers", customers }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customers synced"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const syncOpportunities = useMutation({
    mutationFn: (opportunities: Array<{ title: string; customer_id: string; value_cents?: number; stage?: string; probability?: number }>) =>
      invokeEdge("crm-sync", { action: "sync-opportunities", opportunities }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["opportunities"] }); toast.success("Opportunities synced"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const healthCheck = useQuery({
    queryKey: ["crm-health"],
    queryFn: () => invokeEdge("crm-sync", { action: "health-check" }),
    staleTime: 60000,
  });
  return { syncLeads, syncCustomers, syncOpportunities, healthCheck };
}

// ── Cashflow Calculate ──────────────────────────────────────────

export interface CashflowAnalyzeResult {
  total_liquid_cents: number;
  total_receivable_cents: number;
  overdue_cents: number;
  overdue_count: number;
  inflows_30d_cents: number;
  net_position_cents: number;
  accounts_count: number;
  calculation: string;
}

export interface CashflowForecastResult {
  current_liquid_cents: number;
  forecast: Array<{ period: string; expected_inflow_cents: number; invoice_count: number }>;
  total_expected_cents: number;
  horizon_days: number;
  calculation: string;
}

export function useCashflowAnalysis() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  return useQuery<CashflowAnalyzeResult>({
    queryKey: ["cashflow-analysis", user?.id],
    queryFn: () => invokeEdge("cashflow-calculate", { action: "analyze" }),
    enabled: !!user && !isDemoMode,
    staleTime: 30000,
    retry: 1,
  });
}

export function useCashflowForecast(horizonDays = 90) {
  const { user } = useAuth();
  return useQuery<CashflowForecastResult>({
    queryKey: ["cashflow-forecast", user?.id, horizonDays],
    queryFn: () => invokeEdge("cashflow-calculate", { action: "forecast", horizon_days: horizonDays }),
    enabled: !!user && !isDemoMode,
    staleTime: 60000,
    retry: 1,
  });
}

export interface SafeToSpendResult {
  safe_to_spend_cents: number;
  liquid_balance_cents: number;
  reserved_cents: number;
  upcoming_bills_cents: number;
  calculation: string;
}

export function useSafeToSpend(reserveTargetCents = 0) {
  const { user } = useAuth();
  return useQuery<SafeToSpendResult>({
    queryKey: ["safe-to-spend", user?.id, reserveTargetCents],
    queryFn: () => invokeEdge<SafeToSpendResult>("cashflow-calculate", { action: "safe-to-spend", reserve_target_cents: reserveTargetCents }),
    enabled: !!user && !isDemoMode,
    staleTime: 30000,
  });
}

export interface BurnRateResult {
  monthly_burn_cents: number;
  runway_months: number;
  avg_daily_spend_cents: number;
  trend: string;
  calculation: string;
}

export function useBurnRate() {
  const { user } = useAuth();
  return useQuery<BurnRateResult>({
    queryKey: ["burn-rate", user?.id],
    queryFn: () => invokeEdge<BurnRateResult>("cashflow-calculate", { action: "burn-rate" }),
    enabled: !!user && !isDemoMode,
    staleTime: 60000,
  });
}

// ── Invoice Generate ────────────────────────────────────────────

export function useInvoiceGenerate() {
  return useMutation({
    mutationFn: (params: {
      action: "generate";
      invoice_id: string;
      format?: "pdf" | "html";
      template?: string;
    }) => invokeEdge("invoice-generate", params),
    onSuccess: () => toast.success("Invoice generated"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInvoiceSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { action: "send"; invoice_id: string; delivery_method?: string; recipient_email?: string }) =>
      invokeEdge("invoice-generate", params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Invoice sent"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Tax Estimate ────────────────────────────────────────────────

export interface TaxEstimateResult {
  federal_tax_cents: number;
  se_tax_cents: number;
  total_tax_cents: number;
  effective_rate: number;
  marginal_rate?: number;
  quarterly_payment_cents: number;
  quarterly_estimates?: number[];
  gross_income_cents?: number;
  next_deadline: string;
  period: string;
  calculation: string;
  [key: string]: unknown; // allow additional fields from edge function
}

export interface TaxDeductionsResult {
  total_deductions_cents: number;
  items: Array<{ category: string; amount_cents: number; description?: string; type?: string }>;
  deductions?: Array<{ category: string; amount_cents: number; type?: string }>;
  calculation: string;
  [key: string]: unknown;
}

export function useTaxEstimate(period: "quarterly" | "annual" = "quarterly") {
  const { user } = useAuth();
  return useQuery<TaxEstimateResult>({
    queryKey: ["tax-estimate", user?.id, period],
    queryFn: () => invokeEdge<TaxEstimateResult>("tax-estimate", { action: "estimate", period }),
    enabled: !!user,
    staleTime: 120000,
    retry: 1,
  });
}

export function useTaxDeductions() {
  const { user } = useAuth();
  return useQuery<TaxDeductionsResult>({
    queryKey: ["tax-deductions", user?.id],
    queryFn: () => invokeEdge<TaxDeductionsResult>("tax-estimate", { action: "deductions" }),
    enabled: !!user,
    staleTime: 120000,
  });
}

// ── Booking Manage ──────────────────────────────────────────────

export function useBookingCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      title: string;
      booking_type: string;
      start_date: string;
      end_date?: string;
      notes?: string;
      metadata?: Record<string, unknown>;
    }) => invokeEdge("booking-manage", { action: "create", ...params }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["travel"] }); toast.success("Booking created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBookingUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { booking_id: string; updates: Record<string, unknown> }) =>
      invokeEdge("booking-manage", { action: "update", ...params }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["travel"] }); toast.success("Booking updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBookingCancel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { booking_id: string; reason?: string }) =>
      invokeEdge("booking-manage", { action: "cancel", ...params }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["travel"] }); toast.success("Booking cancelled"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBookingList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings-backend", user?.id],
    queryFn: () => invokeEdge("booking-manage", { action: "list" }),
    enabled: !!user,
    staleTime: 30000,
  });
}

// ── AI Gateway (direct) ─────────────────────────────────────────

export function useAIInsight() {
  return useMutation({
    mutationFn: async (params: {
      intent: string;
      domain: string;
      context?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke("brain-core", {
        body: {
          intent: params.intent,
          advisor: params.domain,
          context: params.context || {},
        },
      });
      if (error) throw new Error(error.message || "Brain Core error");
      return data;
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
