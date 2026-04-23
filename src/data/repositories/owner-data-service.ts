// SITA OS — Owner Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

// Re-export the rich types directly from mock-data for full compatibility
export type { OwnerApprovalItem, OwnerPricingItem } from "@/data/fixtures/mock-data/owner";
import type { OwnerApprovalItem, OwnerPricingItem } from "@/data/fixtures/mock-data/owner";
export interface LeaseItem {
  id: string; tenant: string; unit: string; rent: number;
  start_date: string; end_date: string; status: string;
}

const LEASES: LeaseItem[] = [
  { id: "l1", tenant: "TechHub Co", unit: "Suite 401", rent: 4200, start_date: "2025-01-01", end_date: "2027-12-31", status: "active" },
  { id: "l2", tenant: "Design Studio", unit: "Suite 102", rent: 2800, start_date: "2025-06-01", end_date: "2026-05-31", status: "active" },
];

export async function fetchLeases(mode: RealityModeKey = "real"): Promise<ModeAwareResult<LeaseItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: LEASES, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: LEASES, emptyDefault: [] });
  const { data, error } = await fromTable("deals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((d: any): LeaseItem => ({
    id: d.id, tenant: d.title || "Unknown", unit: d.stage || "N/A",
    rent: Number(d.value || 0), start_date: d.created_at,
    end_date: d.expected_close_date || d.created_at, status: d.status || "active",
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: LEASES, emptyDefault: [] });
}

export async function fetchOwnerApprovals(mode: RealityModeKey = "real"): Promise<ModeAwareResult<OwnerApprovalItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
  const { data, error } = await fromTable("approval_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((a: any): OwnerApprovalItem => ({
    id: a.id, title: a.action_summary, domain: a.action_type || "general",
    requestedBy: a.requested_by || "System", riskTier: (a.risk_tier || "medium") as OwnerApprovalItem["riskTier"],
    status: a.status as OwnerApprovalItem["status"], requestedAt: a.created_at,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: [] as any[], emptyDefault: [] });
}

export async function fetchPricingItems(mode: RealityModeKey = "real"): Promise<ModeAwareResult<OwnerPricingItem[]>> {
  return resolveByMode({ mode, realData: null, demoData: [] as any[], emptyDefault: [] });
}
