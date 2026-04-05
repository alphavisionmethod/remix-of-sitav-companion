// SITA OS — Money Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

export interface ReserveSaving {
  id: string; name: string; current_amount: number; target_amount: number;
  category: string; contribution_amount: number; notes: string;
  auto_contribute: boolean; priority: number;
}

const DEMO_RESERVES: ReserveSaving[] = [
  { id: "r1", name: "Emergency Fund", current_amount: 50000, target_amount: 75000, category: "emergency", contribution_amount: 2000, notes: "6-month runway", auto_contribute: true, priority: 1 },
  { id: "r2", name: "Tax Reserve", current_amount: 18000, target_amount: 25000, category: "tax", contribution_amount: 1500, notes: "Q2 estimated payments", auto_contribute: true, priority: 2 },
  { id: "r3", name: "Opportunity Fund", current_amount: 32000, target_amount: 50000, category: "opportunity", contribution_amount: 3000, notes: "Deal-ready capital", auto_contribute: false, priority: 3 },
];

export async function fetchReservesSavings(mode: RealityModeKey = "real"): Promise<ModeAwareResult<ReserveSaving[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: DEMO_RESERVES, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: DEMO_RESERVES, emptyDefault: [] });
  const { data, error } = await supabase.from("capital_allocations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((r: any): ReserveSaving => ({
    id: r.id, name: r.category, current_amount: Number(r.amount), target_amount: Number(r.amount) * 1.5,
    category: r.category, contribution_amount: 0, notes: r.notes || "", auto_contribute: false, priority: 0,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: DEMO_RESERVES, emptyDefault: [] });
}
