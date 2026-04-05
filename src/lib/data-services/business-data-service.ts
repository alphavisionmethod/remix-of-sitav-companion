import { supabase } from "@/integrations/supabase/client";
import { MOCK_DEMO_CUSTOMERS, type MockCustomer } from "@/lib/mock-data/customers";
import { MOCK_COLLECTIONS_ACCOUNTS, type CollectionsAccount } from "@/lib/mock-data/collections";

export type { MockCustomer, CollectionsAccount };

export async function fetchCustomers(): Promise<MockCustomer[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_DEMO_CUSTOMERS;

  const { data, error } = await supabase.from("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_DEMO_CUSTOMERS;

  return data.map((c: any) => ({
    id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone,
    status: c.status, relationship_type: c.relationship_type, health_score: c.health_score,
    lifetime_revenue: c.lifetime_revenue ? Number(c.lifetime_revenue) : null,
    last_contact_at: c.last_contact_at, created_at: c.created_at, notes: c.notes,
  }));
}

export async function fetchCollectionsAccounts(): Promise<CollectionsAccount[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_COLLECTIONS_ACCOUNTS;

  const { data, error } = await supabase.from("invoices").select("*").eq("user_id", user.id).eq("status", "overdue");
  if (error || !data || data.length === 0) return MOCK_COLLECTIONS_ACCOUNTS;

  return data.map((inv: any) => ({
    id: inv.id, customer_name: inv.customer_name || "Unknown", invoice_number: inv.invoice_number || inv.id,
    amount_due: Number(inv.amount || 0), days_overdue: Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 864e5),
    status: inv.status, last_action: inv.updated_at, risk_level: Number(inv.amount || 0) > 5000 ? "high" : "medium",
  }));
}
