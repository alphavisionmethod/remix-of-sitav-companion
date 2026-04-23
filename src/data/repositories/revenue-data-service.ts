// SITA OS — Revenue Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

export interface LeakageItem { id: string; type: string; amount: number; source: string; daysOpen: number; }
export interface RecoveredValue { id: string; amount: number; source: string; recoveredAt: string; }
export interface RevenueOpportunity { id: string; title: string; estimatedValue: number; confidence: number; source: string; }
export interface RevenueBundle { leakage: LeakageItem[]; recovered: RecoveredValue[]; opportunities: RevenueOpportunity[]; }

const BUNDLE: RevenueBundle = {
  leakage: [
    { id: "lk1", type: "overdue_invoice", amount: 12500, source: "Atlas Corp", daysOpen: 15 },
    { id: "lk2", type: "underpriced_service", amount: 3200, source: "Consulting Rate Gap", daysOpen: 45 },
  ],
  recovered: [{ id: "rv1", amount: 8400, source: "Late payment — Meridian", recoveredAt: "2026-03-28" }],
  opportunities: [
    { id: "op1", title: "Upsell Atlas Corp to Enterprise", estimatedValue: 36000, confidence: 0.7, source: "Usage analysis" },
    { id: "op2", title: "Annual contract conversion", estimatedValue: 12000, confidence: 0.85, source: "Retention engine" },
  ],
};

export async function fetchRevenueLeakage(mode: RealityModeKey = "real"): Promise<ModeAwareResult<RevenueBundle>> {
  const emptyBundle: RevenueBundle = { leakage: [], recovered: [], opportunities: [] };
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: BUNDLE, emptyDefault: emptyBundle });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: BUNDLE, emptyDefault: emptyBundle });
  const { data: invoices } = await fromTable("invoices").select("*").eq("user_id", user.id);
  if (!invoices || invoices.length === 0) return resolveByMode({ mode, realData: null, demoData: BUNDLE, emptyDefault: emptyBundle });
  const overdue = invoices.filter((i: any) => i.status === "overdue");
  const leakage = overdue.map((i: any): LeakageItem => ({
    id: i.id, type: "overdue_invoice", amount: Number(i.amount || 0),
    source: i.customer_name || "Unknown", daysOpen: Math.floor((Date.now() - new Date(i.due_date).getTime()) / 864e5),
  }));
  const realBundle: RevenueBundle = { leakage, recovered: [], opportunities: [] };
  return resolveByMode({ mode, realData: realBundle, demoData: BUNDLE, emptyDefault: emptyBundle });
}
