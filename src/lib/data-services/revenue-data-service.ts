import { supabase } from "@/integrations/supabase/client";
import {
  MOCK_LEAKAGE_INPUT, MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES
} from "@/lib/mock-data/revenue-autopilot";

export async function fetchRevenueLeakage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { leakage: MOCK_LEAKAGE_INPUT, recovered: MOCK_RECOVERED_VALUES, opportunities: MOCK_RAW_OPPORTUNITIES };

  // Revenue analytics from invoices
  const { data: invoices } = await supabase.from("invoices").select("*").eq("user_id", user.id);
  if (!invoices || invoices.length === 0) return { leakage: MOCK_LEAKAGE_INPUT, recovered: MOCK_RECOVERED_VALUES, opportunities: MOCK_RAW_OPPORTUNITIES };

  const overdue = invoices.filter((i: any) => i.status === "overdue");
  const leakage = overdue.map((i: any) => ({
    id: i.id, type: "overdue_invoice", amount: Number(i.amount || 0),
    source: i.customer_name || "Unknown", daysOpen: Math.floor((Date.now() - new Date(i.due_date).getTime()) / 864e5),
  }));

  return { leakage: leakage.length > 0 ? leakage : MOCK_LEAKAGE_INPUT, recovered: MOCK_RECOVERED_VALUES, opportunities: MOCK_RAW_OPPORTUNITIES };
}
