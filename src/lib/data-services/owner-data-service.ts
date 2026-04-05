import { supabase } from "@/integrations/supabase/client";
import { MOCK_DEMO_LEASES } from "@/lib/mock-data/lease-dashboard";
import { MOCK_OWNER_APPROVALS, type OwnerApprovalItem } from "@/lib/mock-data/owner";
import { MOCK_PRICING_ITEMS, type OwnerPricingItem } from "@/lib/mock-data/owner";

export type { OwnerApprovalItem, OwnerPricingItem };

export async function fetchLeases() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_DEMO_LEASES;

  const { data, error } = await supabase.from("deals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_DEMO_LEASES;

  return data.map((d: any) => ({
    id: d.id, tenant: d.title || "Unknown", unit: d.stage || "N/A",
    rent: Number(d.value || 0), start_date: d.created_at,
    end_date: d.expected_close_date || d.created_at, status: d.status || "active",
  }));
}

export async function fetchOwnerApprovals(): Promise<OwnerApprovalItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_OWNER_APPROVALS;

  const { data, error } = await supabase.from("approval_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_OWNER_APPROVALS;

  return data.map((a: any) => ({
    id: a.id, title: a.action_summary, category: a.action_type || "general",
    urgency: "medium" as "low" | "medium" | "high" | "critical",
    requested_at: a.created_at, summary: a.action_summary,
    amount_cents: undefined, status: a.status,
  }));
}

export async function fetchPricingItems(): Promise<OwnerPricingItem[]> {
  return MOCK_PRICING_ITEMS; // Pricing is config, stays local until dedicated table
}
