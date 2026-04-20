// ============================================================
// SITA OS — Boardroom Data Service
// Fetches real data from Supabase for boardroom assessments
// Falls back to legacy mocks when no auth/data available
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import * as legacyMocks from "@/data/fixtures/mock-data/legacy-display-mocks";

export interface BoardroomDataBundle {
  leads: typeof legacyMocks.mockLeads;
  invoices: typeof legacyMocks.mockInvoices;
  cashFlow: typeof legacyMocks.mockCashFlow;
  bills: typeof legacyMocks.mockBills;
  subscriptions: typeof legacyMocks.mockSubscriptions;
  householdTasks: typeof legacyMocks.mockHouseholdTasks;
  familyEvents: typeof legacyMocks.mockFamilyEvents;
  incidents: typeof legacyMocks.mockIncidents;
  opportunityInsights: typeof legacyMocks.mockOpportunityInsights;
  dataFreshness: Record<string, string>; // domain → ISO timestamp
  isLiveData: boolean;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

async function fetchLeads() {
  const { data } = await fromTable("leads").select("*").order("created_at", { ascending: false }).limit(20);
  if (!data || data.length === 0) return null;
  return data.map(l => ({
    id: l.id.substring(0, 8),
    name: l.name,
    company: l.company ?? "",
    source: l.source ?? "Unknown",
    status: l.status === "new" ? "new" : l.status === "contacted" ? "contacted" : l.status === "qualified" ? "qualified" : "cooling",
    score: l.opportunity_score ?? 50,
    value: `$${(l.likely_value ?? 0).toLocaleString()}`,
    lastTouch: l.last_contact_at ? new Date(l.last_contact_at).toLocaleDateString() : "Unknown",
    nextAction: l.next_action ?? "Follow up",
  }));
}

async function fetchInvoices() {
  const { data } = await fromTable("invoices").select("*").order("due_date", { ascending: true }).limit(20);
  if (!data || data.length === 0) return null;
  return data.map(i => ({
    id: i.invoice_number ?? `INV-${i.id.substring(0, 3).toUpperCase()}`,
    client: i.customer_id ?? "Unknown",
    amount: `$${(i.amount ?? 0).toLocaleString()}`,
    status: i.status as string,
    dueDate: i.due_date ? new Date(i.due_date).toLocaleDateString() : "N/A",
    paidDate: i.status === "paid" ? new Date(i.updated_at).toLocaleDateString() : null,
  }));
}

async function fetchBills() {
  const { data } = await fromTable("bills").select("*").order("due_date", { ascending: true }).limit(20);
  if (!data || data.length === 0) return null;
  return data.map(b => ({
    id: `B-${b.id.substring(0, 3).toUpperCase()}`,
    name: b.payee,
    amount: `$${b.amount.toLocaleString()}`,
    dueDate: new Date(b.due_date).toLocaleDateString(),
    status: b.status as string,
    recurring: b.recurring ?? false,
    category: b.category ?? "Other",
  }));
}

async function fetchIncidents() {
  const { data } = await fromTable("incidents").select("*").order("created_at", { ascending: false }).limit(10);
  if (!data || data.length === 0) return null;
  return data.map(i => ({
    id: `INC-${i.id.substring(0, 3).toUpperCase()}`,
    title: i.title,
    severity: (i.severity ?? "low") as string,
    status: i.status as string,
    time: new Date(i.created_at).toLocaleDateString(),
    impact: (i.description ?? "").substring(0, 80),
  }));
}

export async function fetchBoardroomData(): Promise<BoardroomDataBundle> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      leads: legacyMocks.mockLeads,
      invoices: legacyMocks.mockInvoices,
      cashFlow: legacyMocks.mockCashFlow,
      bills: legacyMocks.mockBills,
      subscriptions: legacyMocks.mockSubscriptions,
      householdTasks: legacyMocks.mockHouseholdTasks,
      familyEvents: legacyMocks.mockFamilyEvents,
      incidents: legacyMocks.mockIncidents,
      opportunityInsights: legacyMocks.mockOpportunityInsights,
      dataFreshness: {},
      isLiveData: false,
    };
  }

  const now = new Date().toISOString();
  const [leads, invoices, bills, incidents] = await Promise.all([
    fetchLeads(),
    fetchInvoices(),
    fetchBills(),
    fetchIncidents(),
  ]);

  const hasAnyLiveData = !!(leads || invoices || bills || incidents);

  return {
    leads: leads ?? legacyMocks.mockLeads,
    invoices: invoices ?? legacyMocks.mockInvoices,
    cashFlow: legacyMocks.mockCashFlow, // No dedicated cashflow table yet — stays mock
    bills: bills ?? legacyMocks.mockBills,
    subscriptions: legacyMocks.mockSubscriptions, // No subscriptions table yet
    householdTasks: legacyMocks.mockHouseholdTasks, // No household tasks table yet
    familyEvents: legacyMocks.mockFamilyEvents, // No family events table yet
    incidents: incidents ?? legacyMocks.mockIncidents,
    opportunityInsights: legacyMocks.mockOpportunityInsights, // Narrative — stays mock
    dataFreshness: {
      leads: leads ? now : "",
      invoices: invoices ? now : "",
      bills: bills ? now : "",
      incidents: incidents ? now : "",
    },
    isLiveData: hasAnyLiveData,
  };
}
