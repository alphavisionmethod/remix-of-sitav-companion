import { supabase } from "@/integrations/supabase/client";
import { MOCK_RESERVES_SAVINGS } from "@/lib/mock-data/reserves";

export async function fetchReservesSavings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_RESERVES_SAVINGS;

  const { data, error } = await supabase.from("capital_allocations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return MOCK_RESERVES_SAVINGS;

  return data.map((r: any) => ({
    id: r.id, name: r.category, current_amount: Number(r.amount),
    target_amount: Number(r.amount) * 1.5, category: r.category,
    contribution_amount: 0, notes: r.notes || "", auto_contribute: false, priority: 0,
  }));
}
